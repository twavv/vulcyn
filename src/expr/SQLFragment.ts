import { Expr, isExpr } from "./Expr";
import { ReductionContext } from "./ReductionContext";

/**
 * A fragment of SQL.
 *
 * This class is used to represent arbitrary user-supplied SQL as well as
 * SQL symbols.
 */
export class SQLFragment extends Expr<"sqlfragment"> {
  constructor(public sql: string) {
    super("sqlfragment");
  }

  toSQL(_context: ReductionContext): string {
    return this.sql;
  }

  toString() {
    return `sql\`${this.sql}\``;
  }
}

export function isSQLFragment(s: unknown): s is SQLFragment {
  return isExpr(s) && s.head == "sqlfragment";
}
