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

export class Update extends Expr<"update"> {
  // NOTE: These need to be public have non-null assertions to allow PickExpr to work.
  readonly tableName!: SQLFragment;
  readonly updates!: UpdatesArray;
  readonly where!: Where;

  constructor(args: PickExpr<Update>) {
    super("update");
    Object.assign(this, args);

    if (this.updates.length === 0) {
      throw new Error(`Cannot construct an Update Expr with zero updates.`);
    }
  }

  toSQL(context: ReductionContext): string {
    return (
      "UPDATE" +
      this.tableNameSQL(context) +
      this.updatesSQL(context) +
      this.whereSQL(context) +
      ";"
    );
  }

  private tableNameSQL(rc: ReductionContext) {
    return " " + this.tableName.toSQL(rc);
  }

  private updatesSQL(rc: ReductionContext) {
    return " SET " + this.updates.map((infix) => infix.toSQL(rc)).join(", ");
  }

  private whereSQL(rc: ReductionContext): string {
    if (this.where) {
      return " " + this.where.toSQL(rc);
    }
    return "";
  }
}
