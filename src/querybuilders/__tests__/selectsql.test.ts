import { Database, IntColumn, TextColumn, Table } from "@";

test("SelectQueryBuilder with spec object", () => {
  class User extends Table {
    id = new IntColumn();
    name = new TextColumn().nullable();
  }

  // Use null b/c we don't actually us Postgres here
  const db = Database(null as any, { users: new User() });
  const sql = db
    .selectOne({
      id: db.users.id,
      name: db.users.name,
    })
    .from(db.users)
    .$toSQL();

  expect(sql).toContain("SELECT ");
  expect(sql).toContain(" FROM users ");
  expect(sql).toContain(" id, name ");
  expect(sql).toContain(" LIMIT 1");
});

test("SelectQueryBuilder with column names", () => {
  class User extends Table {
    id = new IntColumn();
    name = new TextColumn().nullable();
  }

  // Use null b/c we don't actually us Postgres here
  const db = Database(null as any, { users: new User() });
  const query = db.select(db.users, "id", "name").from(db.users);
  const sql = query.$toSQL();

  expect(sql).toContain("SELECT ");
  expect(sql).toContain(" FROM users");
  expect(sql).toEqual(expect.stringMatching(/ id[ ,]/));
  expect(sql).toEqual(expect.stringMatching(/ name[ ,]/));
});

test("SelectQueryBuilder without manual .from()", () => {
  class User extends Table {
    id = new IntColumn();
    name = new TextColumn().nullable();
  }

  const db = Database(null as any, { users: new User() });
  const query = db.select(db.users, "id", "name");
  const sql = query.$toSQL();

  expect(sql).toContain("SELECT ");
  expect(sql).toContain(" FROM users");
  expect(sql).toEqual(expect.stringMatching(/ id[ ,]/));
  expect(sql).toEqual(expect.stringMatching(/ name[ ,]/));
});
