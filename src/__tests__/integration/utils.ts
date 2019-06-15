import { Client } from "pg";

let pgdb: Client | undefined = undefined;

export function getPG(): Client {
  if (pgdb === undefined) {
    throw new Error(
      `Postgres is not initialized - did you call setupPG in beforeEach?`,
    );
  }
  return pgdb;
}

/**
 * Perform database initialization before running tests.
 *
 * @todo
 *   The connection parameters need to be configurable and we should include
 *   a script (or at the very least, instructions) to spin up a Postgres
 *   instance to test against.
 */
export async function setupPG() {
  if (pgdb) {
    throw new Error(
      `Postgres client already initialized - did you forget to call teardownPG in beforeEach?`,
    );
  }
  const {
    DBTS_TEST_PG_HOST = "localhost",
    DBTS_TEST_PG_PORT = "5432",
    DBTS_TEST_PG_DATABASE = "test",
    DBTS_TEST_PG_USER = "test",
    DBTS_TEST_PG_PASSWORD = "",
  } = process.env;
  const client = new Client({
    host: DBTS_TEST_PG_HOST,
    port: Number(DBTS_TEST_PG_PORT),
    database: DBTS_TEST_PG_DATABASE,
    user: DBTS_TEST_PG_USER,
    password: DBTS_TEST_PG_PASSWORD,
  });
  await client.connect();
  pgdb = client;
}

export async function teardownPG() {
  const client = getPG();
  const tables = (await client.query(
    `SELECT tablename FROM pg_catalog.pg_tables ` +
      `WHERE schemaname = 'public';`,
  )).rows.map(({ tablename }) => tablename);
  await client.query(`DROP TABLE ${tables.join(", ")};`);
  pgdb = undefined;
  await client.end();
}
