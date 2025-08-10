import type { RowStatement, StatementCallback } from "snowflake-sdk";

export interface PromisifiedRowStatement extends RowStatement {
  /** Indicates whether the statement is promisified */
  __isPromisified: true;

  cancel(callback: StatementCallback): void;
  cancel(): Promise<void>;
}
