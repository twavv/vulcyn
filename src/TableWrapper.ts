import Column, {ColumnTSType} from "./Column";
import ColumnWrapper from "./ColumnWrapper";
import Table from "./Table";
import {assignGetters} from "./util";

class TableWrapperClass<TableName extends string, T extends Table> {
  $columns: TableWrapperColumns<T>;

  constructor(private $tableName: TableName, private $table: T) {
    // I don't see a way to do this that appeases TypeScript.
    this.$columns = Object.fromEntries(Object.entries($table).map(
      ([columnName, column]) => {
        return [
          columnName,
          ColumnWrapper($table, columnName, column as any),
        ];
      },
    )) as any;

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