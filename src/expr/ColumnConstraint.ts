import { Expr } from "./Expr";
import { ReductionContext } from "./ReductionContext";

export type ColumnConstraintType = "primary key" | "unique";

export class ColumnConstraint extends Expr<"column-constraint"> {
  constructor(
    public constraintType: ColumnConstraintType,
    public columns: Expr[],
  ) {
    super("column-constraint");
  }

  toSQL(rc: ReductionContext): string {
    return (
      this.constraintType.toUpperCase() +
      " (" +
      this.columns.map((column) => column.toSQL(rc)).join(", ") +
      ")"
    );
  }
}
