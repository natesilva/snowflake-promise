# snowflake-promise [![npm](https://img.shields.io/npm/v/snowflake-promise.svg)](https://www.npmjs.com/package/snowflake-promise) [![node](https://img.shields.io/node/v/snowflake-promise.svg)](https://www.npmjs.com/package/snowflake-promise)

A modern, Promise-based interface for the [Snowflake](https://www.snowflake.net/) Node.js SDK with full TypeScript support.

---

## Promise Support for the Snowflake SDK

With `snowflake-promise`, you can easily use the Snowflake Node.js SDK with Promises and async/await, instead of callbacks.

📚 [Full Documentation](https://natesilva.github.io/snowflake-promise/docs/)

📦 Install: `npm i snowflake-promise`

### Features

- Clean Promise-based API using `promisifyConnection`
- Full TypeScript support
- Backwards compatible with the previous `Snowflake` class API
- Compatible with the `snowflake-sdk` callback API
- Modern ESM/CJS dual package support
- 100% test coverage

---

## Basic Usage

`snowflake-promise` provides a lightweight wrapper around the Snowflake Node.js SDK. It augments the official SDK with a Promise-based interface, allowing you to work with Snowflake in a more modern way.

Here's a simple example of how to use `snowflake-promise` to connect to Snowflake, execute a query, and handle the results:

```typescript
import snowflakeSdk from "snowflake-sdk";
import { promisifyConnection } from "snowflake-promise";

async function main() {
  // Create a connection
  const connection = snowflakeSdk.createConnection({
    account: "<account name>",
    username: "<username>",
    password: "<password>",
    database: "SNOWFLAKE_SAMPLE_DATA",
    schema: "TPCH_SF1",
    warehouse: "DEMO_WH",
  });

  // ✨ Promisify the connection
  const promisifiedConnection = promisifyConnection(connection);

  // Connect (no callbacks -- you can use async/await)
  await promisifiedConnection.connect();

  // Execute a query
  const { resultsPromise } = promisifiedConnection.execute({
    sqlText: "SELECT COUNT(*) FROM CUSTOMER WHERE C_MKTSEGMENT=:1",
    binds: ["AUTOMOBILE"],
  });

  // Get the results (no callbacks -- you can use async/await)
  const rows = await resultsPromise;
  console.log(rows);
}

main();
```

See the [Full Documentation](https://natesilva.github.io/snowflake-promise/docs/) for more details on:

- [Authentication options (MFA, Key Pair, OAuth, etc.)](https://natesilva.github.io/snowflake-promise/docs/authentication-and-mfa/)
- [Executing queries and handling results](https://natesilva.github.io/snowflake-promise/docs/examples/executing-queries/query-example-1/)
- [Streaming rows](https://natesilva.github.io/snowflake-promise/docs/examples/executing-queries/query-example-2/)
- [Backward compatibility and migration from previous versions](https://natesilva.github.io/snowflake-promise/docs/migration-guide/)
