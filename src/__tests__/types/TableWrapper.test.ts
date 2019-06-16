import { IsExact, assert } from "conditional-type-checks";
import {
  ColumnWrapper,
  ColumnWrapperTSType,
  IntColumn,
  TextColumn,
  Table,
  TableWrapper,
  TableWrapperColumns,
} from "@";

test("TableWrapper correctly maps column types", () => {
  class User extends Table {
    id = new IntColumn();
    name = new TextColumn();
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
    name = new TextColumn();
  }
  assert<
    IsExact<
      TableWrapperColumns<UserTable>,
      { id: ColumnWrapper<"id", number>; name: ColumnWrapper<"name", string> }
    >
  >(true);
});
