/**
 * Utilities for integration tests.
 *
 * Lots of this is just a hack around how we can't do very good setup and
 * teardown code with Jest, so we have to use globals.
 */

import { Client } from "pg";
import { debug } from "@/utils";

let adminClient: Client | undefined = undefined;

let testDBName: string | undefined = undefined;
let testClient: Client | undefined = undefined;

export function getPG(): Client {
  if (testClient === undefined) {
    throw new Error(
      `Postgres is not initialized - did you call setupPG in beforeEach?`,
    );
  }
  return testClient;
}

function newId() {
  return (
    Math.random()
      // Convert to alphanumeric (base 36)
      .toString(36)
      // Remove trailing "0." since Math.random returns number in (0, 1)
      .substring(2)
  );
}

async function createClient(dbName?: string) {
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
    database: dbName || DBTS_TEST_PG_DATABASE,
    user: DBTS_TEST_PG_USER,
    password: DBTS_TEST_PG_PASSWORD,
  });
  await client.connect();
  return client;
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
  debug("Setting up Postgres for integration test...");
  if (adminClient || testClient || testDBName) {
    throw new Error(
      `Postgres client already initialized - did you forget to call teardownPG in beforeEach?`,
    );
  }
  adminClient = await createClient();
  testDBName = `x${newId()}x`;
  await adminClient.query(`CREATE DATABASE ${testDBName}`);

  testClient = await createClient(testDBName);
  debug(`Created test database ${testDBName}.`);
  debug("Finished setting up Postgres.");
}

export async function teardownPG() {
  debug("Tearing down Postgres after integration test...");
  if (!adminClient || !testClient) {
    throw new Error(
      `Cannot teardown Postgres - did you forget to initialize it?`,
    );
  }
  await testClient.end();
  await adminClient.query(`DROP DATABASE ${testDBName};`);
  await adminClient.end();
  testClient = undefined;
  adminClient = undefined;
  debug("Tore down Postgres!");
}
