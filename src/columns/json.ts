import { Column } from "@";
import { SQLFragment } from "@/expr";

/**
 * Quoting delimiter for setting column DEFAULT.
 *
 * https://www.postgresql.org/docs/10.0/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING
 */
const QUOTE_DELIM = "$_9QE3H0$";

/**
 * A JSONB column.
 *
 * @todo
 *    There are lots of really neat things you can do with JSONB (like querying
 *    on a property within a JSONB column) that I'm not really sure how to model
 *    here. We might need to introduce a new kind of "Queryable" type that can
 *    be selected and used within where clauses (it would just reduce to SQL
 *    like everything else - the tricker part would be integrating it into the
 *    static typing).
 */
export class JSONBColumn<T extends {}, IT = T> extends Column<T, IT> {
  $pgType = "jsonb";

  default(value: T): JSONBColumn<T, T | undefined> {
    const json = JSON.stringify(value);
    if (json.includes(QUOTE_DELIM)) {
      throw new Error(
        `JSONB default cannot include quote delimiter (${QUOTE_DELIM})`,
      );
    }
    this.defaultExpr(new SQLFragment(`${QUOTE_DELIM}${json}${QUOTE_DELIM}`));
    return this as any;
  }
}
