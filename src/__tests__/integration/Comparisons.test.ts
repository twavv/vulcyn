import { getPG, setupPG, teardownPG } from "./utils";
import {
  and,
  Database,
  IntColumn,
  or,
  SerialColumn,
  Table,
  TextColumn,
} from "@";

beforeAll(setupPG);
afterAll(teardownPG);

test("Comparisons integration tests", async () => {
  class AnimalTable extends Table {
    id = new SerialColumn();
    name = new TextColumn();
    species = new TextColumn();
    age = new IntColumn();
  }

  const db = Database(getPG(), {
    animals: new AnimalTable(),
  });
  await db.createTables();

  const Animal = (name: string, species: string, age: number) => ({
    name,
    species,
    age,
  });

  // Use set comparison because we don't care about order.
  const NameSet = (...names: string[]) =>
    new Set(names.map((name) => ({ name })));

  const animals = [
    Animal("Travis", "human", 22),
    Animal("Walter", "cat", 1),
    Animal("Sylvia", "cat", 3),
    Animal("Bubbles", "fish", 3),
  ];
  for (const a of animals) {
    await db.insertInto(db.animals).values(a);
  }

  expect(
    new Set(await db.select(db.animals, "name").where(db.animals.age.eq(3))),
  ).toEqual(NameSet("Bubbles", "Sylvia"));
  expect(
    new Set(await db.select(db.animals, "name").where(db.animals.age.gt(3))),
  ).toEqual(NameSet("Travis"));
  expect(
    new Set(await db.select(db.animals, "name").where(db.animals.age.gte(3))),
  ).toEqual(NameSet("Travis", "Sylvia", "Bubbles"));
  expect(
    new Set(await db.select(db.animals, "name").where(db.animals.age.lt(3))),
  ).toEqual(NameSet("Walter"));
  expect(
    new Set(await db.select(db.animals, "name").where(db.animals.age.lte(3))),
  ).toEqual(NameSet("Walter", "Bubbles", "Sylvia"));

  expect(
    new Set(
      await db
        .select(db.animals, "name")
        .where(
          or(
            db.animals.age.gt(3),
            and(db.animals.age.lt(3), db.animals.species.eq("cat")),
          ),
        ),
    ),
  ).toEqual(NameSet("Travis", "Walter"));
});
