//
// Two types of logging are available.
//
// * SDK logging messages are emitted by the Snowflake SDK. These can be turned on by
//   setting logLevel to the desired level (such as 'trace').
//
// * You can log SQL queries. This is enabled by passing a _function_ that will receive
//   a string to be logged. The string includes the database and schema name, the sqlText,
//   and the (local) elapsed time.
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
  }, {
    logLevel: 'trace',          // maximum SDK logLevel
    logSql: console.log         // SQL statements will be logged to the console
  });

  await snowflake.connect();

  const rows = await snowflake.execute(
    'SELECT COUNT(*) FROM CUSTOMER WHERE C_MKTSEGMENT=:1',
    ['AUTOMOBILE']
  );

  console.log(rows);
}

main();
