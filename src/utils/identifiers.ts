const ALPHANUMERIC_REGEX = /^[A-Za-z_]+$/;

/**
 * Returns true if the identifier is safe for SQL.
 *
 * We don't use parameters for things like column names etc., and they
 *  technically
 */
export function isSQLSafeIdentifier(identifier: string): boolean {
  return !!identifier.match(ALPHANUMERIC_REGEX);
}

export function assertSQLSafeIdentifier(identifier: string) {
  if (!isSQLSafeIdentifier(identifier)) {
    throw new Error(`Invalid (unsafe) SQL identifier: ${identifier}`);
  }
  return identifier;
}

/**
 * Convert a camel-case string into a snake-case string.
 */
export function camel2snake(identifier: string): string {
  return identifier
    .replace(/([a-z][A-Z])/, (s, c) => c[0].toLowerCase() + "_" + c[1])
    .toLowerCase();
}
