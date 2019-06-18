import { Database, IntColumn, SerialColumn, Table, TextColumn } from "@";
import { getPG, setupPG, teardownPG } from "./utils";

beforeEach(setupPG);
afterEach(teardownPG);

test("Author and Books tables with join", async () => {
  class AuthorsTable extends Table {
    id = new SerialColumn();
    name = new TextColumn();
  }

  class BooksTable extends Table {
    id = new SerialColumn();
    title = new TextColumn();
    authorId = new IntColumn().references(AuthorsTable, "id");
  }

  const pg = await getPG();
  const db = Database(pg, {
    authors: new AuthorsTable(),
    books: new BooksTable(),
  });
  await db.createTables();

  expect(
    db.insertInto(db.books).values({
      title: "Intro to Introductions",
      authorId: 123,
    }),
  ).rejects.toThrow();
});
