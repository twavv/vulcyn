import { Database } from "@";
import { Expr, LTRTokens, SQLFragment } from "@/expr";
import { QueryBuilder } from "./QueryBuilder";

export class JSONBAccessorBuilder<
  DB extends Database,
  T extends {}
> extends QueryBuilder<DB> {
  protected $path: LTRTokens = new LTRTokens([], "");

  constructor(db: DB) {
    super(db);
  }

  get<K extends keyof T & string>(fieldName: K) {
    if (fieldName.includes("'") || fieldName.includes("\\")) {
      // Avoid SQL injections!
      // We might be able to handle this better, but, this will do for now.
      throw new Error(
        "JSONB property names must not contain single-quotes or backslashes.",
      );
    }
    this.$path.appendToken(
      new SQLFragment("->"),
      new SQLFragment(`'${fieldName}'`),
    );
    return (this as any) as JSONBAccessorBuilder<DB, T[K]>;
  }

  $toExpr(): Expr {
    return new SQLFragment("");
  }
}
