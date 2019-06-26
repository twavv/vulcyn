import {
  ColumnWrapper,
  ColumnWrapperTSInsertionType,
  Database,
  Table,
  TableWrapper,
} from "@";
import {
  Expr,
  Infix,
  Parameter,
  SQLFragment,
  Update,
  UpdatesArray,
  Where,
} from "@/expr";
import { hasEntry } from "@/utils";

import { ExecutableQueryBuilder } from "./QueryBuilder";
import { WhereSubquery, WhereSubqueryInputSpecifier } from "./WhereSubquery";

/**
 * The interface of an update
 */
export type UpdateSpec<T extends TableWrapper<string, Table>> = {
  [k in keyof T["$columns"]]?: T["$columns"][k] extends ColumnWrapper<
    string,
    any
  >
    ? ColumnWrapperTSInsertionType<T["$columns"][k]>
    : never;
};

export class UpdateQueryBuilder<
  DB extends Database<any>,
  TW extends TableWrapper<string, Table>
> extends ExecutableQueryBuilder<DB, unknown> {
  protected $updates?: UpdatesArray;
  protected $where?: Where;

  constructor(db: DB, public $table: TW) {
    super(db);
  }

  set(spec: UpdateSpec<TW>) {
    const updates = Object.entries(spec).map(([columnName, value]) => {
      return new Infix("=", new SQLFragment(columnName), new Parameter(value));
    });
    if (!hasEntry(updates)) {
      throw new Error();
    }
    this.$updates = updates;
    return this;
  }

  where(whereSpecifier: WhereSubqueryInputSpecifier) {
    this.$where = new WhereSubquery<DB>(whereSpecifier).$toExpr();
    return this;
  }

  $execute(): Promise<unknown> {
    return this.$tryExecute();
  }

  $toExpr(): Expr<string> {
    if (!this.$updates) {
      throw new Error(
        `No updates specified in UpdateQueryBuilder; did you forget to .set(...)?`,
      );
    }
    if (!this.$where) {
      throw new Error(
        `No conditions specified in UpdateQueryBuilder; did you forget to .where(...)?`,
      );
    }
    return new Update({
      tableName: this.$table.$tableName,
      updates: this.$updates,
      where: this.$where,
    });
  }
}
