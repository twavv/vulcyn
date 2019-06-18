import {
  Column,
  ColumnTSInsertionType,
  ColumnTSType,
  ColumnWrapper,
  Database,
  isColumn,
  isTable,
  Table,
  TableColumns,
} from "@";
import { assignGetters, itisa } from "@/utils";
import { CreateTable, ReductionContext, SQLFragment } from "@/expr";

export class TableWrapperClass<
  TableName extends string = string,
  T extends Table = Table
> {
  $columns: TableWrapperColumns<T>;

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
   * Flag to mark a TableWrapper as "visited" when it is created.
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
    public $tableName: TableName,
    public $table: T,
  ) {
    if (!isTable($table)) {
      const reprstr = itisa($table) || typeof $table;
      throw new Error(
        `In TableWrapper, $table must be a Table (got ${reprstr}).`,
      );
    }
    // I don't see a way to do this that appeases TypeScript.
    this.$columns = Object.fromEntries(
      Object.entries($table)
        .map(([columnName, column]) => {
          if (!isColumn(column)) {
            return [];
          }
          return [columnName, ColumnWrapper(this.$, columnName, column as any)];
        })
        .filter((x) => x.length > 0),
    ) as any;
    assignGetters(this, this.$columns);
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

  $getColumnByName(name: string): ColumnWrapper<string, unknown> {
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
      tableName: new SQLFragment(this.$tableName),
      columns: this.$columnsExprs(),
    });
  }

  $creationSQL(rc?: ReductionContext): string {
    return this.$creationExpr().toSQL(rc || new ReductionContext());
  }

  private $columnsExprs() {
    return this.$getColumns().map((column) => column.$creationExpr());
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
export function TableWrapper<N extends string, T extends Table>(
  db: Database,
  tableName: N,
  table: T,
): TableWrapper<N, T> {
  return new TableWrapperClass<N, T>(db, tableName, table) as any;
}

export function isTableWrapper(x: unknown): x is TableWrapper<string, Table> {
  return itisa(x) === "TableWrapper";
}
