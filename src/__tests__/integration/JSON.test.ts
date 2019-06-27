import { SerialColumn, TextColumn, JSONBColumn, Table, Database } from "@";
import { getPG, setupPG, teardownPG } from "./utils";

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
});
