import { Expr } from "./Expr";
import { ReductionContext } from "./ReductionContext";
import { FromItem } from "./FromItem";

export class From extends Expr<"from"> {
  constructor(public fromItem: FromItem) {
    super("from");
  }

  toSQL(rc: ReductionContext): string {
    return "FROM " + this.fromItem.toSQL(rc);
  }
}
