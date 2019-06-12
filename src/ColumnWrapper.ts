/**
 * A wrapper around a column in a table.
 *
 * This is used in the implementation of the codebase. It is necessary because
 * the `Column` doesn't have access to things like the table name.
 */
import Column from "./Column";
import Table from "./Table";

class ColumnWrapperClass<N extends string, T> {
  $_type?: T;

  constructor(
    public $table: Table,
    public $columnName: string,
    public $column: Column<T>,
  ) {}

  $creationSQL() {
    const {$columnName, $column} = this;
    return `${$columnName} ${$column.$creationSQL()}`;
  }
}

type ColumnWrapper<N extends string, T> = ColumnWrapperClass<N, T>;
function ColumnWrapper<N extends string, T>(
    $table: Table,
    $columnName: string,
    $column: Column<T>,
) {
  return new ColumnWrapperClass<N, T>($table, $columnName, $column);
}
export default ColumnWrapper;

export type ColumnWrapperTSType<W extends ColumnWrapperClass<any, any>> = Exclude<W["$_type"], undefined>