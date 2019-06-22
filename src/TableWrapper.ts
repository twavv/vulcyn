import {
  Column,
  ColumnTSInsertionType,
  ColumnTSType,
  ColumnWrapper,
  Constraint,
  createColumnWrapper,
  Database,
  isColumn,
  isConstraint,
  isTable,
  Table,
  TableColumns,
} from "@";
import { assignGetters, itisa } from "@/utils";
import {
  CreateTable,
  Expr,
  FromItem,
  Join,
  JoinType,
  ReductionContext,
  SQLFragment,
} from "@/expr";
import { assertSQLSafeIdentifier, camel2snake } from "@/utils/identifiers";

export class TableWrapperClass<
  TableName extends string = string,
  T extends Table = Table
> {
  $tableName: SQLFragment;
  $columns: TableWrapperColumns<T>;
  $constraints: { [name: string]: Constraint };

  /**
   * The set of tables that this table references with foreign key constraints.
   *
   * References are added by child ColumnWrapper's and ultimately this set of
   * references is used by the Database class to construct a DAG of table
   * dependencies (so that tables with foreign keys are created *after* the
   * tables that they reference).
   */
  $references: Set<TableWrapper> = new Set();

  /**
   * Flag to mark a createTableWrapper as "visited" when it is created.
   *
   * This is used to avoid creating a table multiple times if multiple tables
   * reference this table.
   */
  $wasCreated: boolean = false;

  get $_iama() {
    return "TableWrapper";
  }

  private get $() {
    return this as (this & TableWrapper<TableName, T>);
  }

  constructor(
    public $db: Database<{}>,
    public $tablePropName: TableName,
    public $table: T,
  ) {
    if (!isTable($table)) {
      const reprstr = itisa($table) || typeof $table;
      throw new Error(
        `In TableWrapper, $table must be a Table (got ${reprstr}).`,
      );
    }
    this.$tableName = new SQLFragment(
      camel2snake(assertSQLSafeIdentifier($tablePropName)),
    );

    // I don't see a way to do this that appeases TypeScript.
    const columns: { [name: string]: ColumnWrapper<string, Table> } = {};
    const constraints: { [name: string]: Constraint } = {};
    Object.entries($table).forEach(([name, value]) => {
      if (isColumn(value)) {
        columns[name] = createColumnWrapper(this.$, name, value as any);
      } else if (isConstraint(value)) {
        constraints[name] = value;
      }
    });

    this.$columns = columns as any;
    this.$constraints = constraints;
    assignGetters(this, this.$columns);
  }

  join(fromItem: TableWrapper<string, Table> | FromItem, on: Expr<string>) {
    return this.$joinImpl(JoinType.INNER, fromItem, on);
  }

  private $joinImpl(
    type: JoinType,
    fromItem: TableWrapper<string, Table> | FromItem,
    on: Expr<string>,
  ): FromItem {
    const fromExpr = isTableWrapper(fromItem) ? fromItem.$tableName : fromItem;
    return new FromItem(this.$tableName, new Join(type, fromExpr, on));
  }

  /**
   * Perform post-construction initialization steps.
   *
   * This is executed after the constructor to ensure that all the tables are
   * registered with the Database instance (this is required to implement
   * FOREIGN KEY constraints and to add the appropriate tables to the
   * $references set).
   */
  $prepare() {
    this.$getColumns().forEach((column) => column.$prepare());
  }

  /**
   * Get a column wrapper given the property name of a column.
   */
  $getColumnWrapper(name: string): ColumnWrapper<string, unknown> {
    if (name in this.$columns) {
      return (this.$columns as any)[name];
    }
    throw new Error(`Unknown column in table ${this.$tableName}: ${name}.`);
  }

  $getColumns(): Array<ColumnWrapper<string, unknown>> {
    return Object.values(this.$columns);
  }

  $addReference(table: typeof Table) {
    this.$references.add(this.$db.$getTableWrapperForTable(table));
    return this;
  }

  $creationExpr() {
    return new CreateTable({
      tableName: this.$tableName,
      columns: this.$columnsExprs(),
      constraints: this.$constraintExprs(),
    });
  }

  $creationSQL(rc?: ReductionContext): string {
    return this.$creationExpr().toSQL(rc || new ReductionContext());
  }

  private $columnsExprs() {
    return this.$getColumns().map((column) => column.$creationExpr());
  }

  private $constraintExprs(): Array<Expr> {
    return Object.entries(this.$constraints).map(([name, constraint]) =>
      constraint.$creationExpr(this.$, name),
    );
  }
}

/**
 * The interface of $columns in TableWrapper.
 * TableWrapper itself implements this interface.
 *
 * NOTE: There's an unnecessary conditional type (ternary) here because TS can't
 *    quite figure out that C[K] extends Column<any> even though it always does
 *    by the definition of TableColumns<T>.
 */
export type TableWrapperColumns<
  T extends Table,
  C extends TableColumns<T> = TableColumns<T>
> = {
  [K in keyof C & string]: C[K] extends Column<any>
    ? ColumnWrapper<K, ColumnTSType<C[K]>, ColumnTSInsertionType<C[K]>>
    : never;
};

export type TableWrapper<
  TableName extends string = string,
  T extends Table = Table
> = TableWrapperClass<TableName, T> & TableWrapperColumns<T>;
export function createTableWrapper<N extends string, T extends Table>(
  db: Database,
  tableName: N,
  table: T,
): TableWrapper<N, T> {
  return new TableWrapperClass<N, T>(db, tableName, table) as any;
}

export function isTableWrapper(x: unknown): x is TableWrapper<string, Table> {
  return itisa(x) === "TableWrapper";
}
