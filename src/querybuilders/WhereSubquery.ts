import { Database } from "@";
import { Expr, isExpr, isSQLFragment, LogicalOperator, Where } from "@/expr";

/**
 * A subquery for a WHERE clause.
 *
 * We represent the actual specifier as a DAG (see the ConditionNode) type. This
 * allows us to more easily model complex AND/OR
 */
export class WhereSubquery<DB extends Database<any>> {
  readonly $body: Expr<any>;

  constructor(input: WhereSubqueryInputSpecifier) {
    if (isExpr(input)) {
      this.$body = input;
    } else {
      this.$body = input(new WhereSubqueryBuilder());
    }
  }

  $toExpr() {
    return new Where(this.$body);
  }
}

export class WhereSubqueryBuilder {
  private $andor(
    type: LogicalOperator["operator"],
    specifiers: WhereSubqueryInputSpecifier[],
  ) {
    const first = specifiers[0];
    if (specifiers.length === 1 && isSQLFragment(first)) {
      return first;
    }

    const children = specifiers.map((s) => {
      if (isExpr(s)) {
        return s;
      }
      return s(new WhereSubqueryBuilder());
    });
    return new LogicalOperator(type, children);
  }

  and(...s: WhereSubqueryInputSpecifier[]) {
    return this.$andor("and", s);
  }
  or(...s: WhereSubqueryInputSpecifier[]) {
    return this.$andor("or", s);
  }
}

type WhereSubqueryBuilderFunction = (q: WhereSubqueryBuilder) => Expr<any>;
export type WhereSubqueryInputSpecifier =
  | Expr<string>
  | WhereSubqueryBuilderFunction;
