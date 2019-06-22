import { Table, TableWrapper } from "@";
import { Expr } from "@/expr";
import { ClassOf, itisa } from "@/utils";

/**
 * Base class for table constraints.
 *
 * We take in the table itself as the first argument to the constructor for
 * static typing purposes (otherwise we have no idea of knowing what table we
 * belong to and can't do things like statically enforce that we're only
 * referencing columns defined on that table).
 */
export abstract class Constraint<T extends Table = Table> {
  readonly $_iama = "constraint";

  protected constructor(public $tableClass: ClassOf<T>) {}
  abstract $creationExpr(
    tableWrapper: TableWrapper<string, T>,
    name: string,
  ): Expr;
}

export function isConstraint(x: unknown): x is Constraint {
  return itisa(x) == "constraint";
}
