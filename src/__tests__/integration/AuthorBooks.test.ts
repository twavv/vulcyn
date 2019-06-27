import { Database, IntColumn, SerialColumn, Table, TextColumn } from "@";
import { getPG, setupPG, teardownPG } from "./utils";

beforeEach(setupPG);
afterEach(teardownPG);

test("Author and Books tables with join", async () => {
  class PublishersTable extends Table {
    id = new SerialColumn();
    name = new TextColumn();
  }

  class AuthorsTable extends Table {
    id = new SerialColumn();
    publisherId = new IntColumn().references(PublishersTable, "id");
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
    publishers: new PublishersTable(),
  });

  // Make sure we've built the DAG correctly.
  expect(db.publishers.$references).toEqual(new Set());
  expect(db.authors.$references).toEqual(new Set([db.publishers]));
  expect(db.books.$references).toEqual(new Set([db.authors]));

  await db.createTables();

  // Make sure that we get errors if we violate referential integrity
  await expect(
    db.insertInto(db.books).values({
      title: "Intro to Introductions",
      authorId: 123,
    }),
  ).rejects.toThrow();

  await db.insertInto(db.publishers).values({ name: "Big Book LLC" });
  await db.insertInto(db.authors).values({ publisherId: 1, name: "Travis" });
  expect(
    await db
      .insertInto(db.books)
      .values({ title: "Intro to Introductions", authorId: 1 })
      .returning("id"),
  ).toEqual({ id: 2 });
  await db
    .insertInto(db.books)
    .values({ title: "Advanced Greetings", authorId: 1 });

  const authorBooks = await db
    .select({ authorName: db.authors.name, title: db.books.title })
    .from(db.authors.join(db.books, db.authors.id.eq(db.books.authorId)));
  expect(authorBooks).toEqual([
    { authorName: "Travis", title: "Intro to Introductions" },
    { authorName: "Travis", title: "Advanced Greetings" },
  ]);

  const publisherBooks = await db
    .select({ publisherName: db.publishers.name, bookTitle: db.books.title })
    .from(
      db.publishers.join(
        db.authors.join(db.books, db.books.authorId.eq(db.authors.id)),
        db.publishers.id.eq(db.authors.publisherId),
      ),
    );
  expect(publisherBooks).toEqual([
    { publisherName: "Big Book LLC", bookTitle: "Intro to Introductions" },
    { publisherName: "Big Book LLC", bookTitle: "Advanced Greetings" },
  ]);
});
