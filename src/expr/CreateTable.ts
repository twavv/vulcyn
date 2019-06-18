import { Expr, PickExpr } from "./Expr";
import { ReductionContext } from "./ReductionContext";
import { CreateTableColumn } from "./CreateTableColumn";

export class CreateTable extends Expr<"create-table"> {
  tableName!: Expr<string>;
  columns!: Array<CreateTableColumn>;

  constructor(args: PickExpr<CreateTable>) {
    super("create-table");
    Object.assign(this, args);
  }

  toSQL(rc: ReductionContext): string {
    return (
      "CREATE TABLE " +
      this.tableNameSQL(rc) +
      " (" +
      this.columnsSQL(rc) +
      ");"
    );
  }

  private tableNameSQL(rc: ReductionContext): string {
    return this.tableName.toSQL(rc);
  }

  private columnsSQL(rc: ReductionContext): string {
    return this.columns.map((column) => column.toSQL(rc)).join(", ");
  }
}
