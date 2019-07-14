import { ColumnWrapper } from "@";
import { Expr, LTRTokens, SQLFragment } from "@/expr";
import { Selectable, SelectableTSType } from "@/interfaces";
import { assertSQLSafeIdentifier } from "@/utils";

// /**
//  * This type exists just because TS gets confused if we try to inline the
//  * `JSONBAccessorBuilder<R, T | null>` bit (and adding **another** ternary
//  * would be confusing).
//  *
//  * This should never devolve down to `never`.
//  */
// type NullableGetReturnType<R extends object | null, T> = T extends object
//   ? JSONBAccessorBuilder<R, T | null>
//   : never;
//
// // prettier-ignore
// type GetReturnType<
//   R extends object | null,
//   T,
//   K extends keyof T,
//   MaybeNull extends boolean
//   > = T[K] extends object
//   // T[K] is a non-optional object, so we can keep getting fields out of it
//   ? JSONBAccessorBuilder<R, MaybeNull extends true ? T[K] | null : T[K]>
//   : Exclude<T[K], undefined> extends object
//     // T[K] is a optional object, so we can keep getting fields out of it
//     ? NullableGetReturnType<R, Exclude<T[K], undefined>>
//     // T[K] is not an object at all, so we collapse down to Selectable
//     : Selectable<MaybeNull extends true ? T[K] | null : T[K]>;

type Helper<T> = T extends object ? T : never;

export class JSONBAccessorBuilder<
  Root extends object | null,
  T extends object = Exclude<Root, null>,
  Nullable extends boolean = null extends Root ? true : false
> implements Selectable<Nullable extends true ? T | null : T> {
  $_rootType!: Root;
  $_selectableType!: Nullable extends true ? T | null : T;
  protected $path: LTRTokens = new LTRTokens([], "");

  constructor(public $columnWrapper: ColumnWrapper<string, Root>) {}

  /**
   * Get a property of a JSONB object.
   */
  get<K extends keyof T>(
    name: K,
  ): Exclude<T[K], undefined> extends object
    ? JSONBAccessorBuilder<
        Root,
        Helper<Exclude<T[K], undefined>>,
        undefined extends T[K] ? true : Nullable
      >
    : Selectable<Nullable extends true ? T[K] | null : T[K]> {
    assertSQLSafeIdentifier(name as string);
    this.$path.appendToken(new SQLFragment("->"), new SQLFragment(`'${name}'`));
    return this as any;
  }

  $selectableExpr(asName: string | null): Expr<string> {
    const tokens: Expr[] = [this.$columnWrapper.$referenceExpr(), this.$path];

    if (!!asName) {
      assertSQLSafeIdentifier(asName);
      tokens.push(new SQLFragment(` AS "${asName}"`));
    }

    return new LTRTokens(tokens, "");
  }
}

interface Payload {
  s: string;
  o?: {
    o2: {
      n: number;
    };
    n: number;
  };
}
const b = new JSONBAccessorBuilder((null as any) as ColumnWrapper<
  "foo",
  Payload
>)
  .get("o")
  .get("o2")
  .get("n");

type Foo = SelectableTSType<typeof b>;
