import { Database } from "@";
import { getPG, setupPG, teardownPG } from "./utils";
import { PostsTable, UsersTable } from "./tables";
import { assert, IsExact } from "conditional-type-checks";

beforeEach(setupPG);
afterEach(teardownPG);

test("Integration test with users and posts", async () => {
  const pg = getPG();
  const createDB = () =>
    Database(pg, {
      users: new UsersTable(),
      posts: new PostsTable(),
    });
  const db = createDB();

  expect(db.posts.$creationSQL()).toContain("creation_timestamp");
  await db.createTables();

  // TODO:
  // We have to use createDB here because we store a wasCreated flag on the
  // tables in the DB. That should actually be fixed* but this works for now.
  // *We should just have a set of tables that are created instead of storing a
  // mutable flag on the TableWrapper itself.
  await expect(createDB().createTables()).rejects.toThrow();
  await createDB().createTables({ ifNotExists: true });

  const result = await db.select(db.users, "id", "name");
  assert<IsExact<typeof result[0], { id: number; name: string }>>(true);
  expect(result).toEqual([]);

  await db.insertInto(db.users).values({
    name: "Travis",
  });
  await db.insertInto(db.posts).values({
    authorId: 1,
    body: "My first post!",
  });

  const post = await db.selectOne(db.posts, "createdAt");
  expect(post).toBeTruthy();

  const { createdAt } = post!;
  expect(new Date().getTime() - createdAt.getTime()).toBeLessThan(10);
});
