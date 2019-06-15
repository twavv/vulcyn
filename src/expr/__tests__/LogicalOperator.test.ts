import {
  Infix,
  LogicalOperator,
  Parameter,
  ReductionContext,
  SQLFragment,
} from "@/expr";

test("LogicalOperator AND", () => {
  expect(
    new LogicalOperator("and", [
      new Infix(">", new SQLFragment("age"), new Parameter(21)),
      new Infix("=", new SQLFragment("location"), new Parameter("NYC")),
    ]).toSQL(new ReductionContext()),
  ).toEqual("(age > $1) AND (location = $2)");
});
