/**
 * A wrapper around a column in a table.
 *
 * This is used in the implementation of the codebase. It is necessary because
 * the `Column` doesn't have access to things like the table name.
 */
import Column, {isColumn} from "./Column";
import Table from "./Table";
import {itisa} from "./util";
import TableWrapper from "./TableWrapper";
import SQLFragment from "./SQLFragment";

class ColumnWrapperClass<N extends string, T> {
  get $_iama() {
    return "ColumnWrapper";
  }
  $_type?: T;

  constructor(
    public $table: TableWrapper<any, any>,
    public $columnName: string,
    public $column: Column<T>,
  ) {
    if (!isColumn($column)) {
      const reprstr = itisa($column) || typeof $column;
      throw new Error(`In ColumnWrapper, $column must be a Column (got ${reprstr}).`)
    }
  }

  get $tableName() {
    return this.$table.$tableName;
  }

  $creationSQL() {
    const {$columnName, $column} = this;
    return `${$columnName} ${$column.$creationSQL()}`;
  }

  // Methods for WHERE query generation
  eq(t: T) {
    // TODO TODO TODO TODO TODO
    // NO SQL INJECTION IN THIS HOUSE
    return new SQLFragment(`${this.$columnName} = '${t}'`);
  }
}

type ColumnWrapper<N extends string, T> = ColumnWrapperClass<N, T>;
function ColumnWrapper<N extends string, T>(
    $table: TableWrapper<any, any>,
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