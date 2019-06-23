import { Table, TableWrapper } from "@";
import { ClassOf } from "@/utils";
import { Constraint } from "./Constraint";
import { ColumnConstraint } from "@/expr";

/**
 * A uniqueness constraint on at least one column.
 */
export class UniqueConstraint<T extends Table = Table> extends Constraint<T> {
  $columns: Array<string & keyof T>;

  constructor($table: ClassOf<T>, ...columns: Array<string & keyof T>) {
    super($table);
    if (columns.length < 1) {
      throw new Error(`A UniqueConstraint must be on at least one column.`);
    }
    this.$columns = columns;
  }

  $creationExpr(tableWrapper: TableWrapper<string, T>) {
    const columns = this.$columns.map(
      (column) => tableWrapper.$getColumnWrapper(column).$columnName,
    );
    return new ColumnConstraint("unique", columns);
  }
}
