import {
  Expr,
  joinExprsSQL,
  LTRTokens,
  ReductionContext,
  SQLFragment,
} from "@/expr";
import { Selectable } from "@/interfaces";
import { assertSQLSafeIdentifier } from "@/utils";

export class FunctionCall<T> extends Expr<"function-call">
  implements Selectable<T> {
  constructor(readonly functionName: string, readonly args: Expr[]) {
    super("function-call");
    assertSQLSafeIdentifier(functionName);
  }

  $_selectableType!: T;

  $selectableExpr(asName: string): Expr<string> {
    assertSQLSafeIdentifier(asName);
    return new LTRTokens([this, new SQLFragment(`AS ${asName}`)]);
  }

  toSQL(rc: ReductionContext): string {
    const sql = `${this.functionName}(` + joinExprsSQL(this.args, rc) + `)`;
    console.log(sql);
    return sql;
  }
}
