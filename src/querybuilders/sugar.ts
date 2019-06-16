import {
  WhereSubqueryBuilder,
  WhereSubqueryInputSpecifier,
} from "./WhereSubquery";

export function and(...exprs: WhereSubqueryInputSpecifier[]) {
  return new WhereSubqueryBuilder().and(...exprs);
}

export function or(...exprs: WhereSubqueryInputSpecifier[]) {
  return new WhereSubqueryBuilder().or(...exprs);
}
