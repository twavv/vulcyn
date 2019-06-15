import {
  Clause,
  Infix,
  Parameter,
  ReductionContext,
  SQLFragment,
} from "@/expr";

test(`Clause generated correct SQL`, () => {
  const myWhere = new Clause(
    "where",
    new Infix(">", new SQLFragment("foo"), new Parameter(123)),
  );

  const myWhereSQL = myWhere.toSQL(new ReductionContext());
  expect(myWhereSQL).toEqual("WHERE foo > $1");
});
