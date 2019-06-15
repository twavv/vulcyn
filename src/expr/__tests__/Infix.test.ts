import Infix from "../Infix";
import Parameter from "../Parameter";
import ReductionContext from "../ReductionContext";

test("Infix", () => {
  const add = new Infix("+", new Parameter(1), new Parameter(2));
  const context = new ReductionContext();
  const addSQL = add.toSQL(context);

  expect(addSQL).toEqual("$1 + $2");
  expect(context.parameters()).toEqual([1, 2]);
});
