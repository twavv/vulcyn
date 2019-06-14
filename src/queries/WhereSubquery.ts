import Database from "../Database";
import SQLFragment, {isSQLFragment} from "../SQLFragment";
import {itisa} from "../util";

/**
 * A subquery for a WHERE clause.
 *
 * We represent the actual specifier as a DAG (see the ConditionNode) type. This
 * allows us to more easily model complex AND/OR
 */
class WhereSubquery<DB extends Database<any>> {
  readonly $graph: ConditionNode;

  constructor(
    input: WhereSubqueryInputSpecifier,
  ) {
    if (isSQLFragment(input)) {
      this.$graph = input;
    } else {
      this.$graph = input(new WhereSubqueryBuilder());
    }
  }

  $SQL() {
    return `WHERE ${conditionGraphSQL(this.$graph)}`;
  }
}
export default WhereSubquery;

class WhereSubqueryBuilder {

  private $andor(
      type: ConditionInternalNode["type"],
      specifiers: WhereSubqueryInputSpecifier[],
  ): ConditionNode {
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
    return new ConditionInternalNode(type, children);
  }

  and(...s: WhereSubqueryInputSpecifier[]): ConditionNode {
    return this.$andor("AND", s);
  }
  or(...s: WhereSubqueryInputSpecifier[]): ConditionNode {
    return this.$andor("OR", s);
  }
}

type WhereSubqueryBuilderFunction = (q: WhereSubqueryBuilder) => ConditionNode;
type WhereSubqueryInputSpecifier = SQLFragment | WhereSubqueryBuilderFunction;

type ConditionNode = ConditionInternalNode | SQLFragment;
class ConditionInternalNode {
  get $_iama() {
    return "ConditionInternalNode";
  }
  constructor(
    public type: "AND" | "OR",
    public children: ConditionNode[],
  ) {}
}

function isConditionInternalNode(x: unknown): x is ConditionInternalNode {
  return itisa(x) === "ConditionInternalNode";
}

function conditionGraphSQL(graph: ConditionNode): string {
  if (isSQLFragment(graph)) {
    return `(${graph.sql})`;
  }
  if (isConditionInternalNode(graph)) {
    const expression = graph.children
      .map((c) => conditionGraphSQL(c))
      .join(` ${graph.type} `);
    return `(${expression})`;
  }
  throw new Error(`Cannot convert non-ConditionNode to SQL (got type ${itisa(graph)}).`);
}
