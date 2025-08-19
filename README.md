# snowflake-promise [![npm](https://img.shields.io/npm/v/snowflake-promise.svg)](https://www.npmjs.com/package/snowflake-promise) [![node](https://img.shields.io/node/v/snowflake-promise.svg)](https://www.npmjs.com/package/snowflake-promise)

A modern, Promise-based interface for the [Snowflake](https://www.snowflake.net/) Node.js SDK with full TypeScript support.

---

## Promise Support for the Snowflake SDK

### Quick Start

- 📦 Install: `npm i snowflake-promise`
- 📚 [Full Documentation](https://natesilva.github.io/snowflake-promise/docs/)

### Why use it?

The [official Snowflake SDK](https://docs.snowflake.com/en/developer-guide/node-js/nodejs-driver) uses a callback-based API, which can be difficult to manage in modern JavaScript applications. It leads to code that’s hard to understand and hard to maintain.

Promises and `async`/`await` are the modern replacement for callbacks. `snowflake-promise` provides a lightweight adapter that adds Promise support to the SDK's callback-based methods, making it easy to work with Snowflake in Node.js.

### Features

- Works with the official Snowflake Node.js SDK
- Adds Promise support to callback-based methods
- Allows you to use async/await for cleaner, more readable code
- Fully backward compatible with existing (callback-based) code that uses the Snowflake SDK
- Supports all authentication methods: username/password, MFA, key pair, OAuth
- Supports all Snowflake SDK features, including streaming large result sets
- Modern ESM/CJS dual package support
- Built with 100% test coverage

## Basic Usage

`snowflake-promise` provides a lightweight adapter for the Snowflake Node.js SDK. Pass a Snowflake SDK `Connection` object to the `promisifyConnection` function, and it will be enhanced with full Promise support.

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

  // Execute a query (no callbacks)
  const { resultsPromise } = promisifiedConnection.execute({
    sqlText: "SELECT COUNT(*) FROM CUSTOMER WHERE C_MKTSEGMENT=:1",
    binds: ["AUTOMOBILE"],
  });

  // Get the results (no callbacks)
  const rows = await resultsPromise;
  console.log(rows);
}

main();
```

See the [Full Documentation](https://natesilva.github.io/snowflake-promise/docs/) for details on:

- [Authentication options (MFA, Key Pair, OAuth, etc.)](https://natesilva.github.io/snowflake-promise/docs/authentication-and-mfa/)
- [Executing queries and handling results](https://natesilva.github.io/snowflake-promise/docs/examples/executing-queries/query-example-1/)
- [Streaming results](https://natesilva.github.io/snowflake-promise/docs/examples/executing-queries/query-example-2/)
- [Backward compatibility and migration from previous versions](https://natesilva.github.io/snowflake-promise/docs/migration-guide/)
