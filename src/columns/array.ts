import { Column } from "@";
import { SQLFragment } from "@/expr";

/**
 * Quoting delimiter for setting column DEFAULT.
 *
 * https://www.postgresql.org/docs/10.0/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING
 */
const QUOTE_DELIM = "$_9QE3H0$";

/**
 * An Array column.
 */
export class ArrayColumn<T extends unknown[], IT = T> extends Column<T, IT> {
  $pgType = "array";

  constructor(type: Column<unknown>) {
    super();
    this.$pgType = `${type.$pgType}[]`;
  }

  default(value: T): ArrayColumn<T, T | undefined> {
    const json = JSON.stringify(value);
    if (json.includes(QUOTE_DELIM)) {
      throw new Error(
        `Array default cannot include quote delimiter (${QUOTE_DELIM})`,
      );
    }
    this.defaultExpr(new SQLFragment(`${QUOTE_DELIM}${json}${QUOTE_DELIM}`));
    return this as any;
  }
}
