import Expr, { PickExpr } from "./Expr";
import ReductionContext from "./ReductionContext";
import Clause from "./Clause";
import Limit from "./Limit";

class Select extends Expr<"select"> {
  columns!: Array<Expr<any>>;
  from!: Clause<"from">;
  where?: Clause<"where">;
  limit?: Limit;

  constructor(args: PickExpr<Select>) {
    super("select");
    Object.assign(this, args);
  }

  toSQL(context: ReductionContext): string {
    return (
      "SELECT " +
      this.columnsSQL(context) +
      this.fromSQL(context) +
      this.whereSQL(context) +
      this.limitSQL(context) +
      ";"
    );
  }

  private columnsSQL(rc: ReductionContext) {
    return this.columns.map((column) => column.toSQL(rc)).join(", ");
  }

  private whereSQL(rc: ReductionContext): string {
    if (this.where) {
      return " " + this.where.toSQL(rc);
    }
    return "";
  }

  private fromSQL(rc: ReductionContext): string {
    return " " + this.from.toSQL(rc);
  }

  private limitSQL(rc: ReductionContext): string {
    if (this.limit) {
      return " " + this.limit.toSQL(rc);
    }
    return "";
  }
}
export default Select;

/*
[ WITH [ RECURSIVE ] with_query [, ...] ]
SELECT [ ALL | DISTINCT [ ON ( expression [, ...] ) ] ]
    [ * | expression [ [ AS ] output_name ] [, ...] ]
    [ FROM from_item [, ...] ]
    [ WHERE condition ]
    [ GROUP BY grouping_element [, ...] ]
    [ HAVING condition [, ...] ]
    [ WINDOW window_name AS ( window_definition ) [, ...] ]
    [ { UNION | INTERSECT | EXCEPT } [ ALL | DISTINCT ] select ]
    [ ORDER BY expression [ ASC | DESC | USING operator ] [ NULLS { FIRST | LAST } ] [, ...] ]
    [ LIMIT { count | ALL } ]
    [ OFFSET start [ ROW | ROWS ] ]
    [ FETCH { FIRST | NEXT } [ count ] { ROW | ROWS } ONLY ]
    [ FOR { UPDATE | NO KEY UPDATE | SHARE | KEY SHARE } [ OF table_name [, ...] ] [ NOWAIT | SKIP LOCKED ] [...] ]

where from_item can be one of:

    [ ONLY ] table_name [ * ] [ [ AS ] alias [ ( column_alias [, ...] ) ] ]
                [ TABLESAMPLE sampling_method ( argument [, ...] ) [ REPEATABLE ( seed ) ] ]
    [ LATERAL ] ( select ) [ AS ] alias [ ( column_alias [, ...] ) ]
    with_query_name [ [ AS ] alias [ ( column_alias [, ...] ) ] ]
    [ LATERAL ] function_name ( [ argument [, ...] ] )
                [ WITH ORDINALITY ] [ [ AS ] alias [ ( column_alias [, ...] ) ] ]
    [ LATERAL ] function_name ( [ argument [, ...] ] ) [ AS ] alias ( column_definition [, ...] )
    [ LATERAL ] function_name ( [ argument [, ...] ] ) AS ( column_definition [, ...] )
    [ LATERAL ] ROWS FROM( function_name ( [ argument [, ...] ] ) [ AS ( column_definition [, ...] ) ] [, ...] )
                [ WITH ORDINALITY ] [ [ AS ] alias [ ( column_alias [, ...] ) ] ]
    from_item [ NATURAL ] join_type from_item [ ON join_condition | USING ( join_column [, ...] ) ]

and grouping_element can be one of:

    ( )
    expression
    ( expression [, ...] )
    ROLLUP ( { expression | ( expression [, ...] ) } [, ...] )
    CUBE ( { expression | ( expression [, ...] ) } [, ...] )
    GROUPING SETS ( grouping_element [, ...] )

and with_query is:

    with_query_name [ ( column_name [, ...] ) ] AS ( select | values | insert | update | delete )

TABLE [ ONLY ] table_name [ * ]
 */
