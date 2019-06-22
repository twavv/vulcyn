import { itisa, PickConstraintIgnoringNull } from "@/utils";
import { ReductionContext } from "./ReductionContext";

/**
 * An AST-like structure which represents a SQL "expression".
 *
 * Note (Terminology):
 *    "Expression" is in quotes above because it differs from the definition of
 *    a SQL expression. In SQL, an expression is basically anything that can be
 *    put inside a SELECT statement, whereas here, it may basically be any
 *    "piece" of the SQL AST. For example, "WHERE foo = 'bar'" is not a SQL
 *    expression (the query `SELECT WHERE foo='bar'` is not valid) but is
 *    considered a valid Expr.
 *
 *    tl;dr: Expr's are building blocks of queries and nothing more.
 *
 * Note (Inspiration):
 *    This system draws from my experience with Julia (which I believe in turn
 *    draws from Lisp). Definitely check it out!
 */
export abstract class Expr<H extends string = string> {
  get $_iama() {
    return "Expr";
  }

  protected constructor(public head: H) {}

  abstract toSQL(rc: ReductionContext): string;
}

export function isExpr(x: unknown): x is Expr<string> {
  return itisa(x) === "Expr";
}

/**
 * Pick all of the Expr types out of a type.
 *
 * This is used to create easy constructors for (e.g.) the Select Expr.
 */
export type PickExpr<T> = PickConstraintIgnoringNull<
  T,
  Expr<any> | Array<Expr<any>>
>;
