import { Database } from "@";
import { Expr, ReductionContext } from "@/expr";

abstract class QueryBuilder<DB extends Database<any>> {
  abstract $toExpr(): Expr<any>;

  protected constructor(protected $db: Database<any>) {}

  $toSQL(rc?: ReductionContext) {
    rc = rc || new ReductionContext();
    return this.$toExpr().toSQL(rc);
  }
}

/**
 * A query builder for a query that can be executed.
 *
 * Query builders that extend this class should yield queries that are
 * executable from a SQL CLI (e.g. SELECT or INSERT but not WHERE).
 */
export abstract class ExecutableQueryBuilder<DB extends Database<any>, R>
  extends QueryBuilder<DB>
  implements Promise<R> {
  private $_promise?: Promise<R>;

  abstract async $execute(): Promise<R>;

  protected get $promise(): Promise<R> {
    if (this.$_promise) {
      return this.$_promise;
    }
    return (this.$_promise = this.$execute());
  }

  protected async $tryExecute() {
    const rc = new ReductionContext();
    const sql = this.$toSQL(rc);
    try {
      return await this.$db.$pg.query(sql, rc.parameters());
    } catch (e) {
      console.error(`Error executing SQL: ${sql}`);
      throw e;
    }
  }

  // Methods to implement the Promise interface
  get [Symbol.toStringTag]() {
    return "SelectQueryBuilder";
  }
  get then() {
    return this.$promise.then.bind(this.$promise);
  }
  get catch() {
    return this.$promise.catch.bind(this.$promise);
  }
  get finally() {
    return this.$promise.finally.bind(this.$promise);
  }
}
