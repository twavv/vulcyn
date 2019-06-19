import { IntColumn, TextColumn, Table, createTableWrapper, Database } from "@";

test("Table creation SQL is correct", () => {
  class User extends Table {
    id = new IntColumn();
    name = new TextColumn().nullable();
  }

  let tw = createTableWrapper(null as any, "users", new User());
  const sql = tw.$creationSQL();

  expect(sql).toContain("CREATE TABLE users");
  expect(sql).toContain("id int NOT NULL");
  expect(sql).toContain("name text");
});

test("Table creation SQL with references is correct", () => {
  class User extends Table {
    id = new IntColumn();
    name = new TextColumn();
  }

  class Pet extends Table {
    id = new IntColumn();
    name = new TextColumn();
    ownerId = new IntColumn().references(User, "id");
  }

  const db = Database(null as any, { users: new User(), pets: new Pet() });

  const petsSQL = db.pets.$creationSQL();
  expect(petsSQL).toEqual(
    expect.stringMatching(/ownerId INT .+ REFERENCES users\(id\)/i),
  );
});
