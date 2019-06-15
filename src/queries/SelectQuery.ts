import ColumnWrapper, {ColumnWrapperTSType} from "../ColumnWrapper";
import Database from "../Database";
import TableWrapper from "../TableWrapper";
import WhereSubquery, { WhereSubqueryInputSpecifier } from "./WhereSubquery";
import ReductionContext from "../expr/ReductionContext";

/**
 * The type of the input to a select query.
 *
 * @example
 *    const selectorSpec = {
 *      id: db.users.id,
 *      name: db.users.name,
 *    };
 *    db.select(selectorSpec).from(db.users);
 */
export interface SelectorSpec {
  [k: string]: ColumnWrapper<any, any>
}

/**
 * The type of a single row in the output of a select query.
 *
 * @example
 *    const selectorSpec = {
 *      id: db.users.id,
 *      name: db.users.name,
 *    };
 *    db.select(selectorSpec).from(db.users);
 *    // Has type {id: number, name: string}
 */
export type SelectRowResult<
    T extends SelectorSpec,
> = {
  [k in keyof T]: ColumnWrapperTSType<T[k]>;
};

export type SelectQueryReturn<
    S extends SelectorSpec,
    FetchOne extends boolean
> = FetchOne extends true
  ? (SelectRowResult<S> | null)
  : Array<SelectRowResult<S>>;

/**
 * Kind of like Pick<...> for a SelectorSpec given a table and column names.
 *
 * @example
 *    // These two are equivalent (assuming they're concerning the same table).
 *    type MySpec = {id: ColumnWrapper<"id", number>, name: ...};
 *    type MyPickedSpec = PickSelectorSpecFromColumnNames<table, "id", "name">;
 */
export type PickSelectorSpecFromColumnNames<
    T extends TableWrapper<any, any>,
    K extends keyof T["$columns"],
> = {
  [k in K]: T["$columns"][k];
}

/**
 * A builder for a select query.
 */
class SelectQuery<
    // Database type
    D extends Database<any>,
    // Selector type
    S extends SelectorSpec,
    // True if fetch one
    FO extends boolean = false,
> implements Promise<SelectQueryReturn<S, FO>> {
  private $_promise?: Promise<SelectQueryReturn<S, FO>>;
  private $fromTableName?: string;
  private $whereClause?: WhereSubquery<D>;

  constructor(public $db: D, public $selectorSpec: S, public $fetchOne: FO) {}

  /**
   * Set the `FROM` table in the query.
   * @param table - The table that we're selecting from.
   *
   * @example
   *   db
   *     .select({...})
   *     .from(db.users);
   *
   * @todo
   *   This can be automagically inferred when all of the columns come from the
   *   same table.
   */
  public from(table: TableWrapper<any, any>) {
    this.$fromTableName = table.$tableName;
    return this;
  }

  public where(whereSpecifier: WhereSubqueryInputSpecifier) {
    this.$whereClause = new WhereSubquery<D>(whereSpecifier);
    return this;
  }

  public $SQL() {
    let query = `SELECT`;
    query += this.$getSelectorSpecSQL();
    query += this.$getFromSQL();
    query += this.$getWhereSQL();
    query += this.$getLimitSQL();
    query += `;`;
    return query;
  }

  private $getSelectorSpecSQL() {
    return " " + (
      Object
        .entries(this.$selectorSpec)
        .map(([name, column]) => `${column.$columnName} AS ${name}`)
        .join(", ")
    );
  }

  private $getFromSQL() {
    const tableName: string = this.$fromTableName || this.$guessTableName();
    return ` FROM ${tableName}`;
  }

  private $getWhereSQL() {
    if (!this.$whereClause) {
      return "";
    }
    return ` ${this.$whereClause.$toExpr().toSQL(new ReductionContext())}`;
  }

  private $getLimitSQL() {
    if (this.$fetchOne) {
      return ` LIMIT 1`;
    }
    return ``;
  }

  private $guessTableName() {
    let guess: string | null = null;
    for (const selector of Object.values(this.$selectorSpec)) {
      if (guess === null) {
        guess = selector.$tableName;
        continue;
      }
      if (selector.$tableName !== guess) {
        throw new Error(
          `Unable to guess table name in query with columns from multiple `
            + `tables; please set .from(table) on the query.`
        );
      }
    }
    if (guess === null) {
      throw new Error(
        `Cannot guess table name from query with no columns selected.`
      );
    }
    return guess;
  }

  public async $execute(): Promise<SelectQueryReturn<S, FO>> {
    const result = await this.$db.$pg.query(this.$SQL());
    if (this.$fetchOne) {
      return result.rows[0] || null;
    }
    return result.rows as any;
  }

  private get $promise(): Promise<SelectQueryReturn<S, FO>> {
    if (this.$_promise) {
      return this.$_promise;
    }
    return this.$_promise = this.$execute();
  }

  // Methods to implement the Promise interface
  get [Symbol.toStringTag]() {
    return "SelectQuery";
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
export default SelectQuery;
