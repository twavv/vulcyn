import { Database, IntColumn, SerialColumn, Table, TextColumn } from "@";
import { UpdateSpec } from "@/querybuilders";
import { assert, IsExact } from "conditional-type-checks";

test("UpdateSpec has correct shape", () => {
  class Pets extends Table {
    id = new SerialColumn();
    name = new TextColumn();
    species = new TextColumn();
    age = new IntColumn();
  }
  const db = ({} as any) as Database<{ pets: Pets }>;
  const pets = db.pets;

  const _update: UpdateSpec<typeof pets> = {
    name: "Sylvia",
    id: undefined,
  };

  assert<
    IsExact<
      UpdateSpec<typeof db.pets>,
      { id?: number; name?: string; species?: string; age?: number }
    >
  >(true);
});
