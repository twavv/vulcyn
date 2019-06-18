import {
  ColumnWrapper,
  ColumnWrapperTSType,
  Database,
  Table,
  TableWrapper,
} from "@";
import { Expr, From, Limit, Select, SQLFragment, Where } from "@/expr";

import { ExecutableQueryBuilder } from "./QueryBuilder";
import { WhereSubquery, WhereSubqueryInputSpecifier } from "./WhereSubquery";

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
  [k: string]: ColumnWrapper<string, unknown>;
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
export type SelectRowResult<T extends SelectorSpec> = {
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
  T extends TableWrapper<string, Table>,
  K extends keyof T["$columns"]
> = {
  [k in K]: T["$columns"][k];
};

/**
 * A builder for a select query.
 */
export class SelectQueryBuilder<
  // Database type
  D extends Database<any>,
  // Selector type
  S extends SelectorSpec,
  // True if fetch one
  FO extends boolean = false
> extends ExecutableQueryBuilder<D, SelectQueryReturn<S, FO>> {
  private $columns: Array<Expr<any>>;
  private $from?: From;
  private $where?: Where;
  private $limit?: Limit;

  constructor(db: D, public $selectorSpec: S, public $fetchOne: FO) {
    super(db);
    this.$columns = Object.entries($selectorSpec).map(([name, column]) => {
      const { $columnName } = column;
      if ($columnName != name) {
        return new SQLFragment(`${$columnName} AS ${name}`);
      }
      return new SQLFragment($columnName);
    });
    if ($fetchOne) {
      this.$limit = new Limit(1);
    }
  }

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
  from(table: TableWrapper<string, Table>) {
    this.$from = new From(new SQLFragment(table.$tableName));
    return this;
  }

  where(whereSpecifier: WhereSubqueryInputSpecifier) {
    this.$where = new WhereSubquery<D>(whereSpecifier).$toExpr();
    return this;
  }

  $toExpr() {
    return new Select({
      columns: this.$columns,
      from: this.$from || this.$guessFromClause(),
      where: this.$where,
      limit: this.$limit,
    });
  }

  async $execute(): Promise<SelectQueryReturn<S, FO>> {
    const result = await this.$tryExecute();
    if (this.$fetchOne) {
      return result.rows[0] || null;
    }
    return result.rows as any;
  }

  private $guessFromClause() {
    let guess: string | null = null;
    for (const selector of Object.values(this.$selectorSpec)) {
      if (guess === null) {
        guess = selector.$tableName;
        continue;
      }
      if (selector.$tableName !== guess) {
        throw new Error(
          `Unable to guess table name in query with columns from multiple ` +
            `tables; please set .from(table) on the query.`,
        );
      }
    }
    if (guess === null) {
      throw new Error(
        `Cannot guess table name from query with no columns selected.`,
      );
    }
    return new From(new SQLFragment(guess));
  }
}
