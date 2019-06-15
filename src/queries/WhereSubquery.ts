import Database from "../Database";
import SQLFragment, {isSQLFragment} from "../expr/SQLFragment";
import {itisa} from "../util";
import Clause from "../expr/Clause";
import LogicalOperator from "../expr/LogicalOperator";
import Expr from "../expr/Expr";

/**
 * A subquery for a WHERE clause.
 *
 * We represent the actual specifier as a DAG (see the ConditionNode) type. This
 * allows us to more easily model complex AND/OR
 */
class WhereSubquery<DB extends Database<any>> {
  readonly $body: Expr<any>;

  constructor(
    input: WhereSubqueryInputSpecifier,
  ) {
    if (isSQLFragment(input)) {
      this.$body = input;
    } else {
      this.$body = input(new WhereSubqueryBuilder());
    }
  }

  $toExpr() {
    return new Clause("where", this.$body);
  }
}
export default WhereSubquery;

class WhereSubqueryBuilder {

  private $andor(
      type: LogicalOperator["operator"],
      specifiers: WhereSubqueryInputSpecifier[],
  ) {
    const first = specifiers[0];
    if (specifiers.length === 1 && isSQLFragment(first)) {
      return first;
    }

    const children = specifiers
      .map((s) => {
        if (isSQLFragment(s)) {
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
export type WhereSubqueryInputSpecifier = SQLFragment | WhereSubqueryBuilderFunction;

// type ConditionNode = ConditionInternalNode | SQLFragment;
// class ConditionInternalNode {
//   get $_iama() {
//     return "ConditionInternalNode";
//   }
//   constructor(
//     public type: "AND" | "OR",
//     public children: ConditionNode[],
//   ) {}
// }
//
// function isConditionInternalNode(x: unknown): x is ConditionInternalNode {
//   return itisa(x) === "ConditionInternalNode";
// }
//
// function conditionGraphSQL(graph: ConditionNode): string {
//   if (isSQLFragment(graph)) {
//     return `(${graph.sql})`;
//   }
//   if (isConditionInternalNode(graph)) {
//     const expression = graph.children
//       .map((c) => conditionGraphSQL(c))
//       .join(` ${graph.type} `);
//     return `(${expression})`;
//   }
//   throw new Error(`Cannot convert non-ConditionNode to SQL (got type ${itisa(graph)}).`);
// }
