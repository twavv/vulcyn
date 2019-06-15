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
import SQLFragment from "./expr/SQLFragment";

class ColumnWrapperClass<N extends string, T, IT> {
  get $_iama() {
    return "ColumnWrapper";
  }
  $_type!: T;
  $_insertionType!: IT;

  constructor(
    public $table: TableWrapper<string, Table>,
    public $columnName: string,
    public $column: Column<T, IT>,
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

type ColumnWrapper<N extends string, T, IT=T> = ColumnWrapperClass<N, T, IT>;
function ColumnWrapper<N extends string, T, IT=T>(
    $table: TableWrapper<string, Table>,
    $columnName: string,
    $column: Column<T, IT>,
) {
  return new ColumnWrapperClass<N, T, IT>($table, $columnName, $column);
}
export default ColumnWrapper;

export type ColumnWrapperTSType<
    W extends ColumnWrapperClass<any, any, any>
> = W["$_type"];
export type ColumnWrapperTSInsertionType<
    W extends ColumnWrapperClass<any, any, any>
> = W["$_insertionType"];

export function isColumnWrapper(x: any): x is ColumnWrapper<string, unknown> {
  return x.$_iama == "ColumnWrapper";
}