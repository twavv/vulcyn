import { Has, IsExact, assert } from "conditional-type-checks";
import {
  ColumnWrapper,
  Database,
  IntColumn,
  TextColumn,
  Table,
  TableWrapper,
} from "@";
import {
  DefaultSelectorSpec,
  PickSelectorSpecFromColumnNames,
  SelectQueryBuilder,
  SelectQueryReturn,
  SelectRowResult,
} from "@/querybuilders";

test("PickSelectorSpecFromColumnNames", () => {
  class User extends Table {
    id = new IntColumn();
    name = new TextColumn();
  }

  type UserWrapper = TableWrapper<"users", User>;
  type MyRow = PickSelectorSpecFromColumnNames<UserWrapper, "id" | "name">;
  assert<
    IsExact<
      MyRow,
      { id: ColumnWrapper<"id", number>; name: ColumnWrapper<"name", string> }
    >
  >(true);
});

test("SelectRowResult has correct type", () => {
  class User extends Table {
    id = new IntColumn();
    name = new TextColumn();
  }

  type MyDb = Database<{ users: User }>;
  assert<IsExact<SelectRowResult<{ id: MyDb["users"]["id"] }>, { id: number }>>(
    true,
  );
});

test("SelectQueryReturn has correct type for fetch one", () => {
  class User extends Table {
    id = new IntColumn();
    name = new TextColumn();
  }

  type MyDb = Database<{ users: User }>;
  type MyQueryReturn = SelectQueryReturn<
    {
      id: MyDb["users"]["id"];
    },
    true
  >;
  assert<Has<MyQueryReturn, { id: number } | null>>(true);
});

test("SelectQueryReturn has correct type for fetch many", () => {
  class User extends Table {
    id = new IntColumn();
    name = new TextColumn();
  }

  type MyDb = Database<{ users: User }>;
  type MyQueryReturn = SelectQueryReturn<
    {
      id: MyDb["users"]["id"];
    },
    false
  >;
  assert<Has<MyQueryReturn, Array<{ id: number }>>>(true);
});

test("SelectQueryBuilder has correct SelectRowResult type", () => {
  class User extends Table {
    id = new IntColumn();
    name = new TextColumn();
  }

  type MyDb = Database<{ users: User }>;
  type MyQueryOne = SelectQueryBuilder<MyDb, { id: MyDb["users"]["id"] }, true>;
  assert<IsExact<MyQueryOne["$promise"], Promise<{ id: number } | null>>>(true);

  // Check for extraneous properties.
  assert<Has<MyQueryOne["$promise"], Promise<{ name: string }>>>(false);

  type MyQueryMany = SelectQueryBuilder<
    MyDb,
    { id: MyDb["users"]["id"] },
    false
  >;
  assert<IsExact<MyQueryMany["$promise"], Promise<Array<{ id: number }>>>>(
    true,
  );
});

test("SelectQueryBuilder for column names has correct SelectRowResult type", async () => {
  class User extends Table {
    id = new IntColumn();
    name = new TextColumn();
  }

  const db = Database(null as any, { users: new User() });
  const myQuery = db.select(db.users, "id", "name");
  expect(myQuery).toBeInstanceOf(SelectQueryBuilder);

  type QueryType = typeof myQuery;

  assert<
    IsExact<QueryType["$promise"], Promise<Array<{ id: number; name: string }>>>
  >(true);
});

test("SelectQueryBuilder for default selector spec", async () => {
  class User extends Table {
    id = new IntColumn();
    name = new TextColumn();
  }

  const db = Database(null as any, { users: new User() });

  assert<
    IsExact<
      DefaultSelectorSpec<typeof db.users>,
      {
        id: ColumnWrapper<"id", number>;
        name: ColumnWrapper<"name", string>;
      }
    >
  >(true);
  const myQuery = db.select(db.users);
  type QueryType = typeof myQuery;
  assert<
    IsExact<QueryType["$promise"], Promise<Array<{ id: number; name: string }>>>
  >(true);

  const myOneRowQuery = db.selectOne(db.users);
  type OneRowQueryType = typeof myOneRowQuery;
  assert<
    IsExact<
      OneRowQueryType["$promise"],
      Promise<null | { id: number; name: string }>
    >
  >(true);
});
