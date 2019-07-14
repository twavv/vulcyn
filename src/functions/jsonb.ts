import { SQLFragment } from "@/expr";
import {
  Selectable,
  SelectableObject,
  SelectableObjectTSTypes,
} from "@/interfaces";
import { FunctionCall } from "@/functions/FunctionCall";
import { assertSQLSafeIdentifier } from "@/utils";

export function jsonbBuildObject<O extends SelectableObject>(obj: O) {
  const args = Object.entries(obj)
    .map(([key, selectable]) => {
      console.log((selectable as any).$selectableExpr);
      if (
        !selectable ||
        typeof (selectable as any).$selectableExpr !== "function"
      ) {
        throw new Error(`Arguments to jsonb_build_object must be Selectables.`);
      }
      return [
        new SQLFragment(`'${assertSQLSafeIdentifier(key)}'`),
        (selectable as Selectable<any>).$selectableExpr(null),
      ];
    })
    .flat();
  console.log(args);
  // Need to map Selectable to SelectableTSType
  return new FunctionCall<SelectableObjectTSTypes<O>>(
    "jsonb_build_object",
    args,
  );
}
