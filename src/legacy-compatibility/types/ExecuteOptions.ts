import { Statement } from "../index.js";

export type FetchAsStringTypes = "String" | "Boolean" | "Number" | "Date" | "JSON";

export interface ExecuteOptions {
  sqlText: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  binds?: any[];
  streamResult?: boolean;
  fetchAsString?: FetchAsStringTypes[];
  // note: the complete callback is not exposed; our Promise wrapper uses it internally
}

export interface InternalExecuteOptions extends ExecuteOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  complete: (err: Error, stmt: Statement, rows: any[] | undefined) => void;
}
