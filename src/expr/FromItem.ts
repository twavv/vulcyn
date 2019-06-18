import { Expr } from "./Expr";
import { ReductionContext } from "./ReductionContext";
import { Join } from "./Join";

export class FromItem extends Expr<"from-item"> {
  constructor(public tableName: Expr<string>, public join?: Join) {
    super("from-item");
  }

  toSQL(rc: ReductionContext): string {
    return this.tableNameSQL(rc) + this.joinSQL(rc);
  }

  private tableNameSQL(rc: ReductionContext) {
    return this.tableName.toSQL(rc);
  }

  private joinSQL(rc: ReductionContext) {
    if (!this.join) {
      return "";
    }
    return " " + this.join.toSQL(rc);
  }
}
