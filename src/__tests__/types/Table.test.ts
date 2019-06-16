import { Has, assert } from "conditional-type-checks";
import { Column, IntColumn, TextColumn, Table, TableColumns } from "@";

test("TableColumns has correct shape", () => {
  class UserTable extends Table {
    id = new IntColumn();
    name = new TextColumn();
  }

  type TC = TableColumns<UserTable>;

  // NOTE: We use Has because Column<number> is not exactly IntColumn
  assert<Has<TC, { id: Column<number>; name: Column<string> }>>(true);
});
