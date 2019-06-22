import {
  ColumnWrapperTSType,
  Database,
  isTableWrapper,
  Table,
  TableWrapper,
} from "@";
import { ColumnWrapper } from "@/ColumnWrapper";
import {
  ColumnReference,
  Expr,
  FromItem,
  isExpr,
  Limit,
  LTRTokens,
  Select,
  SQLFragment,
  Where,
} from "@/expr";

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
  private $from?: FromItem;
  private $where?: Where;
  private $limit?: Limit;

  constructor(db: D, public $selectorSpec: S, public $fetchOne: FO) {
    super(db);
    this.$columns = Object.entries($selectorSpec).map(([name, column]) => {
      const { $columnName } = column;
      const columnReference = new ColumnReference(
        column.$tableName,
        column.$columnName,
      );
      if ($columnName.sql != name) {
        // NOTE: we do quotes here to ensure that casing is correct in result
        // object.
        return new LTRTokens([
          columnReference,
          new SQLFragment(`AS "${name}"`),
        ]);
      }
      return columnReference;
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
   */
  from(table: TableWrapper<string, Table> | FromItem) {
    if (isExpr(table)) {
      this.$from = table;
      return this;
    } else if (isTableWrapper(table)) {
      this.$from = new FromItem(table.$tableName);
      return this;
    }
    throw new Error(
      `In SelectQueryBuilder, .from(...) must be a table or From Expr.`,
    );
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
    let guess: SQLFragment | null = null;
    for (const selector of Object.values(this.$selectorSpec)) {
      if (guess === null) {
        guess = selector.$tableName;
        continue;
      }
      if (selector.$tableName.sql !== guess.sql) {
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
    return new FromItem(guess);
  }
}
