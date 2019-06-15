import { Expr } from "./Expr";
import { ReductionContext } from "./ReductionContext";

export type LogicalOperatorType = "and" | "or";

export class LogicalOperator extends Expr<"binaryoperator"> {
  constructor(public operator: LogicalOperatorType, public args: Expr<any>[]) {
    super("binaryoperator");
  }

  toSQL(context: ReductionContext): string {
    const operator = this.operator.toUpperCase();
    const args = this.args.map((arg) => `(${arg.toSQL(context)})`);
    return args.join(` ${operator} `);
  }
}
