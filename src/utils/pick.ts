/**
 * Theoretically type-safe implementation of Pick<Obj, Keys>.
 * @param obj - The object that keys are picked from.
 * @param keys - The keys of the object that are included in the new object.
 */
export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => keys.includes(k as any)),
  ) as any;
}
