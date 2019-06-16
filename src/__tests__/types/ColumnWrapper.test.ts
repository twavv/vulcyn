import { IsExact, assert } from "conditional-type-checks";
import {
  Column,
  ColumnTSType,
  ColumnWrapper,
  ColumnWrapperTSType,
  TextColumn,
} from "@";

type WrapColumn<N extends string, C extends Column<any>> = ColumnWrapper<
  "colname",
  ColumnTSType<C>
>;

test("ColumnWrapper types compare sanely", () => {
  assert<IsExact<ColumnWrapper<"foo", string>, ColumnWrapper<"foo", number>>>(
    false,
  );
});

test("ColumnWrapper has correct TSType", () => {
  assert<IsExact<ColumnWrapperTSType<ColumnWrapper<"foo", string>>, string>>(
    true,
  );
  assert<IsExact<ColumnWrapperTSType<ColumnWrapper<"foo", string>>, number>>(
    false,
  );
  assert<IsExact<ColumnWrapperTSType<ColumnWrapper<"foo", string>>, unknown>>(
    false,
  );
});

test("Nullable column wrappers have correct TSType", () => {
  const nonNullString = new TextColumn();
  assert<
    IsExact<
      WrapColumn<"colname", typeof nonNullString>,
      ColumnWrapper<"colname", string>
    >
  >(true);
  assert<
    IsExact<
      WrapColumn<"colname", typeof nonNullString>,
      ColumnWrapper<"colname", string | null>
    >
  >(false);

  const nullString = new TextColumn().nullable();
  assert<
    IsExact<
      WrapColumn<"colname", typeof nullString>,
      ColumnWrapper<"colname", string | null>
    >
  >(true);
  assert<
    IsExact<
      WrapColumn<"colname", typeof nullString>,
      ColumnWrapper<"colname", string>
    >
  >(false);
});
