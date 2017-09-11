//
// Use this when processing large datasets (or when retrieving only a few rows
// from a large result set). This is common when doing batch processing.
//
// This avoids loading the entire result set into memory, and lets you work on
// one row at a time.
//

const Snowflake = require('snowflake-promise').Snowflake;

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

  // this query returns tens of thousands of rows
  const statement = snowflake.createStatement({
    sqlText: 'SELECT * FROM CUSTOMER WHERE C_MKTSEGMENT=:1',
    binds: ['AUTOMOBILE'],
    // This tells Snowflake not to bother building an array of all the result
    // rows. That’s a good thing when streaming a huge result set:
    streamResult: true
  });

  // You don’t have to await this, you can begin streaming immediately.
  await statement.execute();

  // How many rows in the result set?  This only works if you await-ed
  // execute(), above. Otherwise, the number of rows is not known yet.
  console.log(`the query result set has ${statement.getNumRows()} rows`);

  // Let’s process rows 250-275, one by one. (If you omit the argument for
  // streamRows(), all rows will be processed.)
  statement.streamRows({ start: 250, end: 275 })
    .on('error', console.error)
    .on('data', row => console.log(`customer name is: ${row['C_NAME']}`))
    .on('end', () => console.log('done processing'))
  ;
}

main();
