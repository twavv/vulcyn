import {
  IntColumn,
  SerialColumn,
  TextColumn,
  UniqueConstraint,
  PrimaryKeyConstraint,
  Table,
} from "@";
import { getPG, setupPG, teardownPG } from "./utils";
import { Database } from "../../Database";

beforeEach(setupPG);
afterEach(teardownPG);

class User extends Table {
  id = new SerialColumn();
  firstName = new TextColumn();
  lastName = new TextColumn();

  name_constraint = new UniqueConstraint(User, "firstName", "lastName");
}

class Post extends Table {
  id = new SerialColumn();
  authorId = new IntColumn().references(User, "id");
  body = new TextColumn();
}

class Rating extends Table {
  userId = new IntColumn().references(User, "id");
  postId = new IntColumn().references(Post, "id");
  rating = new IntColumn();

  pkey_constraint = new PrimaryKeyConstraint(Rating, "userId", "postId");
}

test("Multi-column constraints integration test", async () => {
  const db = Database(getPG(), {
    users: new User(),
    posts: new Post(),
    ratings: new Rating(),
  });
  await db.createTables();

  await db.insertInto(db.users).values({
    firstName: "Walter",
    lastName: "VonCatt",
  });
  await expect(
    db.insertInto(db.users).values({
      firstName: "Walter",
      lastName: "VonCatt",
    }),
  ).rejects.toThrow();

  await db.insertInto(db.posts).values({
    authorId: 1,
    body: "Meow!",
  });

  await db.insertInto(db.ratings).values({
    userId: 1,
    postId: 1,
    rating: 5,
  });
  await expect(
    db.insertInto(db.ratings).values({
      userId: 1,
      postId: 1,
      rating: 1,
    }),
  ).rejects.toThrow();
});
