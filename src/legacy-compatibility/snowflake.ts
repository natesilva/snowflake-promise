import SDK from "snowflake-sdk";
import { promisifyConnection } from "../lib/promisify-connection.ts";
import type { PromisifiedConnection } from "../types/promisified-connection.ts";
import { Statement } from "./statement.ts";
import type { ConfigureOptions } from "./types/ConfigureOptions.ts";
import type { ConnectionOptions } from "./types/ConnectionOptions.ts";
import type { ExecuteOptions } from "./types/ExecuteOptions.ts";
import { toSdkLogLevel, type LoggingOptions } from "./types/LoggingOptions.ts";

/**
 * @deprecated Use the standard Snowflake SDK. First get a connection and then call
 * promisifyConnection() to augment the connection with Promise-based methods.
 */
export class Snowflake {
  private readonly logSql?: (sqlText: string) => void;
  private readonly connection: PromisifiedConnection;

  constructor(
    connectionOptions: ConnectionOptions,
    loggingOptions: LoggingOptions = {},
    configureOptions?: ConfigureOptions | boolean,
  ) {
    if (loggingOptions && loggingOptions.logLevel) {
      SDK.configure({ logLevel: toSdkLogLevel(loggingOptions.logLevel) });
    }
    this.logSql = (loggingOptions && loggingOptions.logSql) ?? undefined;
    // For backward compatibility, configureOptions is allowed to be a boolean, but
    // it’s ignored. The new default settings accomplish the same thing as the old
    // `insecureConnect` boolean.
    if (typeof configureOptions === "boolean") {
      console.warn(
        "[snowflake-promise] the insecureConnect boolean argument is deprecated; " +
          "please remove it or use the ocspFailOpen configure option",
      );
    } else if (typeof configureOptions === "object") {
      SDK.configure(configureOptions);
    }
    this.connection = promisifyConnection(SDK.createConnection(connectionOptions));
  }

  get id(): string {
    return this.connection.getId();
  }

  async connect() {
    await this.connection.connect();
  }

  async connectAsync() {
    await this.connection.connectAsync();
  }

  async destroy() {
    await this.connection.destroy();
  }

  createStatement(options: ExecuteOptions) {
    return new Statement(this.connection, options, this.logSql);
  }

  /** A convenience function to execute a SQL statement and return the resulting rows. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async execute(sqlText: string, binds?: any[]) {
    const { resultsPromise } = this.connection.execute({ sqlText, binds });
    const rows = await resultsPromise;
    return rows;
  }
}
