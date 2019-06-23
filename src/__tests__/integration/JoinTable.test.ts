import { getPG, setupPG, teardownPG } from "./utils";
import { Database, IntColumn, PrimaryKeyConstraint, Table } from "@";

beforeEach(setupPG);
afterEach(teardownPG);

test("Join table", async () => {
  class UserCourses extends Table {
    userId = new IntColumn();
    courseId = new IntColumn();

    pkey = new PrimaryKeyConstraint(UserCourses, "userId", "courseId");
  }

  const pg = getPG();
  const db = Database(pg, { userCourses: new UserCourses() });
  await db.createTables();

  expect(db.userCourses.$tableName.sql).toBe("user_courses");
  await db.insertInto(db.userCourses).values({ userId: 1, courseId: 1 });
  expect(await db.selectOne(db.userCourses, "userId", "courseId")).toEqual({
    userId: 1,
    courseId: 1,
  });
  expect(
    db.insertInto(db.userCourses).values({ userId: 1, courseId: 1 }),
  ).rejects.toThrow();
});
