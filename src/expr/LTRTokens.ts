import { Expr } from "./Expr";
import { ReductionContext } from "./ReductionContext";

/**
 * An Expr which is a wrapper around a sequence of tokens.
 *
 * The tokens are space-separated and reduced to SQL from left to right.
 * This is useful when creating full-blown Expr classes is a bit overkill but we
 * still want to store things in an Expr for reduction later.
 *
 * Try not to use this class if there's any real complexity in what's happening
 * (you should create a new Expr subclass instead). For example, just because we
 * could model a WHERE clause as LTRTokens, we shouldn't.
 */
export class LTRTokens extends Expr<"ltrtokens"> {
  constructor(
    protected tokens: Array<Expr<string>> = [],
    protected separator = " ",
  ) {
    super("ltrtokens");
  }

  toSQL(rc: ReductionContext): string {
    return this.tokens.map((token) => token.toSQL(rc)).join(this.separator);
  }

  appendToken(...expr: Array<Expr<string>>) {
    this.tokens.push(...expr);
    return this;
  }
}
