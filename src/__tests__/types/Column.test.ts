import { IsExact, assert } from "conditional-type-checks";

import Column, { ColumnTSType } from "@/Column";
import { StringColumn } from "@/columntypes";

test("Column types compare sanely", () => {
  assert<IsExact<Column<string>, Column<number>>>(false);
});

test("Column has correct TSType", () => {
  assert<IsExact<ColumnTSType<Column<string>>, string>>(true);
  assert<IsExact<ColumnTSType<Column<string>>, {}>>(false);
  assert<IsExact<ColumnTSType<Column<string>>, unknown>>(false);
});

test("Nullable columns have correct TSType", () => {
  const nonNullString = new StringColumn();
  assert<IsExact<typeof nonNullString, Column<string | null>>>(false);

  const nullString = new StringColumn().nullable();
  assert<
    IsExact<typeof nullString, Column<string | null, string | null | undefined>>
  >(true);
  assert<IsExact<ColumnTSType<typeof nullString>, string | null>>(true);
});
