import { Expr } from "./Expr";
import { ReductionContext } from "./ReductionContext";

export class ColumnReference extends Expr<"column-reference"> {
  constructor(
    public tableName: Expr,
    public columnName: Expr,
    public forceQualified: boolean = false,
  ) {
    super("column-reference");
  }

  toSQL(rc: ReductionContext): string {
    return this.forceQualified || rc.qualifyNames()
      ? this.tableName.toSQL(rc) + "." + this.columnName.toSQL(rc)
      : this.columnName.toSQL(rc);
  }
}
