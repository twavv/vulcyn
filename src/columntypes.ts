import Column from "./column";

export class IntColumn extends Column<number> {
  readonly $pgType = "int";
}
export class StringColumn extends Column<string> {
  readonly $pgType = "text";
}