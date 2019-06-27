import { Expr } from "@/expr";

/**
 * This interface is implemented for things that are valid inputs for a SELECT.
 *
 * ColumnWrapper implements this interface.
 * In the future, this may be extended to things like builtin functions (e.g.
 * CURRENT_TIMESTAMP).
 */
export interface Selectable<T> {
  /**
   * This is not actually meant to exist on the things that implement this
   * interface but must be here to prevent TypeScript from losing the generic
   * information (since there are otherwise no references).
   */
  $_selectableType: T;

  /**
   * Generate the Expr that will yield the desired value.
   *
   * The Postgres type returned by the generated Expr **must** exactly match the
   * generic type of the interface (e.g. the Expr generated for a
   * `Selectable<string>` must return a string when selected).
   *
   * The returned Expr is included in the list of _things_ that are selected and
   * so should be valid in a `SELECT ...` query.
   */
  $selectableExpr(asName: string): Expr;
}

/**
 * Get the TypeScript type that a selectable will yield when queried.
 */
export type SelectableTSType<S extends Selectable<any>> = S extends Selectable<
  infer TSType
>
  ? TSType
  : unknown;
