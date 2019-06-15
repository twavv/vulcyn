import Expr from "./Expr";
import ReductionContext from "./ReductionContext";

class Limit extends Expr<"limit"> {
  constructor(public limit: number | "ALL") {
    super("limit");
  }

  toSQL(context: ReductionContext): string {
    return `LIMIT ${this.limit}`;
  }
}
export default Limit;
