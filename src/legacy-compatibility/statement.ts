import { strict as assert } from "node:assert";
import type { Readable } from "node:stream";
import type { Connection, RowStatement } from "snowflake-sdk";
import { promisifyConnection } from "../lib/promisify-connection.ts";
import type { PromisifiedConnection } from "../types/promisified-connection.ts";
import { StatementAlreadyExecutedError } from "./index.ts";
import type { ExecuteOptions } from "./types/ExecuteOptions.ts";
import { StatementNotExecutedError } from "./types/StatementNotExecutedError.ts";
import type { StreamRowsOptions } from "./types/StreamRowsOptions.ts";

/**
 * @deprecated Use the standard Snowflake SDK. First get a connection and then call
 * promisifyConnection() to augment the connection with Promise-based methods. If you
 * have a Statement instance, you can call promisifyStatement() to augment it with
 * Promise-based methods.
 */
export class Statement {
  private readonly connection: PromisifiedConnection;
  private executePromise?: Promise<void>;
  private stmt?: RowStatement;
  private rows?: unknown[];
  private readonly executeOptions: ExecuteOptions;
  private readonly logSql: ((sqlText: string) => void) | undefined;

  constructor(
    connection: Connection,
    executeOptions: ExecuteOptions,
    logSql?: (sqlText: string) => void,
  ) {
    this.connection = promisifyConnection(connection);
    this.executeOptions = executeOptions;
    this.logSql = logSql;
  }

  execute() {
    if (this.executePromise) {
      throw new StatementAlreadyExecutedError();
    }

    const startTime = Date.now();

    const { statement, resultsPromise } = this.connection.execute(this.executeOptions);

    this.stmt = statement;

    this.executePromise = resultsPromise.then((rows) => {
      if (this.logSql) {
        const elapsed = Date.now() - startTime;
        this.log(elapsed);
      }
      this.rows = rows;
    });

    return this.executePromise;
  }

  async cancel() {
    await this.stmt?.cancel();
  }

  getRows() {
    if (!this.executePromise) {
      throw new StatementNotExecutedError();
    }
    return this.executePromise.then(() => this.rows);
  }

  streamRows(options: StreamRowsOptions = {}): Readable {
    if (!this.executePromise) {
      throw new StatementNotExecutedError();
    }
    assert(this.stmt, "Statement must be executed before streaming rows");
    return this.stmt.streamRows(options);
  }

  getSqlText(): string {
    if (!this.executePromise) {
      throw new StatementNotExecutedError();
    }
    assert(this.stmt, "Statement must be executed before getting SQL text");
    return this.stmt.getSqlText();
  }

  getStatus(): string {
    if (!this.executePromise) {
      throw new StatementNotExecutedError();
    }
    assert(this.stmt, "Statement must be executed before getting status");
    return this.stmt.getStatus();
  }

  getColumns(): object[] {
    if (!this.executePromise) {
      throw new StatementNotExecutedError();
    }
    assert(this.stmt, "Statement must be executed before getting columns");
    return this.stmt.getColumns();
  }

  getColumn(columnIdentifier: string | number) {
    if (!this.executePromise) {
      throw new StatementNotExecutedError();
    }
    assert(this.stmt, "Statement must be executed before getting column");
    return this.stmt.getColumn(columnIdentifier);
  }

  getNumRows() {
    if (!this.executePromise) {
      throw new StatementNotExecutedError();
    }
    assert(this.stmt, "Statement must be executed before getting number of rows");
    return this.stmt.getNumRows();
  }

  getNumUpdatedRows() {
    if (!this.executePromise) {
      throw new StatementNotExecutedError();
    }
    assert(this.stmt, "Statement must be executed before getting number of updated rows");
    return this.stmt.getNumUpdatedRows();
  }

  getSessionState() {
    if (!this.executePromise) {
      throw new StatementNotExecutedError();
    }
    assert(this.stmt, "Statement must be executed before getting session state");
    return this.stmt.getSessionState();
  }

  getRequestId() {
    if (!this.executePromise) {
      throw new StatementNotExecutedError();
    }
    assert(this.stmt, "Statement must be executed before getting request ID");
    return this.stmt.getRequestId();
  }

  getStatementId() {
    if (!this.executePromise) {
      throw new StatementNotExecutedError();
    }
    assert(this.stmt, "Statement must be executed before getting statement ID");
    // Note: getStatementId() was deprecated by Snowflake in favor of getQueryId().
    // They return the same value, but we should use the newer method.
    return this.stmt.getQueryId();
  }

  private log(elapsedTime: number) {
    let logMessage = "Executed";

    const state = this.getSessionState();
    if (state) {
      // @ts-expect-error: state.getCurrentDatabase and getCurrentSchema do exist
      logMessage += ` (${state.getCurrentDatabase()}.${state.getCurrentSchema()})`;
    }

    logMessage += `: ${this.getSqlText()}`;
    if (logMessage[logMessage.length - 1] !== ";") {
      logMessage += ";";
    }

    if (this.executeOptions.binds) {
      logMessage += `  with binds: ${JSON.stringify(this.executeOptions.binds)};`;
    }

    logMessage += `  Elapsed time: ${elapsedTime}ms`;

    this.logSql?.(logMessage);
  }
}
