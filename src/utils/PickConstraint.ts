/**
 * Get the keys of O that match (extend) constraint C.
 *
 * This is kind of a hack. It works by creating an interface where keys whose
 * value satisfies the constraint map to the key itself, and keys that don't map
 * to undefined, and then getting the union of all values in the new interface.
 * This results in a union of all the key names that satisfy the constraint, as
 * well as never (which can't be an object key anyway).
 *
 * Inspired by https://link.medium.com/bOKpZFxJnX
 */
export type PickConstraintKeys<O, C> = {
  [K in keyof O]:
  O[K] extends C ? K : never
}[keyof O];

export type PickConstraintsKeysIgnoringNull<O, C> = {
  [K in keyof O]:
  NonNullable<O[K]> extends C ? K : never
}[keyof O];

export type PickConstraint<O, C> = Pick<
  O,
  PickConstraintKeys<O, C>
>;

export type PickConstraintIgnoringNull<O, C> = Pick<
  O,
  PickConstraintsKeysIgnoringNull<O, C>
>;
