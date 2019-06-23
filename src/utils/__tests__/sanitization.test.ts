import {
  assertSQLSafeIdentifier,
  camel2snake,
  isSQLSafeIdentifier,
} from "../identifiers";

test("isSQLSafeIdentifier", () => {
  expect(isSQLSafeIdentifier("userId")).toBe(true);
  expect(isSQLSafeIdentifier("user_id")).toBe(true);
  expect(isSQLSafeIdentifier("user-id")).toBe(false);
});

test("assertSQLSafeIdentifier", () => {
  expect(() => assertSQLSafeIdentifier("'foo'")).toThrow();
  expect(() => assertSQLSafeIdentifier("user_id")).not.toThrow();
});

test("camel2snake", () => {
  expect(camel2snake("userId")).toBe("user_id");
  expect(camel2snake("userID")).toBe("user_id");
});
