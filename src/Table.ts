import Column from "./Column";
import { itisa, PickConstraint } from "@/utils";

class Table {
  get $_iama() {
    return "Table";
  }

  /**
   * Return the custom table name, if any.
   *
   * This method can be defined to override the table name used when querying
   * table.
   *
   * @param givenName - The name given to the {@link Database} constructor as
   *    the `tableMap` argument.
   */
  $getTableDBName(givenName: string): string | undefined {
    return givenName;
  }
}
export default Table;

export function isTable(x: unknown): x is Table {
  return itisa(x) === "Table";
}

export type TableColumns<T extends Table> = PickConstraint<T, Column<any>>;
