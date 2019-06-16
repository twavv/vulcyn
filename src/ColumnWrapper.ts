/**
 * A wrapper around a column in a table.
 *
 * This is used in the implementation of the codebase. It is necessary because
 * the `Column` doesn't have access to things like the table name.
 */

import { itisa } from "@/utils";
import { Column, isColumn, Table, TableWrapper } from "@";
import { Infix, Parameter, SQLFragment } from "@/expr";

class ColumnWrapperImpl<N extends string, T, IT> {
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
      throw new Error(
        `In ColumnWrapper, $column must be a Column (got ${reprstr}).`,
      );
    }
  }

  get $tableName() {
    return this.$table.$tableName;
  }

  $creationExpr() {
    return this.$column.$creationExpr(this.$columnName);
  }

  // Methods for WHERE query generation
  eq(t: T) {
    return new Infix("=", new SQLFragment(this.$columnName), new Parameter(t));
  }
}

export type ColumnWrapper<N extends string, T, IT = T> = ColumnWrapperImpl<
  N,
  T,
  IT
>;
export function ColumnWrapper<N extends string, T, IT = T>(
  $table: TableWrapper<string, Table>,
  $columnName: string,
  $column: Column<T, IT>,
) {
  return new ColumnWrapperImpl<N, T, IT>($table, $columnName, $column);
}

export type ColumnWrapperTSType<
  W extends ColumnWrapperImpl<any, any, any>
> = W["$_type"];
export type ColumnWrapperTSInsertionType<
  W extends ColumnWrapperImpl<any, any, any>
> = W["$_insertionType"];

export function isColumnWrapper(x: any): x is ColumnWrapper<string, unknown> {
  return x.$_iama == "ColumnWrapper";
}
