/**
 * A wrapper around a column in a table.
 *
 * This is used in the implementation of the codebase. It is necessary because
 * the `Column` doesn't have access to things like the table name.
 */
import Column, {isColumn} from "./Column";
import Table from "./Table";
import {itisa} from "./util";

class ColumnWrapperClass<N extends string, T> {
  get $_iama() {
    return "ColumnWrapper";
  }
  $_type?: T;

  constructor(
    public $table: Table,
    public $columnName: string,
    public $column: Column<T>,
  ) {
    if (!isColumn($column)) {
      const reprstr = itisa($column) || typeof $column;
      throw new Error(`In ColumnWrapper, $column must be a Column (got ${reprstr}).`)
    }
  }

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

export function isColumnWrapper(x: any): x is ColumnWrapper<string, unknown> {
  return x.$_iama == "ColumnWrapper";
}