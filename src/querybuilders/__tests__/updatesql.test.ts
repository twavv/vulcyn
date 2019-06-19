import {
  Database,
  IntColumn,
  or,
  SerialColumn,
  Table,
  createTableWrapper,
  TextColumn,
} from "@";
import { UpdateQueryBuilder } from "@/querybuilders";
import { ReductionContext } from "@/expr";

test("UpdateQueryBuilder generates correct SQL", () => {
  class MyTable extends Table {
    id = new SerialColumn();
    name = new TextColumn();
    number = new IntColumn().nullable();
  }
  const tw = createTableWrapper(
    (null as any) as Database,
    "mytable",
    new MyTable(),
  );

  const qb = new UpdateQueryBuilder(null as any, tw)
    .set({ name: "trav", number: null })
    .where(or(tw.id.eq(123), tw.id.eq(456)));

  // Generate the query
  const rc = new ReductionContext();
  const sql = qb.$toSQL(rc);

  // NOTE: We treat the order of the query parameters as implementation details.
  expect(sql).toEqual(
    expect.stringMatching(
      /^UPDATE mytable SET name = \$[0-9], number = \$[0-9] WHERE \((mytable\.)?id = \$[0-9]\) OR \((mytable\.)?id = \$[0-9]\);$/,
    ),
  );
  expect(new Set(rc.parameters())).toEqual(new Set(["trav", null, 123, 456]));
});
