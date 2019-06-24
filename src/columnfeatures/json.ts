import { ColumnWrapper } from "@";
import { Expr, LTRTokens, SQLFragment } from "@/expr";
import { Selectable } from "@/interfaces";
import { assertSQLSafeIdentifier } from "@/utils";

/**
 * This type exists just because TS gets confused if we try to inline the
 * `JSONBAccessorBuilder<R, T | null>` bit (and adding **another** ternary
 * would be confusing).
 *
 * This should never devolve down to `never`.
 */
type NullableGetReturnType<R extends object | null, T> = T extends object
  ? JSONBAccessorBuilder<R, T | null>
  : never;

// prettier-ignore
type GetReturnType<
  R extends object | null,
  T,
  K extends keyof T,
  MaybeNull extends boolean
> = T[K] extends object
  // T[K] is a non-optional object, so we can keep getting fields out of it
  ? JSONBAccessorBuilder<R, MaybeNull extends true ? T[K] | null : T[K]>
  : Exclude<T[K], undefined> extends object
    // T[K] is a optional object, so we can keep getting fields out of it
    ? NullableGetReturnType<R, Exclude<T[K], undefined>>
    // T[K] is not an object at all, so we collapse down to Selectable
    : Selectable<MaybeNull extends true ? T[K] | null : T[K]>;

export class JSONBAccessorBuilder<
  R extends object | null,
  T extends object | null = R
> implements Selectable<T> {
  $_rootType!: R;
  $_selectableType!: T;
  protected $path: LTRTokens = new LTRTokens([], "");

  constructor(public $columnWrapper: ColumnWrapper<string, R>) {}

  /**
   * Get a property of a JSONB object.
   *
   * Note that the return type is a conditional type. Either we, we actually
   * return an instance of JSONBAccessorBuilder, but if we're at the "end of the
   * line" (i.e. the property we're accessing is not an object), we tell TS that
   * our return type is **just** Selectable (so that we can't do .get(...) on it
   * anymore).
   *
   * Ugly, ugly details:
   *    This is admittedly very ugly and I'm sorry, but I'm not sure that
   *    there's a better way to do this, but I will explain what exactly it's
   *    doing for my own sanity if this ever needs to change.
   *
   *    We need to define use Exclude<T, null | undefined> in order to allow for
   *    keyof to work properly (keyof T | null = never). But then TS complains
   *    that K can't be used to index T, so we can't directly pass T to
   *    GetReturnType. But we need the nullability information to propagate it
   *    down (the descendants of anything that may be null can also be null if
   *    selected in this way).
   *
   *    It might be better to have the nullability information be stored as a
   *    flag on the class itself.
   */
  get<K extends keyof Exclude<T, null | undefined> & string>(
    name: K,
  ): GetReturnType<
    R,
    // We can't pass T here since K is defined as keyof `Exclude<T, ...>`, not
    // keyof T
    Exclude<T, null | undefined>,
    K,
    // Since we can't pass T directly, but still want to know if T is nullable,
    // we pass a "nullability flag".
    null extends T ? true : false
  > {
    assertSQLSafeIdentifier(name);
    this.$path.appendToken(new SQLFragment("->"), new SQLFragment(`'${name}'`));
    return this as any;
  }

  $selectableExpr(asName: string): Expr<string> {
    assertSQLSafeIdentifier(asName);
    return new LTRTokens(
      [
        this.$columnWrapper.$referenceExpr(),
        this.$path,
        new SQLFragment(` AS "${asName}"`),
      ],
      "",
    );
  }
}
