import {IntColumn, StringColumn} from "../../columntypes";
import Table from "../../Table";
import TableWrapper from "../../TableWrapper";
import {getPG, setupPG, teardownPG} from "./utils";

beforeEach(setupPG);
afterEach(teardownPG);

test("it works", async () => {

  class User extends Table {
    id = new IntColumn();
    name = new StringColumn().nullable();
  }
  const UserWrapper = TableWrapper("users", new User());

  const pg = getPG();
  await pg.query(UserWrapper.$creationSQL());

  await pg.query(`INSERT INTO users (id, name) VALUES (123, 'trav');`);
  const result = await pg.query(`SELECT * FROM users;`);

  const {rows} = result;
  expect(rows).toHaveLength(1);

  const myUser = rows[0];
  expect(myUser).toEqual({
    id: 123,
    name: "trav",
  });
});