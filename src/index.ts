// Our main entry point
/* v8 ignore next */
export { promisifyConnection } from "./lib/promisify-connection.js";

// Legacy entry points
/* v8 ignore next */
export * from "./legacy-compatibility/index.js";

// Types to export
export type { PromisifiedConnection } from "./types/promisified-connection.ts";
export type { PromisifiedRowStatement } from "./types/promisified-row-statement.ts";
