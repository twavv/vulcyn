import { IsExact, assert } from "conditional-type-checks";
import { PickConstraint, PickConstraintIgnoringNull } from "@/utils";

test("PickConstraint has correct shape", () => {
  interface Person {
    name: string;
    age: number;
    address?: string;
  }

  assert<IsExact<PickConstraint<Person, string>, { name: string }>>(true);

  assert<
    IsExact<
      PickConstraintIgnoringNull<Person, string>,
      { name: string; address?: string }
    >
  >(true);

  interface Pet {
    name: string;
    age: number;
    owner: Person;
  }

  assert<
    IsExact<
      PickConstraintIgnoringNull<Pet["owner"], string>,
      { name: string; address?: string }
    >
  >(true);
});
