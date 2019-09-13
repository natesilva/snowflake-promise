⚠️ Release notes are now found on GitHub:

<https://github.com/natesilva/snowflake-promise/releases>

Older release notes follow:

---

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
