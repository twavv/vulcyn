import { Expr, PickExpr } from "./Expr";
import { ReductionContext } from "./ReductionContext";

export interface DropTableOptions {
  ifExists?: boolean;
}

export class DropTable extends Expr<"drop-table"> {
  tableName!: Expr;
  constraints?: Array<Expr>;

  constructor(
    args: PickExpr<DropTable>,
    private options: DropTableOptions = {},
  ) {
    super("drop-table");
    Object.assign(this, args);
  }

  toSQL(rc: ReductionContext): string {
    return (
      "DROP TABLE " +
      (this.options.ifExists ? "IF EXISTS " : "") +
      this.tableNameSQL(rc) +
      ";"
    );
  }

  private tableNameSQL(rc: ReductionContext): string {
    return this.tableName.toSQL(rc);
  }
}
