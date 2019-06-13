import Column, {ColumnTSType, isColumn} from "./Column";
import ColumnWrapper from "./ColumnWrapper";
import Table, {isTable} from "./Table";
import {assignGetters, itisa} from "./util";

class TableWrapperClass<TableName extends string, T extends Table> {
  $columns: TableWrapperColumns<T>;

  get $_iama() {
    return "TableWrapper";
  }

  constructor(public $tableName: TableName, public $table: T) {
    if (!(isTable($table))) {
      const reprstr = itisa($table) || typeof $table;
      throw new Error(`In TableWrapper, $table must be a Table (got ${reprstr}).`)
    }
    // I don't see a way to do this that appeases TypeScript.
    this.$columns = Object.fromEntries(
      Object.entries($table).map(
        ([columnName, column]) => {
          if (!isColumn(column)) {
            return [];
          }
          return [
            columnName,
            ColumnWrapper($table, columnName, column as any),
          ];
        },
      ).filter((x) => x.length > 0)
    ) as any;
    assignGetters(this, this.$columns);
  }

  $getColumns():Array<ColumnWrapper<any, any>> {
    return Object.entries(this.$columns).map(([_, column]) => column);
  }

  $creationSQL() {
    return (
      `CREATE TABLE ${this.$table.$getTableDBName(this.$tableName)} (\n`
      + this.$getColumns()
        .map((column) => column.$creationSQL())
        .map((sql) => `  ${sql}`)
        .join(`,\n`)
      + `\n);`
    );
  }
}

export type TableWrapperColumns<T> = {
  [k in (keyof T & string)]: T[k] extends Column<any> ? ColumnWrapper<k, ColumnTSType<T[k]>> : never
}

type TableWrapper<TableName extends string, T extends Table> =
  TableWrapperClass<TableName, T> & TableWrapperColumns<T>;
function TableWrapper<N extends string, T extends Table>(
    tableName: N,
    table: T
): TableWrapper<N, T> {
  return new TableWrapperClass<N, T>(tableName, table) as any;
}

export default TableWrapper;

export function isTableWrapper(x: unknown): x is TableWrapper<string, Table> {
  return itisa(x) === "TableWrapper";
}