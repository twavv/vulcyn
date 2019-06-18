import { Expr } from "./Expr";
import { ReductionContext } from "./ReductionContext";

export enum JoinType {
  INNER = "INNER",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}
export class Join<J extends JoinType = JoinType> extends Expr<"join"> {
  constructor(
    public joinType: J,
    public from: Expr<string>,
    public on?: Expr<string>,
  ) {
    super("join");
  }

  toSQL(rc: ReductionContext): string {
    return this.joinTypeSQL() + this.fromSQL(rc) + this.onSQL(rc);
  }

  private joinTypeSQL() {
    switch (this.joinType) {
      case JoinType.INNER:
        return "INNER JOIN";
      case JoinType.LEFT:
        return "LEFT JOIN";
      case JoinType.RIGHT:
        return "RIGHT JOIN";
    }
    throw new Error(`Unknown join type: ${this.joinType}`);
  }

  private fromSQL(rc: ReductionContext) {
    return " " + this.from.toSQL(rc);
  }

  private onSQL(rc: ReductionContext) {
    if (!this.on) {
      return "";
    }
    return " ON " + this.on.toSQL(rc);
  }
}
