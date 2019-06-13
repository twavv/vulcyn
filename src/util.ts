export function assignGetters(target: any, source: object) {
  Object.entries(source).forEach(([k, v]) => {
    Object.defineProperty(target, k, {
      get() { return v; },
    });
  })
}

/**
 * Theoretically type-safe implementation of Pick<Obj, Keys>.
 * @param obj - The object that keys are picked from.
 * @param keys - The keys of the object that are included in the new object.
 */
export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  console.log(`pick`, obj, keys);
  return Object.fromEntries(Object.entries(obj)
    .filter(([k, _]) => keys.includes(k as any))
  ) as any;
}

/**
 * Type guard function that returns true if the input has an $_iama property.
 */
function hasIama(x: unknown): x is {$_iama: unknown} {
  return (
    typeof x === "object"
    && !!x
    && "$_iama" in x
  );
}

/**
 * Get the $_iama of the input (if any).
 */
export function itisa(x: unknown): unknown {
  return hasIama(x) ? x.$_iama : null;
}
