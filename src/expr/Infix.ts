import { Expr } from "./Expr";
import { ReductionContext } from "./ReductionContext";

export class Infix<I extends string> extends Expr<"infix"> {
  constructor(public infix: I, public lhs: Expr<any>, public rhs: Expr<any>) {
    super("infix");
  }

  toSQL(context: ReductionContext): string {
    let sql = this.lhs.toSQL(context);
    sql += ` ${this.infix} `;
    sql += this.rhs.toSQL(context);
    return sql;
  }
}
