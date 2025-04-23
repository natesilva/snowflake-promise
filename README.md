# snowflake-promise [![npm](https://img.shields.io/npm/v/snowflake-promise.svg)](https://www.npmjs.com/package/snowflake-promise) [![node](https://img.shields.io/node/v/snowflake-promise.svg)](https://www.npmjs.com/package/snowflake-promise)

A modern, Promise-based interface for the [Snowflake](https://www.snowflake.net/) Node.js SDK with full TypeScript support.

---

## Version 5

Version 5 is a complete rewrite with improved TypeScript support while maintaining full backwards compatibility with previous versions of `snowflake-promise` and the underlying `snowflake-sdk`'s callback API.

📚 [Full Documentation](https://natesilva.github.io/snowflake-promise/docs/)

📦 Install: `npm i snowflake-promise` (or `npm i snowflake-promise@beta` for pre-releases)

### Features

- Clean Promise-based API using `promisifyConnection`
- Full TypeScript support
- Backwards compatible with the previous `Snowflake` class API
- Compatibility layer for the legacy `snowflake-sdk` callback API
- Modern ESM/CJS dual package support
- 100% test coverage

---

## Installation

- `npm i snowflake-promise`
- Ensure you have `snowflake-sdk` installed as well (`npm i snowflake-sdk`)

## Basic Usage (`promisifyConnection` API - Recommended)

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

See the [Full Documentation](https://natesilva.github.io/snowflake-promise/docs/) for more details on:

- Authentication options (MFA, Key Pair, OAuth, etc.)
- Executing queries and handling results
- Streaming rows
- Using the legacy `Snowflake` class API
- Using the `snowflake-sdk` callback compatibility layer
- Migration from previous versions

## Documentation Website

For comprehensive documentation, including API references, examples, and guides, please visit the documentation website:

[https://natesilva.github.io/snowflake-promise/docs/](https://natesilva.github.io/snowflake-promise/docs/)
