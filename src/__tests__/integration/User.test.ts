import { IsExact, assert } from "conditional-type-checks";
import { getPG, setupPG, teardownPG } from "./utils";
import { Database, IntColumn, TextColumn, Table } from "@";
import { SQLFragment } from "@/expr";

beforeEach(setupPG);
afterEach(teardownPG);

test("User integration test with real Postgres server", async () => {
  const pg = getPG();

  class UserTable extends Table {
    id = new IntColumn();
    name = new TextColumn().nullable();
    greeting = new TextColumn().defaultExpr(new SQLFragment("'Hello!'"));
  }

  const db = Database(pg, {
    users: new UserTable(),
  });

  await db.createTables();
  await db.insertInto(db.users).values({
    id: 123,
    name: "trav",
  });

  const myUser = await db
    .selectOne({
      id: db.users.id,
      name: db.users.name,
      greeting: db.users.greeting,
    })
    .from(db.users);
  expect(myUser).toBeTruthy();

  // TS doesn't know that toBeTruthy will throw if myUser is null.
  if (!myUser) {
    throw new Error();
  }

  // const myUser = rows[0];
  expect(myUser).toEqual({
    id: 123,
    name: "trav",
    greeting: "Hello!",
  });

  await db.insertInto(db.users).values({
    id: 124,
    name: "joe",
    greeting: "Bonjour!",
  });
  const users = await db
    .select({
      id: db.users.id,
      name: db.users.name,
      greeting: db.users.greeting,
    })
    .from(db.users);
  expect(users).toHaveLength(2);

  assert<
    IsExact<
      typeof users[0],
      { id: number; name: string | null; greeting: string }
    >
  >(true);
  expect(users[0]).toEqual({
    id: 123,
    name: "trav",
    greeting: "Hello!",
  });
  expect(users[1]).toEqual({
    id: 124,
    name: "joe",
    greeting: "Bonjour!",
  });

  expect(
    await db
      .selectOne({ id: db.users.id, name: db.users.name })
      .where(db.users.name.eq("joe")),
  ).toEqual({ id: 124, name: "joe" });
});
