import LogicalOperator from "../LogicalOperator";
import Infix from "../Infix";
import SQLFragment from "../SQLFragment";
import Parameter from "../Parameter";
import ReductionContext from "../ReductionContext";

test("LogicalOperator AND", () => {
  expect(
    new LogicalOperator("and", [
      new Infix(">", new SQLFragment("age"), new Parameter(21)),
      new Infix("=", new SQLFragment("location"), new Parameter("NYC")),
    ]).toSQL(new ReductionContext())
  ).toEqual("(age > $1) AND (location = $2)");
});