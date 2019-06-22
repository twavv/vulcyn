import { Table, TableWrapper } from "@";
import { PrimaryKey, SQLFragment } from "@/expr";
import { Constraint } from "./Constraint";
import { ClassOf } from "@/utils";

/**
 * A primary key constraint on at least one column.
 */
export class PrimaryKeyConstraint<T extends Table = Table> extends Constraint<
  T
> {
  $columns: Array<string & keyof T>;

  constructor($table: ClassOf<T>, ...columns: Array<string & keyof T>) {
    super($table);
    if (columns.length < 1) {
      throw new Error(`A PrimaryKeyConstraint must be on at least one column.`);
    }
    this.$columns = columns;
  }

  $creationExpr(tableWrapper: TableWrapper<string, T>) {
    const columns = this.$columns
      .map((column) => tableWrapper.$getColumnByName(column))
      .map((columnWrapper) => new SQLFragment(columnWrapper.$columnName));
    return new PrimaryKey(columns);
  }
}
