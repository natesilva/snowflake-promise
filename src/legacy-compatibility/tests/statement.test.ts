/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Connection } from "snowflake-sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  Statement,
  StatementAlreadyExecutedError,
  StatementNotExecutedError,
} from "../index.js";
import { mockConnection, mockStatement, resetMocks } from "./mocks/snowflake-sdk.mock.js";

// Mock the snowflake-sdk module
vi.mock("snowflake-sdk", async () => {
  const actual = await vi.importActual<typeof import("./mocks/snowflake-sdk.mock.js")>(
    "./mocks/snowflake-sdk.mock.js",
  );

  // Return the mock SDK as both named exports and as default export
  return {
    ...actual.mockSdk,
    default: actual.mockSdk,
  };
});

describe("Statement", () => {
  const executeOptions = { sqlText: "SELECT * FROM test" };
  let statement: Statement;

  beforeEach(() => {
    resetMocks();
    statement = new Statement(mockConnection as unknown as Connection, executeOptions);
  });

  describe("execute", () => {
    it("should execute a statement", async () => {
      await statement.execute();
      expect(mockConnection.execute).toHaveBeenCalledWith(
        expect.objectContaining({ sqlText: executeOptions.sqlText }),
      );
    });

    it("should throw StatementAlreadyExecutedError if executed twice", async () => {
      await statement.execute();
      expect(() => statement.execute()).toThrow(StatementAlreadyExecutedError);
    });

    it("should reject if execution fails", async () => {
      // Mock execution failure
      mockConnection.execute.mockImplementationOnce((options) => {
        process.nextTick(() => options.complete(new Error("Execution failed")));
        return mockStatement;
      });

      await expect(statement.execute()).rejects.toThrow("Execution failed");
    });

    it("should log SQL if logSql is provided", async () => {
      const logSql = vi.fn();
      const statementWithLogging = new Statement(
        mockConnection as unknown as Connection,
        executeOptions,
        logSql,
      );

      await statementWithLogging.execute();

      expect(logSql).toHaveBeenCalled();
    });

    it("should include binds in log message when binds are provided", async () => {
      const logSql = vi.fn();
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

      expect(logSql).toHaveBeenCalledWith(
        expect.stringContaining(`with binds: ${JSON.stringify(optionsWithBinds.binds)}`),
      );
    });
  });

  describe("cancel", () => {
    it("should cancel a statement", async () => {
      await statement.execute();
      await statement.cancel();

      expect(mockStatement.cancel).toHaveBeenCalled();
    });

    it("should reject if cancel fails", async () => {
      // Mock cancel failure
      mockStatement.cancel.mockImplementationOnce((callback) =>
        callback(new Error("Cancel failed")),
      );

      await statement.execute();
      await expect(statement.cancel()).rejects.toThrow("Cancel failed");
    });
  });

  describe("getRows", () => {
    it("should return rows after execution", async () => {
      await statement.execute();
      const rows = await statement.getRows();

      expect(rows).toEqual([{ COLUMN1: "mock-data" }]);
    });

    it("should throw StatementNotExecutedError if not executed", () => {
      expect(() => statement.getRows()).toThrow(StatementNotExecutedError);
    });
  });

  describe("streamRows", () => {
    it("should stream rows after execution", async () => {
      await statement.execute();

      const stream = statement.streamRows();
      expect(mockStatement.streamRows).toHaveBeenCalled();

      // Test stream functionality
      const dataHandler = vi.fn();
      const endHandler = vi.fn();

      stream.on("data", dataHandler);
      stream.on("end", endHandler);

      // Wait for stream events to be processed
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(dataHandler).toHaveBeenCalledTimes(5);
      expect(endHandler).toHaveBeenCalled();
    });

    it("should accept streaming options", async () => {
      await statement.execute();

      const options = { start: 5, end: 10 };
      statement.streamRows(options);

      expect(mockStatement.streamRows).toHaveBeenCalledWith(options);
    });

    it("should throw StatementNotExecutedError if not executed", () => {
      expect(() => statement.streamRows()).toThrow(StatementNotExecutedError);
    });
  });

  describe("getter methods", () => {
    beforeEach(async () => {
      await statement.execute();
    });

    it("getSqlText should return SQL text", () => {
      expect(statement.getSqlText()).toBe("mock-sql-text");
      expect(mockStatement.getSqlText).toHaveBeenCalled();
    });

    it("getStatus should return status", () => {
      expect(statement.getStatus()).toBe("SUCCEEDED");
      expect(mockStatement.getStatus).toHaveBeenCalled();
    });

    it("getColumns should return columns", () => {
      expect(statement.getColumns()).toEqual([{ name: "COLUMN1", type: "TEXT" }]);
      expect(mockStatement.getColumns).toHaveBeenCalled();
    });

    it("getColumn should return a specific column", () => {
      expect(statement.getColumn("COLUMN1")).toEqual({
        name: "COLUMN1",
        type: "TEXT",
      });
      expect(mockStatement.getColumn).toHaveBeenCalledWith("COLUMN1");
    });

    it("getNumRows should return number of rows", () => {
      expect(statement.getNumRows()).toBe(10);
      expect(mockStatement.getNumRows).toHaveBeenCalled();
    });

    it("getNumUpdatedRows should return number of updated rows", () => {
      expect(statement.getNumUpdatedRows()).toBe(5);
      expect(mockStatement.getNumUpdatedRows).toHaveBeenCalled();
    });

    it("getSessionState should return session state", () => {
      const state = statement.getSessionState();
      // @ts-expect-error Property 'getCurrentDatabase' does not exist on type 'object'
      expect(state.getCurrentDatabase()).toBe("MOCK_DB");
      // @ts-expect-error Property 'getCurrentSchema' does not exist on type 'object'
      expect(state.getCurrentSchema()).toBe("MOCK_SCHEMA");
      expect(mockStatement.getSessionState).toHaveBeenCalled();
    });

    it("getRequestId should return request ID", () => {
      expect(statement.getRequestId()).toBe("mock-request-id");
      expect(mockStatement.getRequestId).toHaveBeenCalled();
    });

    it("getStatementId should return statement ID", () => {
      expect(statement.getStatementId()).toBe("mock-statement-id");
      // expect(mockStatement.getStatementId).toHaveBeenCalled();
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
        expect(() => {
          if (method === "getColumn") {
            (statement as any)[method]("COLUMN1");
          } else {
            (statement as any)[method]();
          }
        }).toThrow(StatementNotExecutedError);
      });
    });
  });
});
