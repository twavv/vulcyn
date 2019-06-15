import Expr from "./Expr";
import ReductionContext from "./ReductionContext";

class Parameter extends Expr<"parameter"> {
  constructor(
    protected value: any,
  ) {
    super("parameter");
  }

  toSQL(context: ReductionContext): string {
    return `$${context.addParameter(this.value)}`;
  }
}
export default Parameter;
