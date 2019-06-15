import Expr from "./Expr";
import ReductionContext from "./ReductionContext";

class Infix extends Expr<"infix"> {
  constructor(
    public infix: string,
    public lhs: Expr<any>,
    public rhs: Expr<any>,
  ) {
    super("infix");
  }

  toSQL(context: ReductionContext): string {
    let sql = this.lhs.toSQL(context);
    sql += ` ${this.infix} `;
    sql += this.rhs.toSQL(context);
    return sql;
  }
}
export default Infix;
