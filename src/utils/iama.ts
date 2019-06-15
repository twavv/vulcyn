/**
 * Type guard function that returns true if the input has an $_iama property.
 */
function hasIama(x: unknown): x is { $_iama: unknown } {
  return typeof x === "object" && !!x && "$_iama" in x;
}

/**
 * Get the $_iama of the input (if any).
 */
export function itisa(x: unknown): unknown {
  return hasIama(x) ? x.$_iama : null;
}
