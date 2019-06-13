import {assert, Has, IsExact} from "conditional-type-checks";
import {IntColumn, StringColumn} from "../../../columntypes";
import Database from "../../../Database";
import Table from "../../../Table";
import SelectQuery, {SelectQueryReturn, SelectRowResult} from "../../SelectQuery";

test("SelectRowResult has correct type", () => {
  class User extends Table {
    id = new IntColumn();
    name = new StringColumn();
  }
  type MyDb = Database<{users: User}>;
  assert<IsExact<
    SelectRowResult<{id: MyDb["users"]["id"]}>,
    {id: number}
  >>(true);
});

test("SelectQueryReturn has correct type for fetch one", () => {
  class User extends Table {
    id = new IntColumn();
    name = new StringColumn();
  }
  type MyDb = Database<{users: User}>;
  type MyQueryReturn = SelectQueryReturn<{
    id: MyDb["users"]["id"],
  }, true>;
  assert<Has<
    MyQueryReturn,
    {id: number} | null
  >>(true);
});

test("SelectQueryReturn has correct type for fetch many", () => {
  class User extends Table {
    id = new IntColumn();
    name = new StringColumn();
  }
  type MyDb = Database<{users: User}>;
  type MyQueryReturn = SelectQueryReturn<{
    id: MyDb["users"]["id"],
  }, false>;
  assert<Has<
    MyQueryReturn,
    Array<{id: number}>
    >>(true);
});

test("SelectQuery has correct SelectRowResult type", () => {
  class User extends Table {
    id = new IntColumn();
    name = new StringColumn();
  }
  type MyDb = Database<{users: User}>;
  type MyQueryOne = SelectQuery<MyDb, {id: MyDb["users"]["id"]}, true>;
  assert<IsExact<
    MyQueryOne["$promise"],
    Promise<{id: number} | null>
  >>(true);

  // Check for extraneous properties.
  assert<Has<
    MyQueryOne["$promise"],
    Promise<{name: string}>
  >>(false);

  type MyQueryMany = SelectQuery<MyDb, {id: MyDb["users"]["id"]}, false>;
  assert<IsExact<
    MyQueryMany["$promise"],
    Promise<Array<{id: number}>>
  >>(true);
});