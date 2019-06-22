import { Expr } from "./Expr";
import { ReductionContext } from "./ReductionContext";

export class PrimaryKey extends Expr<"primary-key"> {
  constructor(public columns: Expr[]) {
    super("primary-key");
  }

  toSQL(rc: ReductionContext): string {
    return (
      "PRIMARY KEY (" +
      this.columns.map((column) => column.toSQL(rc)).join(", ") +
      ")"
    );
  }
}
