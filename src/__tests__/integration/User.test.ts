import { assert, IsExact } from "conditional-type-checks";
import { IntColumn, StringColumn } from "../../columntypes";
import Database from "../../Database";
import Table from "../../Table";
import { getPG, setupPG, teardownPG } from "./utils";

beforeEach(setupPG);
afterEach(teardownPG);

test("User integration test with real Postgres server", async () => {
  const pg = getPG();

  class UserTable extends Table {
    id = new IntColumn();
    name = new StringColumn().nullable();
  }

  const db = Database(pg, {
    users: new UserTable(),
  });

  // TODO: make dbts insert this table
  await pg.query(db.users.$creationSQL());

  await db.insertInto(db.users).values({
    id: 123,
    name: "trav",
  });

  const myUser = await db
    .selectOne({ id: db.users.id, name: db.users.name })
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
  });

  await db.insertInto(db.users).values({
    id: 124,
    name: "joe",
  });
  const users = await db
    .select({ id: db.users.id, name: db.users.name })
    .from(db.users);
  expect(users).toHaveLength(2);

  assert<IsExact<typeof users[0], { id: number; name: string | null }>>(true);
  expect(users[0]).toEqual({
    id: 123,
    name: "trav",
  });
  expect(users[1]).toEqual({
    id: 124,
    name: "joe",
  });

  expect(
    await db
      .selectOne({ id: db.users.id, name: db.users.name })
      .where(db.users.name.eq("joe")),
  ).toEqual({ id: 124, name: "joe" });
});
