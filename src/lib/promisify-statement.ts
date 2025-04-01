import type { RowStatement } from "snowflake-sdk";
import type { PromisifiedRowStatement } from "../types/promisified-row-statement.js";
import { promisifyOrNot } from "./promisify-or-not.js";

// Define a type for the callback function expected by promisifyOrNot
type PromisifyCallback<T> = (error: Error | null, result: T) => void;

/**
 * Given a Snowflake RowStatement object or FileAndStageBindStatement (which is a subclass of RowStatement),
 * returns a proxy with promisified methods.
 *
 * To support compatibility with the callback-based API, we continue to support
 * calling these methods using callbacks. But if a callback is not provided, a
 * Promise is returned.
 *
 * @param stmt - The Snowflake Statement object to promisify.
 * @returns A proxy with promisified methods that matches the PromisifiedRowStatement interface.
 */
export function promisifyStatement<T extends RowStatement>(
  stmt: T,
): T & PromisifiedRowStatement {
  // If the Statement is already promisified, return it as-is
  if (stmt && Object.prototype.hasOwnProperty.call(stmt, "__isPromisified")) {
    return stmt as T & PromisifiedRowStatement;
  }

  return new Proxy(stmt, {
    get(target, prop, receiver) {
      // Return true for the __isPromisified property
      if (prop === "__isPromisified") {
        return true;
      }

      const originalValue = Reflect.get(target, prop, receiver);

      if (typeof originalValue === "function") {
        switch (prop) {
          // Methods with a traditional callback
          case "cancel":
            // Type assertion to match the expected signature for promisifyOrNot
            return promisifyOrNot(
              originalValue as (
                ...args: [...unknown[], PromisifyCallback<void>]
              ) => unknown,
            ).bind(target);

          default:
            return originalValue.bind(target);
        }
      }

      // For everything else, return the original value
      return originalValue;
    },
  }) as T & PromisifiedRowStatement;
}
