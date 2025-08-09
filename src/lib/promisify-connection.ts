import type { Connection } from "snowflake-sdk";
import { promisifyOptionsCallbackFunction } from "./promisify-options-callback-function.ts";
import { promisifyOrNot } from "./promisify-or-not.ts";
import type { PromisifiedConnection } from "../types/promisified-connection.ts";

/**
 * Given a Snowflake Connection object, returns a proxy with promisified methods.
 *
 * Snowflake's SDK is partially promisified, but key methods such as `execute` are
 * not. We promisify these methods to make them easier to use with async/await.
 *
 * To support compatibility with the callback-based API, we continue to support
 * calling these methods using callbacks. But if a callback is not provided, a
 * Promise is returned.
 *
 * @param conn - The Snowflake Connection object to promisify.
 * @returns A proxy with promisified methods.
 */
export function promisifyConnection(conn: Connection) {
  // If the Connection is already promisified, return it as-is
  if (conn && Object.prototype.hasOwnProperty.call(conn, "__isPromisified")) {
    return conn as PromisifiedConnection;
  }

  const proxy = new Proxy(conn, {
    get(target, prop, receiver) {
      // Return true for the __isPromisified property
      if (prop === "__isPromisified") {
        return true;
      }

      const originalValue = Reflect.get(target, prop, receiver);

      if (typeof originalValue === "function") {
        switch (prop) {
          // Methods that take an options object containing a `complete` property
          // These methods return RowStatement objects that are wrapped with
          // promisifyStatement. `getResultsFromQueryId` is not promisified due to
          // its use case, which would be hard to handle and isn’t needed when using
          // this Promise proxy.
          case "execute":
          case "fetchResult":
            return promisifyOptionsCallbackFunction(target, originalValue);

          // Methods with a traditional callback
          case "connect":
          case "connectAsync":
          case "destroy":
            return promisifyOrNot(originalValue).bind(target);

          default:
            return originalValue.bind(target);
        }
      }

      // For everything else, return the original value
      return originalValue;
    },
  });

  return proxy as PromisifiedConnection;
}
