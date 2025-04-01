/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { promisifyOptionsCallbackFunction } from "./promisify-options-callback-function.js";
import type { Connection } from "snowflake-sdk";

describe("promisifyOptionsCallbackFunction", () => {
  // Mock types to match Snowflake SDK
  type MockRowType = { id: number; name: string };

  // Create a mock statement with the necessary properties
  interface MockStatement {
    cancel: () => void;
    getSqlText: () => string;
    getStatus: () => string;
    getColumns: () => any[];
    getColumn: (index: number) => any;
    getNumRows: () => number;
    getNumUpdatedRows: () => number;
    streamRows: () => any;
    fetchRows: () => any;
    getQueryId: () => string;
    getRequestId: () => string;
    getSessionState: () => any;
    getStatementId: () => string;
  }

  // Mock Snowflake connection
  const mockConnection = {} as Connection;

  // Create a helper function to create a mock statement
  function createMockStatement(): MockStatement {
    return {
      cancel: vi.fn(),
      getSqlText: vi.fn().mockReturnValue("SELECT * FROM test"),
      getStatus: vi.fn().mockReturnValue("SUCCEEDED"),
      getColumns: vi.fn().mockReturnValue([]),
      getColumn: vi.fn().mockReturnValue({}),
      getNumRows: vi.fn().mockReturnValue(2),
      getNumUpdatedRows: vi.fn().mockReturnValue(0),
      streamRows: vi.fn(),
      fetchRows: vi.fn(),
      getQueryId: vi.fn().mockReturnValue("query-id"),
      getRequestId: vi.fn().mockReturnValue("request-id"),
      getSessionState: vi.fn().mockReturnValue({}),
      getStatementId: vi.fn().mockReturnValue("statement-id"),
    };
  }

  // Mock StatementOption type
  interface MockStatementOption {
    sqlText: string;
    binds?: any[];
    complete?: (
      err: Error | null | undefined,
      stmt: MockStatement,
      rows?: MockRowType[],
    ) => void;
    simulateError?: boolean;
    [key: string]: any;
  }

  // Mock function that simulates Snowflake's pattern with options.complete callback
  const mockSnowflakeFunction = vi.fn((options: MockStatementOption): MockStatement => {
    const statement = createMockStatement();

    // Call the complete callback if provided
    if (options && typeof options.complete === "function") {
      if (options.simulateError) {
        options.complete(new Error("Test error"), statement, undefined);
      } else {
        const rows: MockRowType[] = [
          { id: 1, name: "Row 1" },
          { id: 2, name: "Row 2" },
        ];
        options.complete(null, statement, rows);
      }
    }

    return statement;
  });

  // Mock function that returns a promise (simulating an async Snowflake function)
  const mockAsyncSnowflakeFunction = vi.fn(
    async (options: MockStatementOption): Promise<MockStatement> => {
      const statement = createMockStatement();

      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Call the complete callback if provided
      if (options && typeof options.complete === "function") {
        if (options.simulateError) {
          options.complete(new Error("Test error"), statement, undefined);
        } else {
          const rows: MockRowType[] = [
            { id: 1, name: "Row 1" },
            { id: 2, name: "Row 2" },
          ];
          options.complete(null, statement, rows);
        }
      }

      return statement;
    },
  );

  // Mock function that throws an error during statement creation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockErrorFunction = vi.fn((_options: MockStatementOption): MockStatement => {
    throw new Error("Statement creation error");
  });

  describe("callback approach", () => {
    it("should pass through to the original function when a callback is provided", () => {
      const wrappedFn = promisifyOptionsCallbackFunction<MockRowType, any>(
        mockConnection,
        mockSnowflakeFunction as any,
      );

      const callback = vi.fn();
      const options: MockStatementOption = {
        sqlText: "SELECT * FROM test",
        complete: callback,
      };

      wrappedFn(options as any);

      // Verify that the original function is called with the provided options
      expect(mockSnowflakeFunction).toHaveBeenCalledWith(options);
    });
  });

  describe("promise approach", () => {
    it("should return a promise with statement and resultsPromise", async () => {
      const wrappedFn = promisifyOptionsCallbackFunction<MockRowType, any>(
        mockConnection,
        mockSnowflakeFunction as any,
      );

      const options: MockStatementOption = {
        sqlText: "SELECT * FROM test",
        // No complete callback
      };

      const result = await wrappedFn(options as any);

      expect(mockSnowflakeFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          complete: expect.any(Function),
        }),
      );

      // Verify the structure of the returned object
      expect(result).toHaveProperty("statement");
      expect(result).toHaveProperty("resultsPromise");
      expect(result.statement).toHaveProperty("cancel");
      expect(result.resultsPromise).toBeInstanceOf(Promise);

      // Verify the rows promise resolves with the expected data
      const rows = await result.resultsPromise;
      expect(rows).toEqual([
        { id: 1, name: "Row 1" },
        { id: 2, name: "Row 2" },
      ]);
    });

    it("should handle errors in the resultsPromise", async () => {
      const wrappedFn = promisifyOptionsCallbackFunction<MockRowType, any>(
        mockConnection,
        mockSnowflakeFunction as any,
      );

      const options: MockStatementOption = {
        sqlText: "SELECT * FROM test",
        // Simulate an error during row retrieval
        simulateError: true,
      };

      const result = await wrappedFn(options as any);

      // The statement should still be available
      expect(result.statement).toHaveProperty("cancel");

      // But the rows promise should reject
      await expect(result.resultsPromise).rejects.toThrow("Test error");
    });

    it("should handle errors during statement creation", async () => {
      const wrappedFn = promisifyOptionsCallbackFunction<MockRowType, any>(
        mockConnection,
        mockErrorFunction as any,
      );

      const options: MockStatementOption = {
        sqlText: "SELECT * FROM test",
      };

      // The error is thrown directly from the mock function, so we need to catch it
      await expect(async () => {
        await wrappedFn(options as any);
      }).rejects.toThrow("Statement creation error");
    });

    it("should work with async functions", async () => {
      const wrappedFn = promisifyOptionsCallbackFunction<MockRowType, any>(
        mockConnection,
        mockAsyncSnowflakeFunction as any,
      );

      const options: MockStatementOption = {
        sqlText: "SELECT * FROM test",
      };

      const result = await wrappedFn(options as any);

      expect(mockAsyncSnowflakeFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          complete: expect.any(Function),
        }),
      );

      // Verify the structure of the returned object
      expect(result).toHaveProperty("statement");
      expect(result).toHaveProperty("resultsPromise");

      // Verify the rows promise resolves with the expected data
      const rows = await result.resultsPromise;
      expect(rows).toEqual([
        { id: 1, name: "Row 1" },
        { id: 2, name: "Row 2" },
      ]);
    });
  });

  describe("context preservation", () => {
    it("should preserve 'this' context when using callback", () => {
      const contextObject = {
        value: "test-context",
        fn: mockSnowflakeFunction,
      };

      const wrappedFn = promisifyOptionsCallbackFunction<MockRowType, any>(
        contextObject as any,
        contextObject.fn as any,
      );

      const callback = vi.fn();
      const options: MockStatementOption = {
        sqlText: "SELECT * FROM test",
        complete: callback,
      };

      wrappedFn(options as any);

      expect(mockSnowflakeFunction).toHaveBeenCalledWith(options);
      expect(mockSnowflakeFunction.mock.instances[0]).toBe(contextObject);
    });

    it("should preserve 'this' context when using promise", async () => {
      const contextObject = {
        value: "test-context",
        fn: mockSnowflakeFunction,
      };

      const wrappedFn = promisifyOptionsCallbackFunction<MockRowType, any>(
        contextObject as any,
        contextObject.fn as any,
      );

      const options: MockStatementOption = {
        sqlText: "SELECT * FROM test",
      };

      await wrappedFn(options as any);

      expect(mockSnowflakeFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          complete: expect.any(Function),
        }),
      );
      expect(mockSnowflakeFunction.mock.instances[0]).toBe(contextObject);
    });
  });

  describe("edge cases", () => {
    it("should handle options with additional properties", async () => {
      const wrappedFn = promisifyOptionsCallbackFunction<MockRowType, any>(
        mockConnection,
        mockSnowflakeFunction as any,
      );

      const options: MockStatementOption = {
        sqlText: "SELECT * FROM table",
        binds: [1, 2, 3],
        customProperty: "custom value",
      };

      const result = await wrappedFn(options as any);

      // Verify that all original options are preserved
      expect(mockSnowflakeFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          sqlText: "SELECT * FROM table",
          binds: [1, 2, 3],
          customProperty: "custom value",
          complete: expect.any(Function),
        }),
      );

      // Verify the rows promise resolves with the expected data
      const rows = await result.resultsPromise;
      expect(rows).toEqual([
        { id: 1, name: "Row 1" },
        { id: 2, name: "Row 2" },
      ]);
    });
  });
});
