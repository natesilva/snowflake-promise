# snowflake-promise

A Promise-based interface to your [Snowflake](https://www.snowflake.net/) data warehouse.

This is a wrapper for the [Snowflake SDK](https://www.npmjs.com/package/snowflake-sdk) for Node.js. It provides a Promise-based API instead of the core callback-based API.

## Installation

`npm i snowflake-promise`

## Basic usage

```typescript
const Snowflake = require('snowflake-promise').Snowflake;
// or, for TypeScript:
import { Snowflake } from 'snowflake-promise';

async function main() {
  const snowflake = new Snowflake({
    account: '<account name>',
    username: '<username>',
    password: '<password>',
    database: 'SNOWFLAKE_SAMPLE_DATA',
    schema: 'TPCH_SF1',
    warehouse: 'DEMO_WH'
  });

  await snowflake.connect();

  const rows = await snowflake.execute(
    'SELECT COUNT(*) FROM CUSTOMER WHERE C_MKTSEGMENT=:1',
    ['AUTOMOBILE']
  );

  console.log(rows);
}

main();
```

## More examples

* [Streaming result rows](src/examples/streaming.js)
* [Using traditional Promise `then` syntax (and older versions of Node.js)](src/examples/oldSchool.js)
    * Node 4.0.0 is the oldest supported version
