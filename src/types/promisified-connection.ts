import type snowflake from "snowflake-sdk";
import type { Connection, ConnectionCallback, RowStatement } from "snowflake-sdk";
import type { SetRequired } from "type-fest";
import type { PromisifiedRowStatement } from "./promisified-row-statement.ts";

// Helper definitions to simplify the interface declaration below
type StatementOptionWithoutCallback = Omit<snowflake.StatementOption, "complete">;
type StatementOptionWithCallback = SetRequired<snowflake.StatementOption, "complete">;
type FetchResultOption = Parameters<Connection["fetchResult"]>[0];
type FetchResultOptionWithoutCallback = Omit<FetchResultOption, "complete">;
type FetchResultOptionWithCallback = SetRequired<FetchResultOption, "complete">;
type StatementOptionMethodResult<RowType> = {
  statement: PromisifiedRowStatement;
  resultsPromise: Promise<Array<RowType> | undefined>;
};

export interface PromisifiedConnection extends Connection {
  /** Indicates whether the connection is promisified */
  __isPromisified: true;

  execute(options: StatementOptionWithCallback): RowStatement;
  execute<RowType>(
    options: StatementOptionWithoutCallback,
  ): StatementOptionMethodResult<RowType>;

  fetchResult(options: FetchResultOptionWithCallback): RowStatement;
  fetchResult<RowType>(
    options: FetchResultOptionWithoutCallback,
  ): StatementOptionMethodResult<RowType>;

  connect(callback: ConnectionCallback): Connection;
  connect(): Promise<Connection>;

  connectAsync(callback: ConnectionCallback): Promise<Connection>;
  connectAsync(): Promise<Connection>;

  destroy(fn: ConnectionCallback): void;
  destroy(): Promise<void>;
}
