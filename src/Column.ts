import { ColumnWrapper } from "@/ColumnWrapper";
import { Table } from "@/Table";
import { itisa } from "@/utils";
import { CreateTableColumn, Expr, LTRTokens, SQLFragment } from "@/expr";

/**
 * A column in a table.
 *
 * This is used when declaring tables.
 *
 * @todo
 *    Support more column constraints.
 *    https://www.postgresql.org/docs/10/sql-createtable.html
 */
export abstract class Column<T, InsertionType = T> {
  abstract $pgType: string;

  get $_iama() {
    return "Column";
  }

  // These are never actually set but enable some TypeScript conveniences and
  // help prevent TypeScript from collapsing Column<int> to Column<string>
  // (which happens if the class itself makes no reference to the generic type).
  $_type!: T;
  $_insertionType!: InsertionType;

  protected $nullable?: boolean;
  protected $default?: Expr<string>;
  protected $unique?: boolean;
  protected $references?: {
    tableClass: typeof Table;
    columnName: string;
  };

  $prepare(columnWrapper: ColumnWrapper<string, T, InsertionType>) {
    if (this.$references) {
      columnWrapper.$tableWrapper.$addReference(this.$references.tableClass);
    }
  }

  nullable(
    isNullable?: true,
  ): Column<T | null, InsertionType | undefined | null>;
  nullable(
    isNullable: false,
  ): Column<Exclude<T, null>, Exclude<InsertionType, undefined | null>>;
  nullable(isNullable: boolean = true) {
    this.$nullable = isNullable;
    return this as any;
  }

  /**
   * Set the default value of the column to an Expr.
   *
   * @todo
   *    This is named defaultExpr to denote that the argument is not a *value*,
   *    but rather, an Expr. We should also implement a .default() that will
   *    appropriately escape the value and convert it to an Expr (it's work
   *    nothing that CREATE TABLE queries can't handle parameters so this is not
   *    entirely trivial).
   */
  defaultExpr(expr: Expr<string>): Column<T, InsertionType | undefined> {
    this.$default = expr;
    return this;
  }

  unique(isUnique: boolean = true) {
    this.$unique = isUnique;
    return this;
  }

  references<TB extends Table, N extends keyof TB & string>(
    tableClass: { new (...args: any[]): TB },
    columnName: N,
  ) {
    this.$references = { tableClass, columnName };
    return this;
  }

  $creationExpr(
    columnWrapper: ColumnWrapper<string, T, InsertionType>,
    name: string,
  ) {
    return new CreateTableColumn({
      name: new SQLFragment(name),
      dataType: new SQLFragment(this.$pgType),
      constraint: this.$constraintExpr(columnWrapper),
    });
  }

  private $constraintExpr(
    columnWrapper: ColumnWrapper<string, T, InsertionType>,
  ) {
    const tokens = new LTRTokens();

    if (this.$nullable) {
      tokens.appendToken(new SQLFragment("NULL"));
    } else {
      tokens.appendToken(new SQLFragment("NOT NULL"));
    }

    if (this.$default) {
      tokens.appendToken(new SQLFragment("DEFAULT"), this.$default);
    }

    if (this.$unique) {
      tokens.appendToken(new SQLFragment("UNIQUE"));
    }

    if (this.$references) {
      const db = columnWrapper.$db;
      const { tableClass, columnName } = this.$references;
      const tableWrapper = db.$getTableWrapperForTable(tableClass);
      const refColumn = tableWrapper.$getColumnByName(columnName);

      tokens.appendToken(
        new SQLFragment(
          `REFERENCES ${tableWrapper.$tableName}(${refColumn.$columnName})`,
        ),
      );
    }

    return tokens;
  }
}

export type ColumnTSType<C extends Column<any>> = C["$_type"];
export type ColumnTSInsertionType<C extends Column<any>> = C["$_insertionType"];

export function isColumn(x: unknown): x is Column<unknown> {
  return itisa(x) === "Column";
}
