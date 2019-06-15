import { IsExact, assert } from "conditional-type-checks";
import Table from "@/Table";
import { IntColumn, StringColumn } from "@/columntypes";
import TableWrapper from "@/TableWrapper";
import { InsertInterface } from "../../InsertQueryBuilder";

test("InsertInterface has correct shape", () => {
  class UserTable extends Table {
    id = new IntColumn();
    name = new StringColumn();
  }
  type UserTW = TableWrapper<"users", UserTable>;
  type UserInsertInterface = InsertInterface<UserTW>;
  assert<IsExact<UserInsertInterface, { id: number; name: string }>>(true);
});
