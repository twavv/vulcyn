import SelectQueryBuilder, {
  PickSelectorSpecFromColumnNames,
  SelectorSpec
} from "./queries/SelectQueryBuilder";
import Table from "./Table";
import TableWrapper, {isTableWrapper} from "./TableWrapper";
import {Client} from "pg";
import {pick} from "./util";

type TableMap = {
  [k: string]: Table
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
class DatabaseImpl<T extends TableMap> {
  $tables: TableWrapperMap<T>;

  constructor(
    public $pg: Client,
    tableMap: T,
  ) {
    this.$tables = Object.fromEntries(Object.entries(tableMap).map(
      ([tableName, table]) => {
        // noinspection SuspiciousTypeOfGuard
        if (!(table instanceof Table)) {
          throw new Error(`All properties in a TableMap must be Table instances.`);
        }
        if (typeof (this as any)[tableName] !== "undefined") {
          throw new Error(`Table name "${tableName}" conflicts with existing name in DatabaseImpl.`)
        }
        return [
          tableName,
          TableWrapper(tableName, table),
        ];
      },
    )) as any;

    // Implement TableWrapperMap<T>
    Object.entries(this.$tables).forEach(([tableName, tableWrapper]) => {
      Object.defineProperty(this, tableName, {
        get() { return tableWrapper; }
      })
    })
  }

  // select(db.users, "id", "name", ...)
  select<
      TW extends TableWrapper<string, any>,
      K extends keyof TW["$columns"],
  >(
    table: TW,
    ...keys: K[]
  ): SelectQueryBuilder<Database<T>, PickSelectorSpecFromColumnNames<TW, K>, false>;

  // select({userId: db.users.id, name: db.users.name, ...})
  select<
      S extends SelectorSpec
  >(
    spec: S,
  ): SelectQueryBuilder<Database<T>, S, false>;

  // select(...) implementation
  select(tableOrSpec: any, ...keys: any[]) {
    if (isTableWrapper(tableOrSpec)) {
      if (keys.length === 0) {
        throw new Error(`Cannot select zero columns.`);
      }
      const spec = pick(tableOrSpec.$columns, ...keys);
      return new SelectQueryBuilder(this as any, spec, false);
    }
    return new SelectQueryBuilder(this as any, tableOrSpec, false);
  }

  selectOne<S extends SelectorSpec>(spec: S): SelectQueryBuilder<Database<T>, S, true> {
    // `this as any` required because of hack described above.
    return new SelectQueryBuilder(this as any, spec, true);
  }
}

export type TableWrapperMap<T extends TableMap> = {
  [K in keyof T & string]: TableWrapper<K, T[K]>
}
type Database<T extends TableMap> = DatabaseImpl<T> & TableWrapperMap<T>;
function Database<T extends TableMap>(pg: Client, tables: T): Database<T> {
  return new DatabaseImpl(pg, tables) as any;
}
export default Database;
