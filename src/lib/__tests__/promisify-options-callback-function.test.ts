import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import type { Connection } from "snowflake-sdk";
import { promisifyOptionsCallbackFunction } from "../promisify-options-callback-function.ts";

describe("promisifyOptionsCallbackFunction", () => {
  afterEach(() => {
    mockSnowflakeFunction.mock.resetCalls();
    mockAsyncSnowflakeFunction.mock.resetCalls();
    mockErrorFunction.mock.resetCalls();
  });

  function firstOptions(fn: {
    mock: { calls: { arguments: unknown[] }[] };
  }): MockStatementOption {
    const options = fn.mock.calls[0]?.arguments[0];
    assert.ok(options);
    return options as MockStatementOption;
  }

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
      cancel: mock.fn(),
      getSqlText: mock.fn(() => "SELECT * FROM test"),
      getStatus: mock.fn(() => "SUCCEEDED"),
      getColumns: mock.fn(() => []),
      getColumn: mock.fn(() => ({})),
      getNumRows: mock.fn(() => 2),
      getNumUpdatedRows: mock.fn(() => 0),
      streamRows: mock.fn(),
      fetchRows: mock.fn(),
      getQueryId: mock.fn(() => "query-id"),
      getRequestId: mock.fn(() => "request-id"),
      getSessionState: mock.fn(() => ({})),
      getStatementId: mock.fn(() => "statement-id"),
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
  const mockSnowflakeFunction = mock.fn((options: MockStatementOption): MockStatement => {
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
  const mockAsyncSnowflakeFunction = mock.fn(
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
  const mockErrorFunction = mock.fn((_options: MockStatementOption): MockStatement => {
    throw new Error("Statement creation error");
  });

  describe("callback approach", () => {
    it("should pass through to the original function when a callback is provided", () => {
      const wrappedFn = promisifyOptionsCallbackFunction<MockRowType, any>(
        mockConnection,
        mockSnowflakeFunction as any,
      );

      const callback = mock.fn();
      const options: MockStatementOption = {
        sqlText: "SELECT * FROM test",
        complete: callback,
      };

      wrappedFn(options as any);

      // Verify that the original function is called with the provided options
      assert.deepEqual(mockSnowflakeFunction.mock.calls[0]?.arguments, [options]);
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

      const calledWith = firstOptions(mockSnowflakeFunction);
      assert.equal(typeof calledWith.complete, "function");

      // Verify the structure of the returned object
      assert.ok("statement" in result);
      assert.ok("resultsPromise" in result);
      assert.ok("cancel" in result.statement);
      assert.ok(result.resultsPromise instanceof Promise);

      // Verify the rows promise resolves with the expected data
      const rows = await result.resultsPromise;
      assert.deepEqual(rows, [
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
      assert.ok("cancel" in result.statement);

      // But the rows promise should reject
      await assert.rejects(result.resultsPromise, { message: "Test error" });
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
      await assert.rejects(
        async () => {
          await wrappedFn(options as any);
        },
        { message: "Statement creation error" },
      );
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

      const calledWith = firstOptions(mockAsyncSnowflakeFunction);
      assert.equal(typeof calledWith.complete, "function");

      // Verify the structure of the returned object
      assert.ok("statement" in result);
      assert.ok("resultsPromise" in result);

      // Verify the rows promise resolves with the expected data
      const rows = await result.resultsPromise;
      assert.deepEqual(rows, [
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

      const callback = mock.fn();
      const options: MockStatementOption = {
        sqlText: "SELECT * FROM test",
        complete: callback,
      };

      wrappedFn(options as any);

      assert.deepEqual(mockSnowflakeFunction.mock.calls[0]?.arguments, [options]);
      assert.equal(mockSnowflakeFunction.mock.calls[0]?.this, contextObject);
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

      const calledWith = firstOptions(mockSnowflakeFunction);
      assert.equal(typeof calledWith.complete, "function");
      assert.equal(mockSnowflakeFunction.mock.calls[0]?.this, contextObject);
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
      const calledWith = firstOptions(mockSnowflakeFunction);
      assert.equal(typeof calledWith.complete, "function");
      assert.equal(calledWith.sqlText, "SELECT * FROM table");
      assert.deepEqual(calledWith.binds, [1, 2, 3]);
      assert.equal(calledWith.customProperty, "custom value");

      // Verify the rows promise resolves with the expected data
      const rows = await result.resultsPromise;
      assert.deepEqual(rows, [
        { id: 1, name: "Row 1" },
        { id: 2, name: "Row 2" },
      ]);
    });
  });
});
