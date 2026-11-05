import assert from "node:assert/strict";
import { beforeEach, describe, it, mock } from "node:test";
import type { Connection } from "snowflake-sdk";
import {
  mockConnection,
  mockSdk,
  mockStatement,
  resetMocks,
} from "./mocks/snowflake-sdk.mock.ts";

const warnLegacyInterface = mock.fn();
mock.module("../warn-legacy-interface.ts", { namedExports: { warnLegacyInterface } });
mock.module("snowflake-sdk", { namedExports: { ...mockSdk }, defaultExport: mockSdk });

const {
  Statement,
  StatementAlreadyExecutedError,
  StatementNotCompleteError,
  StatementNotExecutedError,
} = await import("../index.ts");
type Statement = InstanceType<typeof Statement>;

describe("Statement", () => {
  const executeOptions = { sqlText: "SELECT * FROM test" };
  let statement: Statement;

  beforeEach(() => {
    resetMocks();
    warnLegacyInterface.mock.resetCalls();
    statement = new Statement(mockConnection as unknown as Connection, executeOptions);
  });

  describe("constructor", () => {
    it("should warn that the legacy interface is deprecated", () => {
      const statement_ = new Statement(
        mockConnection as unknown as Connection,
        executeOptions,
      );
      assert.ok(statement_ instanceof Statement);
      assert.ok(warnLegacyInterface.mock.callCount() > 0);
    });
  });

  describe("execute", () => {
    it("should execute a statement", async () => {
      await statement.execute();
      assert.equal(
        mockConnection.execute.mock.calls[0]?.arguments[0]?.sqlText,
        executeOptions.sqlText,
      );
    });

    it("should throw StatementAlreadyExecutedError if executed twice", async () => {
      await statement.execute();
      assert.throws(() => statement.execute(), StatementAlreadyExecutedError);
    });

    it("should reject if execution fails", async () => {
      // Mock execution failure
      mockConnection.execute.mock.mockImplementationOnce((options) => {
        process.nextTick(() => options.complete(new Error("Execution failed")));
        return mockStatement;
      });

      await assert.rejects(async () => await statement.execute(), {
        message: "Execution failed",
      });
    });

    it("should log SQL if logSql is provided", async () => {
      const logSql = mock.fn();
      const statementWithLogging = new Statement(
        mockConnection as unknown as Connection,
        executeOptions,
        logSql,
      );

      await statementWithLogging.execute();

      assert.ok(logSql.mock.callCount() > 0);
    });

    it("should include binds in log message when binds are provided", async () => {
      const logSql = mock.fn();
      const optionsWithBinds = {
        sqlText: "SELECT * FROM test WHERE id = ?",
        binds: [123],
      };

      const statementWithBinds = new Statement(
        mockConnection as unknown as Connection,
        optionsWithBinds,
        logSql,
      );

      await statementWithBinds.execute();

      assert.ok(
        String(logSql.mock.calls[0]?.arguments[0]).includes(
          `with binds: ${JSON.stringify(optionsWithBinds.binds)}`,
        ),
      );
    });
  });

  describe("cancel", () => {
    it("should cancel a statement", async () => {
      await statement.execute();
      await statement.cancel();

      assert.ok(mockStatement.cancel.mock.callCount() > 0);
    });

    it("should reject if cancel fails", async () => {
      // Mock cancel failure
      mockStatement.cancel.mock.mockImplementationOnce((callback) =>
        callback(new Error("Cancel failed")),
      );

      await statement.execute();
      await assert.rejects(async () => await statement.cancel(), {
        message: "Cancel failed",
      });
    });
  });

  describe("getRows", () => {
    it("should return rows after execution", async () => {
      await statement.execute();
      const rows = await statement.getRows();

      assert.deepEqual(rows, [{ COLUMN1: "mock-data" }]);
    });

    it("should throw StatementNotExecutedError if not executed", () => {
      assert.throws(() => statement.getRows(), StatementNotExecutedError);
    });
  });

  describe("streamRows", () => {
    it("should stream rows after execution", async () => {
      await statement.execute();

      const stream = statement.streamRows();
      assert.ok(mockStatement.streamRows.mock.callCount() > 0);

      // Test stream functionality
      const dataHandler = mock.fn();
      const endHandler = mock.fn();

      stream.on("data", dataHandler);
      stream.on("end", endHandler);

      // Wait for stream events to be processed
      await new Promise((resolve) => setTimeout(resolve, 10));

      assert.equal(dataHandler.mock.callCount(), 5);
      assert.ok(endHandler.mock.callCount() > 0);
    });

    it("should accept streaming options", async () => {
      await statement.execute();

      const options = { start: 5, end: 10 };
      statement.streamRows(options);

      assert.deepEqual(mockStatement.streamRows.mock.calls[0]?.arguments, [options]);
    });

    it("should throw StatementNotExecutedError if not executed", () => {
      assert.throws(() => statement.streamRows(), StatementNotExecutedError);
    });
  });

  describe("getter methods", () => {
    beforeEach(async () => {
      await statement.execute();
    });

    it("getSqlText should return SQL text", () => {
      assert.equal(statement.getSqlText(), "mock-sql-text");
      assert.ok(mockStatement.getSqlText.mock.callCount() > 0);
    });

    it("getStatus should return status", () => {
      assert.equal(statement.getStatus(), "SUCCEEDED");
      assert.ok(mockStatement.getStatus.mock.callCount() > 0);
    });

    it("getColumns should return columns", () => {
      assert.deepEqual(statement.getColumns(), [{ name: "COLUMN1", type: "TEXT" }]);
      assert.ok(mockStatement.getColumns.mock.callCount() > 0);
    });

    it("getColumns should throw StatementNotCompleteError if the SDK has no columns yet", () => {
      mockStatement.getColumns.mock.mockImplementationOnce(
        () => undefined as unknown as never,
      );
      assert.throws(() => statement.getColumns(), StatementNotCompleteError);
    });

    it("getColumn should return a specific column", () => {
      assert.deepEqual(statement.getColumn("COLUMN1"), {
        name: "COLUMN1",
        type: "TEXT",
      });
      assert.deepEqual(mockStatement.getColumn.mock.calls[0]?.arguments, ["COLUMN1"]);
    });

    it("getNumRows should return number of rows", () => {
      assert.equal(statement.getNumRows(), 10);
      assert.ok(mockStatement.getNumRows.mock.callCount() > 0);
    });

    it("getNumUpdatedRows should return number of updated rows", () => {
      assert.equal(statement.getNumUpdatedRows(), 5);
      assert.ok(mockStatement.getNumUpdatedRows.mock.callCount() > 0);
    });

    it("getSessionState should return session state", () => {
      const state = statement.getSessionState();
      // @ts-expect-error Property 'getCurrentDatabase' does not exist on type 'object'
      assert.equal(state.getCurrentDatabase(), "MOCK_DB");
      // @ts-expect-error Property 'getCurrentSchema' does not exist on type 'object'
      assert.equal(state.getCurrentSchema(), "MOCK_SCHEMA");
      assert.ok(mockStatement.getSessionState.mock.callCount() > 0);
    });

    it("getRequestId should return request ID", () => {
      assert.equal(statement.getRequestId(), "mock-request-id");
      assert.ok(mockStatement.getRequestId.mock.callCount() > 0);
    });

    it("getStatementId should return statement ID", () => {
      assert.equal(statement.getStatementId(), "mock-statement-id");
      // assert.ok(mockStatement.getStatementId.mock.callCount() > 0);
    });
  });

  describe("error handling for getter methods", () => {
    it("should throw StatementNotExecutedError if methods called before execution", () => {
      const methods = [
        "getSqlText",
        "getStatus",
        "getColumns",
        "getColumn",
        "getNumRows",
        "getNumUpdatedRows",
        "getSessionState",
        "getRequestId",
        "getStatementId",
      ];

      methods.forEach((method) => {
        assert.throws(() => {
          if (method === "getColumn") {
            (statement as any)[method]("COLUMN1");
          } else {
            (statement as any)[method]();
          }
        }, StatementNotExecutedError);
      });
    });
  });
});
