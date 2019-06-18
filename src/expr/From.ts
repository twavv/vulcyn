import { Expr } from "./Expr";
import { ReductionContext } from "./ReductionContext";
import { Join } from "./Join";

export class From extends Expr<"from"> {
  constructor(public tableName: Expr<string>, public join?: Join) {
    super("from");
  }

  toSQL(rc: ReductionContext): string {
    return "FROM" + this.tableNameSQL(rc) + this.joinSQL(rc);
  }

  private tableNameSQL(rc: ReductionContext) {
    return " " + this.tableName.toSQL(rc);
  }

  private joinSQL(rc: ReductionContext) {
    if (!this.join) {
      return "";
    }
    return " " + this.join.toSQL(rc);
  }
}
