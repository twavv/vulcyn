import { SerialColumn, TextColumn, JSONBColumn, Table, Database } from "@";
import { getPG, setupPG, teardownPG } from "./utils";
import { jsonbBuildObject } from "@/functions/jsonb";
import { assert, IsExact } from "conditional-type-checks";

beforeEach(setupPG);
afterEach(teardownPG);

interface ItemMetadata {
  color: string;
}
interface ItemAttributes {
  completed: boolean;
}
class Item extends Table {
  id = new SerialColumn();
  name = new TextColumn();
  metadata = new JSONBColumn<ItemMetadata>();
  attributes = new JSONBColumn<ItemAttributes>().default({ completed: false });
}

test("Multi-column constraints integration test", async () => {
  const db = Database(getPG(), {
    items: new Item(),
  });
  await db.createTables();

  await db.insertInto(db.items).values({
    name: "Foo",
    metadata: {
      color: "#ff0000",
    },
  });

  expect(
    await db.selectOne(db.items, "name", "metadata", "attributes"),
  ).toEqual({
    name: "Foo",
    metadata: {
      color: "#ff0000",
    },
    attributes: {
      completed: false,
    },
  });

  expect(
    await db
      .selectOne({
        myColor: db.items.metadata.jsonb().get("color"),
      })
      .from(db.items),
  ).toEqual({
    myColor: "#ff0000",
  });

  const jsonbBuildObjectPayload = await db
    .select({
      data: jsonbBuildObject({ id: db.items.id, name: db.items.name }),
    })
    .from(db.items)
    .where(db.items.name.eq("Foo"));
  expect(jsonbBuildObjectPayload).toEqual([{ data: { id: 1, name: "Foo" } }]);

  assert<
    IsExact<
      typeof jsonbBuildObjectPayload,
      Array<{ data: { id: number; name: string } }>
    >
  >(true);
});
