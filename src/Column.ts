/**
 * A column in a table.
 *
 * This is used when declaring tables.
 */
import { itisa } from "@/utils";
import { CreateTableColumn, Expr, LTRTokens, SQLFragment } from "@/expr";

/**
 * A utility type that contains information about a Column's data.
 *
 * This is useful as a type to intersect with a column to change it's type
 * parameters (e.g. after marking it as nullable).
 */
export interface ColumnTypeData<T, InsertionType = T> {
  $_type: T;
  $_insertionType: InsertionType;
}

export abstract class Column<T, InsertionType = T>
  implements ColumnTypeData<T, InsertionType> {
  protected abstract $pgType: string;

  get $_iama() {
    return "Column";
  }

  // These are never actually set but enable some TypeScript conveniences and
  // help prevent TypeScript from collapsing Column<int> to Column<string>
  // (which happens if the class itself makes no reference to the generic type).
  $_type!: T;
  $_insertionType!: InsertionType;

  protected $nullable?: boolean;
  protected $default?: Expr<string>;
  // TODO: Support more column constraints.
  // https://www.postgresql.org/docs/10/sql-createtable.html

  nullable(): Column<T | null, T | null | undefined> {
    this.$nullable = true;
    return this as (this & {
      $_type: T | null;
      $_insertionType: T | undefined | null;
    });
  }

  /**
   * Set the default value of the column to an Expr.
   *
   * @todo
   *    This is named defaultExpr to denote that the argument is not a *value*,
   *    but rather, an Expr. We should also implement a .default() that will
   *    appropriately escape the value and convert it to an Expr (it's work
   *    nothing that CREATE TABLE queries can't handle parameters so this is not
   *    entirely trivial).
   */
  defaultExpr(expr: Expr<string>): Column<T, T | undefined> {
    this.$default = expr;
    return this as (this & { $_type: T; $_insertionType: T | undefined });
  }

  $creationExpr(name: string) {
    return new CreateTableColumn({
      name: new SQLFragment(name),
      dataType: new SQLFragment(this.$pgType),
      constraint: this.$constraintExpr(),
    });
  }

  private $constraintExpr() {
    const tokens = new LTRTokens();

    if (this.$nullable) {
      tokens.appendToken(new SQLFragment("NULL"));
    } else {
      tokens.appendToken(new SQLFragment("NOT NULL"));
    }

    if (this.$default) {
      tokens.appendToken(new SQLFragment("DEFAULT"), this.$default);
    }

    return tokens;
  }
}

export type ColumnTSType<C extends Column<any>> = C["$_type"];
export type ColumnTSInsertionType<C extends Column<any>> = C["$_insertionType"];

export function isColumn(x: unknown): x is Column<unknown> {
  return itisa(x) === "Column";
}
