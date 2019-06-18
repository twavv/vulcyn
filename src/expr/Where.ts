import { Expr } from "./Expr";
import { ReductionContext } from "./ReductionContext";

export class Where extends Expr<"where"> {
  constructor(public condition: Expr<"string">) {
    super("where");
  }

  toSQL(rc: ReductionContext): string {
    return "WHERE " + this.condition.toSQL(rc);
  }
}
