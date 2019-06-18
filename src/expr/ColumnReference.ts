import { Expr } from "./Expr";
import { ReductionContext } from "./ReductionContext";

export class ColumnReference extends Expr<"column-reference"> {
  constructor(public tableName: string, public columnName: string) {
    super("column-reference");
  }

  toSQL(rc: ReductionContext): string {
    return rc.qualifyNames()
      ? this.tableName + "." + this.columnName
      : this.columnName;
  }
}
