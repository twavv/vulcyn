import ReductionContext from "./ReductionContext";
import { itisa } from "../util";
import Select from "./Select";

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
abstract class Expr<H extends string>  {
  get $_iama() {
    return "Expr";
  }

  protected constructor(
    public head: H,
  ) {}

  abstract toSQL(context: ReductionContext): string;
}
export default Expr;

export function isExpr(x: unknown): x is Expr<string> {
  return itisa(x) === "Expr";
}

/**
 * Get the keys of O that match (extend) constraint C.
 *
 * This is kind of a hack. It works by creating an interface where keys whose
 * value satisfies the constraint map to the key itself, and keys that don't map
 * to undefined, and then getting the union of all values in the new interface.
 * This results in a union of all the key names that satisfy the constraint, as
 * well as never (which can't be an object key anyway).
 *
 * Inspired by https://link.medium.com/bOKpZFxJnX
 */
type PickKeys<O, C> = {
  [K in keyof O]:
  NonNullable<O[K]> extends C ? K : never
}[keyof O];

/**
 * Pick all of the Expr types out of a type.
 *
 * This is used to create easy constructors for (e.g.) the Select Expr.
 */
export type PickExpr<T> = Pick<T, PickKeys<T, Expr<any> | Array<Expr<any>>>>;

