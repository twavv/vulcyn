import { IsExact, assert, Has } from "conditional-type-checks";
import {
  IntColumn,
  TextColumn,
  Table,
  TableWrapper,
  Database,
  SerialColumn,
} from "@";
import { InsertInterface, InsertQueryBuilder } from "@/querybuilders";

test("InsertInterface has correct shape", () => {
  class UserTable extends Table {
    id = new IntColumn();
    name = new TextColumn();
  }

  type UserTW = TableWrapper<"users", UserTable>;
  type UserInsertInterface = InsertInterface<UserTW>;
  assert<IsExact<UserInsertInterface, { id: number; name: string }>>(true);
});

test("InsertQueryBuilder with returning", () => {
  class UserTable extends Table {
    id = new SerialColumn();
    name = new TextColumn();
  }

  const db = Database(null as any, { users: new UserTable() });
  const query = db
    .insertInto(db.users)
    .values({ name: "Travis" })
    .returning("id", "name");
  expect(query).toBeInstanceOf(InsertQueryBuilder);
  assert<Has<typeof query, Promise<{ id: number; name: string }>>>(true);

  const sql = query.$toSQL();
  expect(sql).toMatch(/RETURNING (users\.)?id, (users\.)?name/);
});
