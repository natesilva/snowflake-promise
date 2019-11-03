export interface ConnectionOptions {
  /**
   * Name of your Snowflake account as it appears in the URL for accessing the
   * web interface. For example, in https://abc123.snowflakecomputing.com,
   * abc123 is the account name.
   */
  account: string;
  /** Snowflake user login name to connect with. */
  username: string;
  /** Password for the user. */
  password: string;
  /**
   * Region for the user. Currently, only required for users connecting to the
   * following regions:
   *   US East: us-east-1
   *   EU (Frankfurt): eu-central-1
   */
  region?: string;
  /** The default database to use for the session after connecting. */
  database?: string;
  /** The default schema to use for the session after connecting. */
  schema?: string;
  /**
   * The default virtual warehouse to use for the session after connecting. Used
   * for performing queries, loading data, etc.
   */
  warehouse?: string;
  /** The default security role to use for the session after connecting. */
  role?: string;
  /** By default, client connections typically time out approximately 3-4 hours
   * after the most recent query was executed. If the parameter clientSessionKeepAlive is set to true,
   * the client’s connection to the server will be kept alive indefinitely, even if no queries are executed.
   * The default setting of this parameter is false. If you set this parameter to true, make sure that your
   * program explicitly disconnects from the server when your program has finished.
   * Do not exit without disconnecting.
   */
  clientSessionKeepAlive?: boolean;
}
