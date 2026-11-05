import { deprecate } from "node:util";

export const warnLegacyInterface = deprecate(
  () => {},
  "[snowflake-promise] The legacy compatibility interface (Snowflake and Statement " +
    "classes) is deprecated and will be removed in the next major version. Use the " +
    "standard Snowflake SDK with promisifyConnection() instead.",
  "SNOWFLAKE_PROMISE_LEGACY",
);
