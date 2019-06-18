/**
 * A wrapper around a column in a table.
 *
 * This is used in the implementation of the codebase. It is necessary because
 * the `Column` doesn't have access to things like the table name.
 */

import { itisa } from "@/utils";
import { Column, isColumn, Table, TableWrapper } from "@";
import { ColumnReference, CreateTableColumn, Infix, Parameter } from "@/expr";

type Comparable<T> = T | ColumnWrapper<string, T, any>;
class ColumnWrapperImpl<N extends string, T, IT> {
  $_type!: T;
  $_insertionType!: IT;
  get $_iama() {
    return "ColumnWrapper";
  }

  get $db() {
    return this.$tableWrapper.$db;
  }

  get $tableName() {
    return this.$tableWrapper.$tableName;
  }

  constructor(
    public $tableWrapper: TableWrapper<string, Table>,
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

  $prepare() {
    this.$column.$prepare(this);
  }

  $creationExpr(): CreateTableColumn {
    return this.$column.$creationExpr(this, this.$columnName);
  }

  // Methods for WHERE query generation
  eq(t: Comparable<T>) {
    return this.$comparison("=", t);
  }

  gt(t: Comparable<T>) {
    return this.$comparison(">", t);
  }

  gte(t: Comparable<T>) {
    return this.$comparison(">=", t);
  }

  lt(t: Comparable<T>) {
    return this.$comparison("<", t);
  }

  lte(t: Comparable<T>) {
    return this.$comparison("<=", t);
  }

  private $comparison(infix: string, t: T | ColumnWrapper<string, T>) {
    return new Infix(
      infix,
      new ColumnReference(this.$tableName, this.$columnName),
      isColumnWrapper(t)
        ? new ColumnReference(t.$tableName, t.$columnName)
        : new Parameter(t),
    );
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
