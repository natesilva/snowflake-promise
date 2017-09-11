//
// This example shows how to use the library in traditional Promise style. You
// might do this if you are using an older version of Node that doesn’t support
// async/await, or simply if you prefer the Promise/then syntax.
//
// (You could also transpile async/await code using TypeScript or Babel, which
// allows it to run on older versions of Node.)
//
// This library supports Node 4.0.0 and higher.
//

var Snowflake = require('snowflake-promise').Snowflake;

function main() {
  var snowflake = new Snowflake({
    account: '<account name>',
    username: '<username>',
    password: '<password>',
    database: 'SNOWFLAKE_SAMPLE_DATA',
    schema: 'TPCH_SF1',
    warehouse: 'DEMO_WH'
  });

  snowflake.connect()
    .then(function() {
      return snowflake.execute(
        'SELECT COUNT(*) FROM CUSTOMER WHERE C_MKTSEGMENT=:1',
        ['AUTOMOBILE']
      );
    })
    .then(function(rows) {
      console.log(rows);
    })
    .catch(function(err) {
      console.error(err);
    })
  ;
}

main();
