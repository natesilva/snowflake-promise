import * as SDK from 'snowflake-sdk';

import { ConnectionOptions } from './types/ConnectionOptions';
import { ExecuteOptions } from './types/ExecuteOptions';
import { Statement } from './Statement';

export class Snowflake {
  private readonly sdk_connection;

  /* Creates a new Snowflake instance. */
  constructor(private readonly connectionOptions: ConnectionOptions) {
    this.sdk_connection = SDK.createConnection(connectionOptions);
  }

  /** the connection id */
  get id(): string { return this.sdk_connection.getId(); }

  /** Establishes a connection if we aren't in a fatal state. */
  connect() {
    return new Promise<void>((resolve, reject) => {
      this.sdk_connection.connect(err => {
        if (err) { reject(err); }
        else { resolve(); }
      })
    });
  }

  /**
   * Immediately terminates the connection without waiting for currently
   * executing statements to complete.
   */
  destroy() {
    return new Promise<void>((resolve, reject) => {
      this.sdk_connection.destroy(err => {
        if (err) { reject(err); }
        else { resolve(); }
      });
    });
  }

  /** Create a Statement. */
  createStatement(options: ExecuteOptions) {
    return new Statement(this.sdk_connection, options);
  }

  /** A convenience function to execute a SQL statement and return the resulting rows. */
  execute(sqlText: string, binds?: any[]) {
    const stmt = this.createStatement({sqlText, binds});
    stmt.execute();
    return stmt.getRows();
  }
}
