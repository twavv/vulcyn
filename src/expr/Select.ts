import { Expr, PickExpr } from "./Expr";
import { ReductionContext } from "./ReductionContext";
import { Clause } from "./Clause";
import { Limit } from "./Limit";

export class Select extends Expr<"select"> {
  columns!: Array<Expr<any>>;
  from!: Clause<"from">;
  where?: Clause<"where">;
  limit?: Limit;

  constructor(args: PickExpr<Select>) {
    super("select");
    Object.assign(this, args);
  }

  toSQL(context: ReductionContext): string {
    return (
      "SELECT " +
      this.columnsSQL(context) +
      this.fromSQL(context) +
      this.whereSQL(context) +
      this.limitSQL(context) +
      ";"
    );
  }

  private columnsSQL(rc: ReductionContext) {
    return this.columns.map((column) => column.toSQL(rc)).join(", ");
  }

  private whereSQL(rc: ReductionContext): string {
    if (this.where) {
      return " " + this.where.toSQL(rc);
    }
    return "";
  }

  private fromSQL(rc: ReductionContext): string {
    return " " + this.from.toSQL(rc);
  }

  private limitSQL(rc: ReductionContext): string {
    if (this.limit) {
      return " " + this.limit.toSQL(rc);
    }
    return "";
  }
}
