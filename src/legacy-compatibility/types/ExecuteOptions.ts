import type { Statement } from "../index.ts";

export type FetchAsStringTypes = "String" | "Boolean" | "Number" | "Date" | "JSON";

export interface ExecuteOptions {
  sqlText: string;
  // biome-ignore lint/suspicious/noExplicitAny: bind values and result rows are untyped in the Snowflake SDK
  binds?: any[];
  streamResult?: boolean;
  fetchAsString?: FetchAsStringTypes[];
  // note: the complete callback is not exposed; our Promise wrapper uses it internally
}

export interface InternalExecuteOptions extends ExecuteOptions {
  // biome-ignore lint/suspicious/noExplicitAny: bind values and result rows are untyped in the Snowflake SDK
  complete: (err: Error, stmt: Statement, rows: any[] | undefined) => void;
}
