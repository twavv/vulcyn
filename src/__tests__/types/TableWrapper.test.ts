import { assert, IsExact } from "conditional-type-checks";
import { IntColumn, StringColumn } from "../../columntypes";
import ColumnWrapper, { ColumnWrapperTSType } from "../../ColumnWrapper";
import { TableWrapperMap } from "../../Database";
import Table from "../../Table";
import TableWrapper, { TableWrapperColumns } from "../../TableWrapper";

test("TableWrapper correctly maps column types", () => {
  class User extends Table {
    id = new IntColumn();
    name = new StringColumn();
  }

  const userWrapper = TableWrapper("users", new User());
  assert<IsExact<typeof userWrapper, TableWrapper<"users", User>>>(true);

  assert<IsExact<typeof userWrapper["id"], ColumnWrapper<"id", number>>>(true);
  assert<IsExact<typeof userWrapper["id"], ColumnWrapper<"id", string>>>(false);

  assert<IsExact<ColumnWrapperTSType<typeof userWrapper.id>, number>>(true);
  assert<IsExact<ColumnWrapperTSType<typeof userWrapper.id>, string>>(false);
  assert<IsExact<ColumnWrapperTSType<typeof userWrapper.id>, {}>>(false);

  assert<IsExact<ColumnWrapperTSType<typeof userWrapper.name>, string>>(true);
  assert<IsExact<ColumnWrapperTSType<typeof userWrapper.name>, number>>(false);
  assert<IsExact<ColumnWrapperTSType<typeof userWrapper.name>, {}>>(false);
});

test("TableWrapperColumns doesn't include non-columns", () => {
  class UserTable extends Table {
    id = new IntColumn();
    name = new StringColumn();
  }
  type TWC = TableWrapperColumns<UserTable>;
  assert<
    IsExact<
      TableWrapperColumns<UserTable>,
      { id: ColumnWrapper<"id", number>; name: ColumnWrapper<"name", string> }
    >
  >(true);
});
