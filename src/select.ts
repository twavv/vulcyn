import ColumnWrapper, {ColumnWrapperTSType} from "./ColumnWrapper";

export type ColumnInterface = {
  [k: string]: ColumnWrapper<any, any>,
}
export type SelectInterface<T extends ColumnInterface> = {
  [k in keyof T]: ColumnWrapperTSType<T[k]>;
};

export function select<T extends ColumnInterface>(columns: T): SelectInterface<T> {
  return null as any;
}