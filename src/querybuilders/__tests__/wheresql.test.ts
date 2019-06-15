import { WhereSubquery } from "@/querybuilders/WhereSubquery";
import { ReductionContext, SQLFragment } from "@/expr";

test("WhereSubquery with bare SQLFragment", () => {
  const myQuery = new WhereSubquery(new SQLFragment(`foo = 'bar'`));
  const sql = myQuery.$toExpr().toSQL(new ReductionContext());
  expect(sql).toContain("WHERE ");
  expect(sql).toContain("foo = 'bar'");
});

test("WhereSubquery with builder function", () => {
  const myQuery = new WhereSubquery((q) =>
    q.or(
      (q) =>
        q.and(
          new SQLFragment(`name = 'travtown'`),
          new SQLFragment("age > 21"),
        ),
      new SQLFragment("isadmin = true"),
    ),
  );
  const sql = myQuery.$toExpr().toSQL(new ReductionContext());

  expect(sql).toContain("WHERE ");
  expect(sql).toContain(" AND ");
  expect(sql).toContain(") OR (");
  expect(sql).toContain("name = 'travtown'");
  expect(sql).toContain("age > 21");
  expect(sql).toContain("isadmin = true");
});
