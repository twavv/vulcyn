/**
 * A column in a table.
 *
 * This is used when declaring tables.
 */
import {itisa} from "./util";

abstract class Column<T, InsertionType = T> {
  abstract readonly $pgType: string;

  get $_iama() {
    return "Column";
  }

  // This is never set but is required to keep postgres from collapsing our
  // types (otherwise ColumnClass<int> would be equivalent to
  // ColumnClass<string> because the class itself does not make reference to the
  // type).
  public $_type!: T;
  public $_insertionType!: InsertionType;

  protected $nullable?: boolean;
  protected $default?: string;
  // TODO: Support more column constraints.
  // https://www.postgresql.org/docs/10/sql-createtable.html

  nullable(): Column<T | null, T | null | undefined> {
    this.$nullable = true;
    return this as any;
  }

  $creationSQL() {
    let query = `${this.$pgType}`;
    query += this.$nullable ? ` NULL` : ` NOT NULL`;
    query += this.$default ? ` DEFAULT ${this.$default}` : ``;
    return query;
  }
}

export default Column;

export type ColumnTSType<
    C extends Column<any>
> = C["$_type"];
export type ColumnTSInsertionType<
    C extends Column<any>
> = C["$_insertionType"];

export function isColumn(x: unknown): x is Column<unknown> {
  return itisa(x) === "Column";
}
