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

export class InsertQueryBuilder<
  DB extends Database<any>,
  TW extends TableWrapper<string, Table>
> extends ExecutableQueryBuilder<DB, unknown> {
  $tableName: Expr;
  $columns?: SQLFragment[];
  $values?: Expr<string>[];

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

  $toExpr(): Expr<any> {
    return new Insert({
      tableName: this.$tableName,
      columns: this.$getColumns(),
      values: this.$getValues(),
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

  async $execute(): Promise<unknown> {
    return await this.$tryExecute();
  }
}
