import type { Connection, RowStatement, StatementOption } from "snowflake-sdk";
import { promisifyStatement } from "./promisify-statement.js";

/**
 * Promisifies Snowflake SDK functions that use the StatementCallback pattern.
 *
 * In Snowflake's SDK, methods like execute and fetchResult use a non-standard
 * callback pattern where the callback is provided in the `complete` property of an
 * options object, rather than as the last argument.
 *
 * This utility wrapper enables these methods to work with either:
 * 1. Traditional callbacks (by passing a function to options.complete)
 * 2. Promises (by not providing a callback)
 *
 * When using the Promise approach, it returns a Promise that resolves to an object
 * with:
 * - statement: The promisified Snowflake Statement object (available immediately)
 * - resultsPromise: A Promise that resolves with the query results when completed
 *
 * This approach allows you to both:
 * - Access the Statement object immediately (for cancellation or other operations)
 * - Await the resultsPromise to get the actual query results
 *
 * @param target The Snowflake connection object containing the function
 * @param fn The Snowflake function to promisify (e.g., execute, fetchResult)
 * @returns A function supporting both callback and Promise patterns
 */
export function promisifyOptionsCallbackFunction<RowType, T extends RowStatement>(
  target: Connection,
  fn: (options: StatementOption) => T,
) {
  return function (
    options: StatementOption,
  ): T | { statement: T; resultsPromise: Promise<RowType[] | undefined> } {
    // If options includes a `complete` callback, call the original function
    if (options && typeof options.complete === "function") {
      return fn.call(target, options);
    }

    // Otherwise, handle the Promise pattern
    let rowsResolve: (value: RowType[] | undefined) => void;
    let rowsReject: (reason: Error) => void;
    const resultsPromise = new Promise<RowType[] | undefined>((resolve, reject) => {
      rowsResolve = resolve;
      rowsReject = reject;
    });

    // Create a new options object with a `complete` callback to capture row results
    const newOptions: StatementOption = { ...options };

    newOptions.complete = (err, stmt, rows) => {
      if (err) {
        rowsReject(err);
      } else {
        rowsResolve(rows as RowType[] | undefined);
      }
    };

    // Call the original function and wrap the returned statement in a Promise
    const statement = fn.call(target, newOptions);

    return {
      statement: promisifyStatement<T>(statement),
      resultsPromise,
    };
  };
}
