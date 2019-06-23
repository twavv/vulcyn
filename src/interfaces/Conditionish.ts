import { Expr } from "@/expr";

export interface Conditionish {
  $conditionishExpr(): Expr;
}
