import Expr from "./Expr";
import ReductionContext from "./ReductionContext";

/**
 * The name (in lowercase) of any valid SQL clause.
 */
type ClauseHead = "where";

/**
 * An Expr that represents a SQL clause.
 *
 * A clause is anything of the form "<head> <body>", excluding "top-level"
 * queries (such as "SELECT ..."). For example, WHERE and SET are Clauses.
 *
 * @todo
 *    I'm unsure Clause should be an Expr or if we should have unique classes
 *    for WHERE and SET and friends. The advantage of this approach would be
 *    better static analysis (for example, we could enforce that SET clause
 *    bodies are exclusively "=" infix Exprs with static typing).
 */
class Clause extends Expr<ClauseHead> {
  constructor(
    head: ClauseHead,
    public body: Expr<any>,
  ) {
    super(head);
  }

  toSQL(context: ReductionContext): string {
    return `${this.head.toUpperCase()} ${this.body.toSQL(context)}`;
  }
}
export default Clause;
