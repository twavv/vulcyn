# DBTS
An ergonomic Postgres query builder for TypeScript.

[![Build Status](https://travis-ci.org/travigd/dbts.svg?branch=master)](https://travis-ci.org/travigd/dbts)

# A Work in Progress
This project is still very much under construction.
It was inspired by (and some of the API was shamelessly stolen from) the [mammoth](https://github.com/Ff00ff/mammoth) library.

This is mostly meant to be a fun project for me to work on in my spare time.
It is missing **many** features and should not be incorporated into any other project at this point.

# Goals

### Embrace SQL
I love SQL and this project does too.
Importantly, DBTS is **not** an ORM and its usage should make sense to someone who has never seen the library but who knows SQL.

### Painless Client Typing
You shouldn't need to declare interfaces that are not well-typed in order to marshall your data into and out of SQL.
The appropriate `db.select` call in DBTS should return the correct interface with all of the known types.

# Examples

## Declaring Tables
Simply write your tables as a class that extends `Table` using the various `Column` classes.
Pass an object with all of your tables into the `Database` call.
```ts
import {Client} from "pg";
import {Database, Table, IntColumn, TextColumn} from "dbts";

class UserTable extends Table {
  id = new IntColumn();
  name = new TextColumn();
  address = new TextColumn().nullable();
}

const pg = new Client();
await pg.connect();
const db = Database(pg, {
  users: new UserTable(),
});
await db.createTables();
```

There's currently no support for migrations or anything similar.
`db.createTables` simply issues a `CREATE TABLE ` statement for every table that you've defined.

## Querying Data
```ts
const users = db.select(db.users, "id", "name", "address");
```

If you try do do bad things™, you'll get type errors.
```ts
// TS2345: Argument of type '"foo"' is not assignable to parameter of type '"id" | "name" | "address"
db.select(db.users, "foo");

db.select(db.users, "address").then((users) => {
  users.forEach(({address}) => {
    // TS2531: Object is possibly 'null'.
    console.log(address.toUpperCase());
  })
);
```

## Inserting Data
Single-row insertion is super simply (and statically typed!).
Columns with defaults (including nullable columns) need not be specified.
```ts
await db
  .insertInto(db.users)
  .values({
    id: 123,
    name: "Sylvia The Cat",
  });
```

If you try do do bad things™, you'll get type errors.
```ts
// TS2322: Type 'string' is not assignable to type 'number'.
await db
  .insertInto(db.users)
  .values({
    id: "123",
    name: "Sylvia The Cat",
  });
```


## Updating Data
**TODO**

# Safety
All parameters passed into queries are forwarded to Postgres via parameter values (`$1`, `$2`, ...).
You can inspect the SQL generated as well.
```ts
console.log(db
    .insertInto(db.users)
    .values({
      id: 123,
      name: "Sylvia The Cat",
    })
    .$toSQL()
  );
// INSERT INTO users (id, name) VALUES ($1, $2);
```

# Warts
* There is some inconsistency about what things should be constructed with `new` and which things are constructed just
  with function calls. The reason for this is because classes can't implement interfaces with generics.