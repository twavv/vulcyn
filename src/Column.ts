/**
 * A column in a table.
 *
 * This is used when declaring tables.
 */
import {itisa} from "./util";

abstract class Column<T> {
  abstract readonly $pgType: string;

  get $_iama() {
    return "Column";
  }

  // This is never set but is required to keep postgres from collapsing our
  // types (otherwise ColumnClass<int> would be equivalent to
  // ColumnClass<string> because the class itself does not make reference to the
  // type).
  public $_type?: T;

  protected $nullable?: boolean;
  protected $default?: string;
  // TODO: Support more column constraints.
  // https://www.postgresql.org/docs/10/sql-createtable.html

  nullable(): Column<T | null> {
    this.$nullable = true;
    return this as Column<T | null>;
  }

  $creationSQL() {
    let query = `${this.$pgType}`;
    query += this.$nullable ? ` NULL` : ` NOT NULL`;
    query += this.$default ? ` DEFAULT ${this.$default}` : ``;
    return query;
  }
}

export default Column;

export type ColumnTSType<C extends Column<any>> = Exclude<C["$_type"], undefined>;

export function isColumn(x: unknown): x is Column<unknown> {
  return itisa(x) === "Column";
}
