import ReductionContext from "../expr/ReductionContext";
import Expr from "../expr/Expr";

abstract class QueryBuilder {
  abstract $toExpr(): Expr<any>;

  $toSQL(rc?: ReductionContext) {
    rc = rc || new ReductionContext();
    return this.$toExpr().toSQL(rc);
  }
}
export default QueryBuilder;
