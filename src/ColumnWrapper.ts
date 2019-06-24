/**
 * A wrapper around a column in a table.
 *
 * This is used in the implementation of the codebase. It is necessary because
 * the `Column` doesn't have access to things like the table name.
 */

import { itisa } from "@/utils";
import { Column, isColumn, Table, TableWrapper } from "@";
import {
  ColumnReference,
  CreateTableColumn,
  Infix,
  LTRTokens,
  Parameter,
  SQLFragment,
} from "@/expr";
import { assertSQLSafeIdentifier, camel2snake } from "@/utils/identifiers";
import { Selectable } from "@/interfaces";
import { JSONBAccessorBuilder } from "@/columnfeatures";

type Comparable<T> = T | Selectable<T>;
class ColumnWrapperImpl<N extends string, T, IT> implements Selectable<T> {
  $_type!: T;
  $_selectableType!: T;
  $_insertionType!: IT;

  readonly $columnName: SQLFragment;

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
    public $columnPropName: string,
    public $column: Column<T, IT>,
  ) {
    if (!isColumn($column)) {
      const reprstr = itisa($column) || typeof $column;
      throw new Error(
        `In ColumnWrapper, $column must be a Column (got ${reprstr}).`,
      );
    }

    this.$columnName =
      $column.$columnName() ||
      new SQLFragment(camel2snake(assertSQLSafeIdentifier($columnPropName)));
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

  // Column featuresgi
  jsonb(): T extends object | null ? JSONBAccessorBuilder<T> : never {
    if (!["json", "jsonb"].includes(this.$column.$pgType)) {
      throw new Error(`Cannot use JSONB column features on non-JSON type.`);
    }
    return new JSONBAccessorBuilder(this as any) as any;
  }

  private $comparison(infix: string, t: Comparable<T>) {
    return new Infix(
      infix,
      new ColumnReference(this.$tableName, this.$columnName),
      isColumnWrapper(t)
        ? new ColumnReference(t.$tableName, t.$columnName)
        : new Parameter(t),
    );
  }

  $referenceExpr() {
    return new ColumnReference(this.$tableWrapper.$tableName, this.$columnName);
  }

  $selectableExpr(asName: string) {
    const reference = this.$referenceExpr();

    // Use "AS ..." if the column name isn't the name requested or if the asName
    // uses non-lowercase letters (PG always returns lowercase otherwise).
    if (this.$columnName.sql !== asName || asName.toLowerCase() !== asName) {
      if (asName.includes('"') || asName.includes("\\")) {
        throw new Error(
          `Invalid output name identifier (invalid rvalue for "AS ..."): ${asName}`,
        );
      }
      return new LTRTokens([
        reference,
        new SQLFragment("as"),
        new SQLFragment(`"${asName}"`),
      ]);
    }

    // We don't need to use "AS ...", so we shouldn't to generate more idiomatic
    // and nicer looking SQL.
    return reference;
  }
}

export type ColumnWrapper<N extends string, T, IT = T> = ColumnWrapperImpl<
  N,
  T,
  IT
>;
export function createColumnWrapper<N extends string, T, IT = T>(
  $table: TableWrapper<string, Table>,
  $columnName: string,
  $column: Column<T, IT>,
): ColumnWrapper<N, T, IT> {
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

type Foo<T extends object> = keyof T;
