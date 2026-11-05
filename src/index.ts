// Our main entry point
/* v8 ignore next */

// Legacy entry points
/* v8 ignore next */
export * from "./legacy-compatibility/index.ts";
export { promisifyConnection } from "./lib/promisify-connection.ts";

// Types to export
export type { PromisifiedConnection } from "./types/promisified-connection.ts";
export type { PromisifiedRowStatement } from "./types/promisified-row-statement.ts";
