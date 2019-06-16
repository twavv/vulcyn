import { getPG, setupPG, teardownPG } from "./utils";
import { Database, TextColumn, Table, TextEnumColumn } from "@";
import {
  BigintColumn,
  FloatColumn,
  IntColumn,
  SerialColumn,
} from "@/columns/numeric";
import { assert, IsExact } from "conditional-type-checks";

beforeEach(async () => {
  await setupPG();
});

afterEach(async () => {
  await teardownPG();
});

test("Column types integration test", async () => {
  const pg = getPG();

  class MyTable extends Table {
    id = new SerialColumn();

    // Textual types
    text = new TextColumn();
    textenum = new TextEnumColumn<"foo" | "bar">();

    // Numeric types
    smallint = new IntColumn().smallint();
    int = new IntColumn();
    bigint = new BigintColumn();
    float = new FloatColumn();
    double = new FloatColumn().double();
  }

  const db = Database(pg, { myTable: new MyTable() });
  await db.createTables();
  await db.insertInto(db.myTable).values({
    text: "foo",
    textenum: "bar",
    smallint: 123,
    int: 456,
    bigint: 922337203685470,
    float: 1.12345,
    double: 1.12311212312312,
  });

  const result = await db.select(
    db.myTable,
    "id",
    "text",
    "textenum",
    "smallint",
    "int",
    "bigint",
    "float",
    "double",
  );
  expect(result).toHaveLength(1);
  const row = result[0];

  expect(row.id).toBeDefined();

  expect(row.text).toEqual("foo");
  expect(row.textenum).toEqual("bar");
  assert<IsExact<typeof row["textenum"], "foo" | "bar">>(true);

  expect(row.smallint).toEqual(123);
  expect(row.int).toEqual(456);
  // Note: Number(...) here because bigint returns as string.
  expect(Number(row.bigint)).toEqual(922337203685470);
  expect(row.float).toBeCloseTo(1.12345);
  expect(row.double).toBeCloseTo(1.12311212312312);
});
