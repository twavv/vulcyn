import {
  ColumnWrapper,
  ColumnWrapperTSInsertionType,
  Database,
  Table,
  TableWrapper,
} from "@";
import { Expr, Insert, Parameter, SQLFragment } from "@/expr";
import { UndefinedOptional } from "@/utils";

import { ExecutableQueryBuilder } from "./QueryBuilder";
import { Selectable, SelectableTSType } from "@/interfaces";

export type InsertInterface<
  T extends TableWrapper<string, Table>,
  C extends T["$columns"] = T["$columns"]
> = UndefinedOptional<
  {
    [K in keyof C]: C[K] extends ColumnWrapper<any, any>
      ? ColumnWrapperTSInsertionType<C[K]>
      : never;
  }
>;

export type ReturningInterface<
  T extends TableWrapper,
  C extends keyof T["$columns"]
> = {
  [k in C]: SelectableTSType<
    T["$columns"][k] extends Selectable<any> ? T["$columns"][k] : never
  >;
};

export class InsertQueryBuilder<
  DB extends Database<any>,
  TW extends TableWrapper<string, Table>,
  RShape = null
> extends ExecutableQueryBuilder<DB, RShape> {
  $tableName: Expr;
  $columns?: SQLFragment[];
  $values?: Expr[];
  $returning?: Expr[];

  constructor(db: DB, public $table: TW) {
    super(db);
    this.$tableName = $table.$tableName;
  }

  values(spec: InsertInterface<TW>) {
    const columns = [] as this["$columns"];
    const values = [] as this["$values"];
    Object.entries(spec).forEach(([columnName, value]) => {
      columns!.push(this.$table.$getColumnWrapper(columnName).$columnName);
      values!.push(new Parameter(value));
    });
    this.$columns = columns;
    this.$values = values;
    return this;
  }

  returning<K extends keyof TW["$columns"] & string>(
    ...columns: [K, ...K[]]
  ): InsertQueryBuilder<DB, TW, ReturningInterface<TW, K>> {
    this.$returning = columns.map((columnName) =>
      this.$table.$getColumnWrapper(columnName).$selectableExpr(columnName),
    );
    return this as any;
  }

  $toExpr(): Expr<any> {
    return new Insert({
      tableName: this.$tableName,
      columns: this.$getColumns(),
      values: this.$getValues(),
      returning: this.$returning,
    });
  }

  private $getColumns() {
    if (!this.$columns) {
      throw new Error(`Columns must be specified for INSERT query.`);
    }
    return this.$columns;
  }

  private $getValues() {
    if (!this.$values) {
      throw new Error(`Values must be specified for INSERT query.`);
    }
    return this.$values;
  }

  async $execute(): Promise<RShape> {
    const result = await this.$tryExecute();
    const { rows } = result;
    if (this.$returning) {
      if (rows.length !== 1) {
        throw new Error(
          `Expected result of INSERT ... RETURNING .. query to have 1 row ` +
            `(got ${rows.length}).`,
        );
      }
      return (rows[0] as unknown) as RShape;
    }
    return (null as unknown) as RShape;
  }
}
