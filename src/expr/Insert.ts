/*
 [ WITH [ RECURSIVE ] with_query [, ...] ]
   INSERT INTO table_name [ AS alias ] [ ( column_name [, ...] ) ]
   [ OVERRIDING { SYSTEM | USER} VALUE ]
   { DEFAULT VALUES | VALUES ( { expression | DEFAULT } [, ...] ) [, ...] | query }
   [ ON CONFLICT [ conflict_target ] conflict_action ]
   [ RETURNING * | output_expression [ [ AS ] output_name ] [, ...] ]

   where conflict_target can be one of:

   ( { index_column_name | ( index_expression ) } [ COLLATE collation ] [ opclass ] [, ...] ) [ WHERE index_predicate ]
   ON CONSTRAINT constraint_name

   and conflict_action is one of:

   DO NOTHING
   DO UPDATE SET { column_name = { expression | DEFAULT } |
                      ( column_name [, ...] ) = [ ROW ] ( { expression | DEFAULT } [, ...] ) |
                      ( column_name [, ...] ) = ( sub-SELECT )
                    } [, ...]
   [ WHERE condition ]
 */

import { Expr, PickExpr } from "./Expr";
import { ReductionContext } from "./ReductionContext";

/**
 * An INSERT query Expr.
 *
 * @todo
 *    * Support for RETURNING
 */
export class Insert extends Expr<"select"> {
  tableName!: Expr<string>;
  columns!: Array<Expr<string>>;
  values!: Array<Expr<string>>;

  constructor(args: PickExpr<Insert>) {
    super("select");
    Object.assign(this, args);
  }

  toSQL(rc: ReductionContext): string {
    return (
      "INSERT INTO " +
      this.tableNameSQL(rc) +
      this.columnsSQL(rc) +
      this.valuesSQL(rc) +
      ";"
    );
  }

  private tableNameSQL(rc: ReductionContext) {
    return this.tableName.toSQL(rc);
  }

  private columnsSQL(rc: ReductionContext) {
    return (
      " (" + this.columns.map((column) => column.toSQL(rc)).join(", ") + ")"
    );
  }

  private valuesSQL(rc: ReductionContext) {
    return (
      " VALUES (" + this.values.map((value) => value.toSQL(rc)).join(", ") + ")"
    );
  }
}
