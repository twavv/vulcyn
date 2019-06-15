import QueryBuilder, { ExecutableQueryBuilder } from "./QueryBuilder";
import Expr from "../expr/Expr";
import Insert from "../expr/Insert";
import TableWrapper from "../TableWrapper";
import Table from "../Table";
import SQLFragment from "../expr/SQLFragment";
import ColumnWrapper, { ColumnWrapperTSInsertionType } from "../ColumnWrapper";
import Parameter from "../expr/Parameter";
import { UndefinedOptional } from "@/utils";
import Database from "@/Database";

export type InsertInterface<
    T extends TableWrapper<string, Table>,
    C extends T["$columns"] = T["$columns"]
> = UndefinedOptional<{
  [K in keyof C]: C[K] extends ColumnWrapper<any, any>
    ? ColumnWrapperTSInsertionType<C[K]>
    : never;
}>

class InsertQueryBuilder<
    DB extends Database<any>,
    TW extends TableWrapper<string, Table>
> extends ExecutableQueryBuilder<DB, unknown> {

  public $tableName: SQLFragment;
  public $columns?: SQLFragment[];
  public $values?: Expr<string>[];

  constructor(
    db: DB,
    $table: TW,
    // $insertionSpec: Array<ColumnWrapper<string, unknown>>,
  ) {
    super(db);
    this.$tableName = new SQLFragment($table.$tableName);
  }

  // TODO: typing
  values(spec: InsertInterface<TW>) {
    let columns = [] as this["$columns"];
    let values = [] as this["$values"];
    // if (values.length !== this.$columns.length) {
    //   throw new Error(`Number of columns and values must match.`);
    // }
    // this.$values = values.map((value) => new Parameter(value));
    Object.entries(spec).forEach(([columnName, value]) => {
      columns!.push(new SQLFragment(columnName));
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
    })
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
export default InsertQueryBuilder;
