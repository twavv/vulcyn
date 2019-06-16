import { Column } from "@";

/**
 * A text column.
 *
 * Note: I'm not aware of any good reason to use the char or varchar types in
 * Postgres (there is no performance benefit) and so this is the only one of
 * those data types which are implemented.
 */
export class TextColumn extends Column<string> {
  protected readonly $pgType = "text";
}

/**
 * An enum column that is stored as text in the database.
 *
 * The enum validity is only enforced by TypeScript, not the database itself.
 */
export class TextEnumColumn<E extends string> extends Column<E> {
  protected readonly $pgType = "text";
}
