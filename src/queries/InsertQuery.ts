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

class InsertQuery {}