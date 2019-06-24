import { assert, IsExact } from "conditional-type-checks";
import { Database, JSONBColumn, Table } from "@";
import { SelectableTSType } from "@/interfaces";
import { ReductionContext } from "@/expr";
import { JSONBAccessorBuilder } from "../json";

test("JSONBAccessorBuilder", () => {
  interface Payload {
    notOptional: {
      bool: boolean;
    };
    optional?: {
      number: number;
    };
  }

  class MyTable extends Table {
    payload = new JSONBColumn<Payload>();
    nullablePayload = new JSONBColumn<Payload>().nullable();
  }

  const db = Database(null as any, { myTable: new MyTable() });

  const myOptional = new JSONBAccessorBuilder(db.myTable.payload).get(
    "optional",
  );
  assert<
    IsExact<SelectableTSType<typeof myOptional>, { number: number } | null>
  >(true);
  expect(
    myOptional.$selectableExpr("myOptional").toSQL(new ReductionContext()),
  ).toEqual("my_table.payload->'optional' AS \"myOptional\"");

  const myNumber = new JSONBAccessorBuilder(db.myTable.payload)
    .get("optional")
    .get("number");
  assert<IsExact<SelectableTSType<typeof myNumber>, number | null>>(true);
  expect(myNumber.$selectableExpr("foo").toSQL(new ReductionContext())).toEqual(
    "my_table.payload->'optional'->'number' AS \"foo\"",
  );

  const myBool = new JSONBAccessorBuilder(db.myTable.payload)
    .get("notOptional")
    .get("bool");
  assert<IsExact<SelectableTSType<typeof myBool>, boolean>>(true);
  expect(myNumber.$selectableExpr("foo").toSQL(new ReductionContext())).toEqual(
    "my_table.payload->'optional'->'number' AS \"foo\"",
  );

  expect(
    db.myTable.payload
      .jsonb()
      .get("optional")
      .$selectableExpr("myOptional")
      .toSQL(new ReductionContext()),
  ).toEqual(`my_table.payload->'optional' AS "myOptional"`);
});
