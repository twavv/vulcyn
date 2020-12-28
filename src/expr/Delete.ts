import { Expr, PickExpr } from "./Expr";
import { Infix } from "./Infix";
import { ReductionContext } from "./ReductionContext";
import { SQLFragment } from "./SQLFragment";
import { Where } from "./Where";

/**
 * An array of updates.
 *
 * This type requires that at least one update be defined (since
 * `UPDATE ... SET WHERE ...` is not a valid query).
 */
export type UpdatesArray = [Infix<"=">, ...Array<Infix<"=">>];

export class Delete extends Expr<"delete"> {
  // NOTE: These need to be public have non-null assertions to allow PickExpr to work.
  readonly tableName!: SQLFragment;
  readonly where!: Where;

  constructor(args: PickExpr<Delete>) {
    super("delete");
    Object.assign(this, args);
  }

  toSQL(context: ReductionContext): string {
    return (
      "DELETE FROM" + this.tableNameSQL(context) + this.whereSQL(context) + ";"
    );
  }

  private tableNameSQL(rc: ReductionContext) {
    return " " + this.tableName.toSQL(rc);
  }

  private whereSQL(rc: ReductionContext): string {
    if (this.where) return " " + this.where.toSQL(rc);

    return "";
  }
}
