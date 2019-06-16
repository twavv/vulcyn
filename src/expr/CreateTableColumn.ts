import { Expr, PickExpr } from "@/expr/Expr";
import { ReductionContext } from "@/expr/ReductionContext";

export class CreateTableColumn extends Expr<"create-table-column"> {
  name!: Expr<string>;
  dataType!: Expr<string>;
  constraint?: Expr<any>;

  constructor(args: PickExpr<CreateTableColumn>) {
    super("create-table-column");
    Object.assign(this, args);
  }

  toSQL(rc: ReductionContext): string {
    return this.nameSQL(rc) + this.dataTypeSQL(rc) + this.constraintSQL(rc);
  }

  private nameSQL(rc: ReductionContext): string {
    return this.name.toSQL(rc);
  }

  private dataTypeSQL(rc: ReductionContext): string {
    return " " + this.dataType.toSQL(rc);
  }

  private constraintSQL(rc: ReductionContext): string {
    if (!this.constraint) {
      return "";
    }
    return " " + this.constraint.toSQL(rc);
  }
}
