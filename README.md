# snowflake-promise [![npm](https://img.shields.io/npm/v/snowflake-promise.svg)](https://www.npmjs.com/package/snowflake-promise) [![node](https://img.shields.io/node/v/snowflake-promise.svg)](https://www.npmjs.com/package/snowflake-promise)

A modern, Promise-based interface for the [Snowflake](https://www.snowflake.net/) Node.js SDK with full TypeScript support.

---

## v5 Beta Now Available!

Version 5 is a complete rewrite with improved TypeScript support while maintaining full backwards compatibility.

📚 [Full Documentation](https://natesilva.github.io/snowflake-promise/docs/)
📦 `npm i snowflake-promise@beta`

### v5 Features

- Clean Promise-based API
- Full TypeScript support
- Backwards compatible with the previous version of this library
- Legacy callback API compatibility
- Modern ESM/CJS dual package support
- 100% test coverage

---

The documentation below covers version 4, the current stable version of the library.

## Installation

- `npm i snowflake-promise`

## Basic usage

```typescript
import snowflakeSdk from "snowflake-sdk";
import { promisifyConnection } from "snowflake-promise";

async function main() {
  // Create the connection
  const connection = snowflakeSdk.createConnection({
    account: "<account name>",
    username: "<username>",
    password: "<password>",
    database: "SNOWFLAKE_SAMPLE_DATA",
    schema: "TPCH_SF1",
    warehouse: "DEMO_WH",
  });

  // Promisify the connection
  const promisifiedConnection = promisifyConnection(connection);

  // Connect
  await promisifiedConnection.connect();

  // Execute a query
  const { resultsPromise } = await promisifiedConnection.execute({
    sqlText: "SELECT COUNT(*) FROM CUSTOMER WHERE C_MKTSEGMENT=:1",
    binds: ["AUTOMOBILE"],
  });

  // Get the results
  const rows = await resultsPromise;

  console.log(rows);
}

main();
```

## Connecting

The constructor takes up to three arguments:

`new Snowflake(connectionOptions, [ loggingOptions, [ configureOptions ] ])`

- `connectionOptions`
  - Supported options are here: <https://docs.snowflake.net/manuals/user-guide/nodejs-driver-use.html#required-connection-options>
- `loggingOptions`
  - `logSql` (optional, function): If provided, this function will be called to log SQL
    statements. For example, set `logSql` to `console.log` to log all issued SQL
    statements to the console.
  - `logLevel` (optional: `'error' | 'warn' | 'debug' | 'info' | 'trace'`): Turns on
    SDK-level logging.
- `configureOptions`
  - `ocspFailOpen` (optional, boolean) (default: `true`): Enables OCSP fail-open
    functionality. See <https://www.snowflake.com/blog/latest-changes-to-how-snowflake-handles-ocsp/> for more information.

## More examples

- [Using promisifyConnection API (Recommended)](examples/promisifyConnection.ts)
- [Streaming result rows](examples/streaming.js)
- [Using traditional Promise `then` syntax (and older versions of Node.js)](examples/oldSchool.js)
  - Node v6.9.5 is the oldest supported version
- [Turn on logging](examples/logging.js)

## Documentation

- [Migration Guide](docs/migration-guide.md) - How to migrate from the legacy API to the newer `promisifyConnection` API
