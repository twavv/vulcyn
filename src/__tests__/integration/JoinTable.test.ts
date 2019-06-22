import { getPG, setupPG, teardownPG } from "./utils";
import { Database, IntColumn, PrimaryKeyConstraint, Table } from "@";

beforeEach(setupPG);
afterEach(teardownPG);

test("Join table", async () => {
  class UserCourses extends Table {
    userid = new IntColumn();
    courseid = new IntColumn();

    pkey = new PrimaryKeyConstraint(UserCourses, "userid", "courseid");
  }

  const pg = getPG();
  const db = Database(pg, { userCourses: new UserCourses() });
  await db.createTables();

  await db.insertInto(db.userCourses).values({ userid: 1, courseid: 1 });
  expect(
    db.insertInto(db.userCourses).values({ userid: 1, courseid: 1 }),
  ).rejects.toThrow();
});
