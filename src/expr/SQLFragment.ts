import Expr, { isExpr } from "./Expr";
import ReductionContext from "./ReductionContext";

/**
 * A fragment of SQL.
 *
 * This class is used to represent arbitrary user-supplied SQL as well as
 * SQL symbols.
 */
class SQLFragment extends Expr<"sqlfragment"> {
  constructor(public sql: string) {
    super("sqlfragment");
  }

  toSQL(_context: ReductionContext): string {
    return this.sql;
  }
}
export default SQLFragment;

export function isSQLFragment(s: unknown): s is SQLFragment {
  return isExpr(s) && s.head == "sqlfragment";
}
