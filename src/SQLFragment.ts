import {itisa} from "./util";

class SQLFragment {
  get $_iama() {
    return "SQLFragment";
  }

  constructor(public sql: string) {}
}

export default SQLFragment;

export function isSQLFragment(x: unknown): x is SQLFragment {
  return itisa(x) === "SQLFragment";
}