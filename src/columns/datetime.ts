import { Column } from "@";
import { SQLFragment } from "@/expr";

/**
 * A timestamp column.
 *
 * This defaults to a `timestamp with time zone` column since that has the most
 * sane defaults (the time will always be returned in UTC).
 */
export class TimestampColumn extends Column<Date, Date> {
  $pgType = "timestamptz";

  withoutTimezone() {
    this.$pgType = "timestamp without timezone";
    return this;
  }

  defaultCurrentTimestamp() {
    return this.defaultExpr(new SQLFragment(`CURRENT_TIMESTAMP`));
  }
}
