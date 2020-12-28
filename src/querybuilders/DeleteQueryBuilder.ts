import {
  ColumnWrapper,
  ColumnWrapperTSInsertionType,
  Database,
  TableWrapper,
} from "@";
import { Expr, Where } from "@/expr";

import { ExecutableQueryBuilder } from "./QueryBuilder";
import { WhereSubquery, WhereSubqueryInputSpecifier } from "./WhereSubquery";
import { Delete } from "@/expr/Delete";

/**
 * The interface of an update
 */
export type DeleteSpec<T extends TableWrapper> = {
  [k in keyof T["$columns"]]?: T["$columns"][k] extends ColumnWrapper<
    string,
    any
  >
    ? ColumnWrapperTSInsertionType<T["$columns"][k]>
    : never;
};

export class DeleteQueryBuilder<
  DB extends Database<any>,
  TW extends TableWrapper
> extends ExecutableQueryBuilder<DB, unknown> {
  protected $where?: Where;

  constructor(db: DB, public $table: TW) {
    super(db);
  }

  where(whereSpecifier: WhereSubqueryInputSpecifier) {
    this.$where = new WhereSubquery<DB>(whereSpecifier).$toExpr();
    return this;
  }

  $execute(): Promise<unknown> {
    return this.$tryExecute();
  }

  $toExpr(): Expr {
    if (!this.$where) {
      throw new Error(
        `No conditions specified in DeleteQueryBuilder; did you forget to .where(...)?`,
      );
    }
    return new Delete({
      tableName: this.$table.$tableName,
      where: this.$where,
    });
  }
}
