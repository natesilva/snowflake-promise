### 2.0.0

2019-09-13

* **BREAKING CHANGE**: Minimum supported Node version is 6.9.5, the same as the underlying
  Snowflake SDK.
* Update to `snowflake-sdk` 1.3.0
* Update dev dependencies to latest versions
* Move the repository from Bitbucket to Github
* Support the new `ocspFailOpen` configuration option — thank you @thoean (Markus Thurner)
* Bugfix for `getStatementId` - thank you @jasonstitt (Jason Stitt)

The biggest change is to support the `ocspFailOpen` option in the underlying
Snowflake SDK driver.

This setting is enabled by default. if OCSP verification fails due to an invalid response
from the certificate authority, the connection will still be established. (If OCSP
verification shows that the certificate is revoked, the connection will be dropped.)

This prevents connection failures that previously happened when an OCSP provider had an
outage. The earlier workaround was to set the `insecureConnect` option. That is deprecated
and will be ignored. The new defaults accomplish the same thing in a more secure manner.

For more information, see: <https://www.snowflake.com/blog/changes-to-how-snowflake-handles-ocsp/>

### 1.11.0

2019-07-11

* Update to `snowflake-sdk` 1.1.15
* Update dev dependencies to latest versions
* Now using [`np`](https://github.com/sindresorhus/np) to build for release.

### 1.10.0

2018-12-31

* Update to `snowflake-sdk` 1.1.9

### 1.9.0

2018-11-15

* [DEPRECATED in 1.12.0] Workaround for OCSP errors when creating the client:

  ```
  const snowflake = new Snowflake({<connect options>}, {<logging options>}, true);
  ```

  Setting the third constructor argument to `true` will use `insecureConnect` mode which
  works around the problem.

  See https://github.com/snowflakedb/snowflake-connector-nodejs/issues/16 for further
  information.

### 1.8.0

2018-11-12

* Updated to `snowflake-sdk` 1.1.8

### 1.7.0

2018-10-15

* Updated to `snowflake-sdk` 1.1.7
