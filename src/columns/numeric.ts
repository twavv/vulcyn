import { Column } from "@";

/**
 * An int (or smallint) column.
 */
export class IntColumn extends Column<number> {
  $pgType = "int";

  smallint() {
    this.$pgType = "smallint";
    return this;
  }
}

/**
 * A bigint column.
 *
 * The pg library returns bigint's as a string (probably for historical reasons
 * as it existed before the advent of the BigInt proposal).
 */
export class BigintColumn extends Column<string, string | number> {
  $pgType = "bigint";
}

/**
 * A serial column.
 */
export class SerialColumn extends Column<number, number | undefined> {
  readonly $pgType = "serial";

  constructor() {
    super();
    this.unique(true);
  }
}

/**
 * A float column.
 *
 * The type may be set to double precision using the `.double()` method.
 */
export class FloatColumn extends Column<number> {
  $pgType = "real";

  double() {
    this.$pgType = "double precision";
    return this;
  }
}
