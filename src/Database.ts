import { Client } from "pg";

import { isTable, isTableWrapper, Table, TableWrapper } from "@";
import {
  InsertQueryBuilder,
  PickSelectorSpecFromColumnNames,
  SelectorSpec,
  SelectQueryBuilder,
  UpdateQueryBuilder,
} from "@/querybuilders";
import { debug, pick } from "@/utils";
import { ReductionContext } from "@/expr";

interface TableMap {
  [k: string]: Table;
}

/**
 * The implementation of Database<T>.
 *
 * This is kind of a hack because we can't quite statically type what we're
 * trying to do in TypeScript. We have to define properties based on what the
 * API consumer gives us but TS doesn't give us a great way to model that; so
 * instead, we have this class, which does exactly that, and all usages of this
 * class have the `TableWrapperMap<T>` class intersected on (which tells TS that
 * those properties do, in fact, exist).
 */
class DatabaseImpl<T extends TableMap = {}> {
  $debug = debug.extend("Database");
  $tables: TableWrapperMap<T>;

  // A map to be able to lookup a TableWrapper given it's Table class.
  // This is necessary for things like column.reference(...) because when
  // that code is executed, only the Table (not TableWrapper) is available.
  $tableToWrapperMap: Map<
    typeof Table,
    TableWrapper<string, Table>
  > = new Map();

  // Convenience hack that allows us to avoid extra casting to any in the body
  // of this class.
  private $ = (this as any) as Database<T>;

  constructor(public $pg: Client, tableMap: T) {
    this.$tables = Object.fromEntries(
      Object.entries(tableMap).map(([tableName, table]) => {
        if (!isTable(table)) {
          throw new Error(
            `All properties in a TableMap must be Table instances.`,
          );
        }
        if (typeof (this as any)[tableName] !== "undefined") {
          throw new Error(
            `Table name "${tableName}" conflicts with existing name in DatabaseImpl.`,
          );
        }

        const tableWrapper = TableWrapper(this, tableName, table);
        this.$tableToWrapperMap.set(
          Object.getPrototypeOf(table).constructor,
          tableWrapper,
        );
        return [tableName, tableWrapper];
      }),
    ) as any;

    // Implement TableWrapperMap<T>
    Object.entries(this.$tables).forEach(([tableName, tableWrapper]) => {
      tableWrapper.$prepare();
      Object.defineProperty(this, tableName, {
        get() {
          return tableWrapper;
        },
      });
    });
  }

  async createTables() {
    for (const table of Object.values(this.$tables)) {
      await this.$createTablesRecursive(table);
    }
  }

  /**
   * Create a table if it hasn't been created, recursively creating dependent
   * tables if necessary.
   *
   * This method creates dependent tables **before** the table given as the
   * argument (this is necessary for FOREIGN KEY constraints). This is
   * effectively a poor man's topological sort (this runs in O(n^2)). It could
   * be made more efficient, but since the number of tables in a given
   * application is usually on the order of tens, it's probably not worth it.
   */
  private async $createTablesRecursive(t: TableWrapper) {
    if (t.$wasCreated) {
      // Avoid double-creating tables
      return;
    }

    // TODO: We could actually store this as a flag ("no" | "yes" | "in-progress")
    //    which would allow us to detect cycles in the "dag".
    t.$wasCreated = true;
    for (const dependent of t.$references) {
      await this.$createTablesRecursive(dependent);
    }
    const rc = new ReductionContext();
    const sql = t.$creationSQL(rc);
    this.$debug(`Creating table ${t.$tableName}`, sql);
    await this.$pg.query(sql, rc.parameters());
  }

  // select(db.users, "id", "name", ...)
  select<TW extends TableWrapper<string, any>, K extends keyof TW["$columns"]>(
    table: TW,
    ...keys: K[]
  ): SelectQueryBuilder<
    Database<T>,
    PickSelectorSpecFromColumnNames<TW, K>,
    false
  >;

  // select({userId: db.users.id, name: db.users.name, ...})
  select<S extends SelectorSpec>(
    spec: S,
  ): SelectQueryBuilder<Database<T>, S, false>;

  // select(...) implementation
  select(tableOrSpec: any, ...keys: any[]) {
    if (isTableWrapper(tableOrSpec)) {
      if (keys.length === 0) {
        throw new Error(`Cannot select zero columns.`);
      }
      const spec = pick<any, any>(tableOrSpec.$columns, ...keys);
      return new SelectQueryBuilder(this.$, spec, false);
    }
    return new SelectQueryBuilder(this.$, tableOrSpec, false);
  }

  selectOne<S extends SelectorSpec>(
    spec: S,
  ): SelectQueryBuilder<Database<T>, S, true> {
    // `this as any` required because of hack described above.
    return new SelectQueryBuilder(this as any, spec, true);
  }

  insertInto<TW extends TableWrapper<string, Table>>(table: TW) {
    return new InsertQueryBuilder(this.$, table);
  }

  update<TW extends TableWrapper<string, Table>>(table: TW) {
    return new UpdateQueryBuilder(this.$, table);
  }

  /**
   * Lookup a TableWrapper given the associated Table class.
   *
   * This is used to implement functionality in columns (especially FORIEGN
   * KEY constraints) that require information that's only available in the
   * miscellaneous wrapper types (e.g. table and column names and types). For
   * example, a column can reference a table, must when the `.reference(...)`
   * is executed, the TableWrapper class doesn't exist yet.
   */
  $getTableWrapperForTable(t: typeof Table) {
    const wrapper = this.$tableToWrapperMap.get(t);
    if (!wrapper) {
      throw new Error(
        `Unable to find TableWrapper for table ${t.name}; ` +
          `did you forget to add it to the Database constructor?`,
      );
    }
    return wrapper;
  }
}

export type TableWrapperMap<T extends TableMap> = {
  [K in keyof T & string]: TableWrapper<K, T[K]>;
};
export type Database<T extends TableMap = {}> = DatabaseImpl<T> &
  TableWrapperMap<T>;
export const Database = <T extends TableMap = {}>(
  pg: Client,
  tables: T,
): Database<T> => {
  return new DatabaseImpl(pg, tables) as any;
};
