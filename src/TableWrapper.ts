import {
  Column,
  ColumnTSInsertionType,
  ColumnTSType,
  ColumnWrapper,
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

  get $_iama() {
    return "TableWrapper";
  }

  private get $() {
    return this as (this & TableWrapper<TableName, T>);
  }

  constructor(public $tableName: TableName, public $table: T) {
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

  $getColumns(): Array<ColumnWrapper<string, unknown>> {
    return Object.entries(this.$columns).map(
      ([_, column]) => column as ColumnWrapper<string, unknown>,
    );
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
  TableName extends string,
  T extends Table
> = TableWrapperClass<TableName, T> & TableWrapperColumns<T>;
export function TableWrapper<N extends string, T extends Table>(
  tableName: N,
  table: T,
): TableWrapper<N, T> {
  return new TableWrapperClass<N, T>(tableName, table) as any;
}

export function isTableWrapper(x: unknown): x is TableWrapper<string, Table> {
  return itisa(x) === "TableWrapper";
}
