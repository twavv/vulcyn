import { Expr } from "./Expr";
import { ReductionContext } from "./ReductionContext";

export class Parameter extends Expr<"parameter"> {
  constructor(protected value: any) {
    super("parameter");
  }

  toSQL(context: ReductionContext): string {
    return `$${context.addParameter(this.value)}`;
  }
}
