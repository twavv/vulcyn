/**
 * Return true if the array has entry and refine the type to a tuple.
 *
 * This is useful to safely coerce array types to tuple types where the first
 * entry must exist.
 */
export function hasEntry<T>(a: T[]): a is [T, ...T[]] {
  return a.length >= 1;
}
