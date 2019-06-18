import {Database, IntColumn, SerialColumn, Table, TextColumn} from "./src";
import {ForeignKeyColumn} from "./src/columns/foreignkey";

class UserTable extends Table {
  id = new SerialColumn();
  name = new TextColumn();
  age = new IntColumn();
}
//
// function references<T extends Table, C extends keyof T>(t: {new (...args: any[]): T}, c: C): T {
// return new t;
// }
//
// references(UserTable, "foo");

class PostsTable extends Table {
  id = new SerialColumn();

  // Hmmm, how to do this?
  userId = new ForeignKeyColumn().references(UserTable, "id");
}

let db = Database(null as any, {users: new UserTable()});

// Simple syntax (no nested ands or ors)
db.select(db.users, "id", "name")
  .where(db.users.name.eq("TravTown"));

db.insertInto(db.users).values({
  name: "Travis",
  age: 22,
});

db
  .select({
    userId: db.users.id,
  })
  .from(db.users);



