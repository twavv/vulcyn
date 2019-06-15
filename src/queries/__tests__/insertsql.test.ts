import Table from "@/Table";
import { IntColumn, StringColumn } from "@/columntypes";
import Database from "@/Database";
import ReductionContext from "@/expr/ReductionContext";
import InsertQueryBuilder from "../InsertQueryBuilder";

test("InsertQueryBuilder without undefined values", () => {
  class BooksTable extends Table {
    id = new IntColumn();
    name = new StringColumn();
    publisher = new StringColumn().nullable();
  }

  const db = Database(null as any, {
    books: new BooksTable(),
  });

  const q = new InsertQueryBuilder(
    db.books
  ).values({
    id: 123,
    name: "Travis",
    publisher: null
  });

  const rc = new ReductionContext();
  expect(q.$toSQL(rc)).toEqual(
    `INSERT INTO books (id, name, publisher) VALUES ($1, $2, $3);`
  );
  expect(rc.parameters()).toEqual(
    [123, "Travis", null],
  );
});

test("InsertQueryBuilder with undefined values", () => {
  class BooksTable extends Table {
    id = new IntColumn();
    name = new StringColumn();
    publisher = new StringColumn().nullable();
  }

  const db = Database(null as any, {
    books: new BooksTable(),
  });

  const q = new InsertQueryBuilder(
    db.books
  ).values({
    id: 123,
    name: "Travis",
  });

  const rc = new ReductionContext();
  expect(q.$toSQL(rc)).toEqual(
    `INSERT INTO books (id, name) VALUES ($1, $2);`
  );
  expect(rc.parameters()).toEqual(
    [123, "Travis"],
  );
});
