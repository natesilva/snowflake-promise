import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import type { RowStatement, StatementCallback } from "snowflake-sdk";

const actualPromisifyOrNot = await import("../promisify-or-not.ts");
const promisifyOrNotMock = mock.fn(actualPromisifyOrNot.promisifyOrNot);
mock.module("../promisify-or-not.ts", {
  namedExports: { promisifyOrNot: promisifyOrNotMock },
});
const { promisifyStatement } = await import("../promisify-statement.ts");

function callCount(fn: unknown): number {
  return (fn as ReturnType<typeof mock.fn>).mock.callCount();
}

describe("promisifyStatement", () => {
  afterEach(() => {
    promisifyOrNotMock.mock.resetCalls();
    promisifyOrNotMock.mock.mockImplementation(actualPromisifyOrNot.promisifyOrNot);
  });

  // Create a mock RowStatement with the necessary methods
  function createMockStatement() {
    const mockStatement = {
      cancel: mock.fn((callback?: StatementCallback) => {
        if (callback) {
          callback(undefined, mockStatement as unknown as RowStatement);
        }
        return undefined;
      }),
      getSqlText: mock.fn(() => "SELECT * FROM test"),
      getStatus: mock.fn(() => "complete" as const),
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
    return mockStatement as unknown as RowStatement;
  }

  describe("promisification", () => {
    it("should promisify the cancel method", async () => {
      const mockStatement = createMockStatement();

      // Create a mock function for the promisified cancel method
      const promisifiedCancel = mock.fn(async () => undefined);
      promisifyOrNotMock.mock.mockImplementation(() => promisifiedCancel);

      const promisifiedStatement = promisifyStatement(mockStatement);

      // Call the cancel method without a callback
      const result = await promisifiedStatement.cancel();

      // The result should be undefined
      assert.equal(result, undefined);

      // The promisified function should have been called
      assert.equal(promisifiedCancel.mock.callCount(), 1);
    });

    it("should support callback for the cancel method", () => {
      const mockStatement = createMockStatement();
      const promisifiedStatement = promisifyStatement(mockStatement);
      const callback = mock.fn() as StatementCallback;

      // Test with callback
      promisifiedStatement.cancel(callback);
      const cancel = mockStatement.cancel as unknown as ReturnType<typeof mock.fn>;
      assert.deepEqual(cancel.mock.calls[0]?.arguments, [callback]);
      assert.equal(
        (callback as unknown as ReturnType<typeof mock.fn>).mock.callCount(),
        1,
      );
    });

    it("should pass through other methods unchanged", () => {
      const mockStatement = createMockStatement();
      const promisifiedStatement = promisifyStatement(mockStatement);

      // Test a few methods
      promisifiedStatement.getSqlText();
      assert.equal(callCount(mockStatement.getSqlText), 1);

      promisifiedStatement.getNumRows();
      assert.equal(callCount(mockStatement.getNumRows), 1);
      assert.equal(promisifiedStatement.getNumRows(), 2);
    });

    it("should set the __isPromisified property on the proxy", () => {
      const mockStatement = createMockStatement();
      const promisifiedStatement = promisifyStatement(mockStatement);

      // The property should NOT be set on the original object
      assert.ok(!(mockStatement as any).__isPromisified);

      // But it should be accessible through the proxy
      assert.equal(promisifiedStatement.__isPromisified, true);
    });

    it("should return the statement as-is if it's already promisified", () => {
      const mockStatement = createMockStatement();
      Object.defineProperty(mockStatement, "__isPromisified", {
        value: true,
        writable: false,
        enumerable: false,
        configurable: false,
      });

      const promisifiedStatement = promisifyStatement(mockStatement);

      // Should be the same object
      assert.equal(promisifiedStatement, mockStatement);
    });
  });

  describe("error handling", () => {
    it("should propagate errors when using promise", async () => {
      const mockStatement = createMockStatement();

      // Create a mock function that rejects with an error
      const promisifiedCancel = mock.fn(async () => {
        throw new Error("Test error");
      });
      promisifyOrNotMock.mock.mockImplementation(() => promisifiedCancel);

      const promisifiedStatement = promisifyStatement(mockStatement);

      // The promise should reject with the error
      await assert.rejects(async () => await promisifiedStatement.cancel(), {
        message: "Test error",
      });

      // The promisified function should have been called
      assert.equal(promisifiedCancel.mock.callCount(), 1);
    });

    it("should propagate errors when using callback", () => {
      const mockStatement = createMockStatement();
      const promisifiedStatement = promisifyStatement(mockStatement);
      const callback = mock.fn();

      // Create a mock error that matches the SnowflakeError interface
      const testError = {
        name: "Error",
        message: "Test error",
        code: 123,
        sqlState: "12345",
      } as any;

      // Mock the cancel method to call the callback with an error
      (mockStatement.cancel as any).mock.mockImplementation(
        (callback?: StatementCallback) => {
          if (callback) {
            callback(testError, mockStatement as unknown as RowStatement);
          }
          return undefined;
        },
      );

      // Call with a callback
      promisifiedStatement.cancel(callback as any);

      // The original cancel method should be called with the callback
      assert.deepEqual((mockStatement.cancel as any).mock.calls[0]?.arguments, [
        callback,
      ]);

      // The callback should have been called with the error
      const [error, statement] = callback.mock.calls[0]?.arguments ?? [];
      assert.equal(error, testError);
      assert.notEqual(statement, undefined);
      assert.equal(error.message, "Test error");
    });
  });

  describe("context preservation", () => {
    it("should preserve 'this' context for promisified methods", async () => {
      const mockStatement = createMockStatement();

      // Create a mock function that will be bound to the target
      const promisifiedCancel = mock.fn(async (..._args: unknown[]) => undefined);

      promisifyOrNotMock.mock.mockImplementation(() => {
        // Return a function that checks if it's bound to the mockStatement
        return function (this: any, ...args: any[]) {
          assert.equal(this, mockStatement);
          return promisifiedCancel.apply(this, args);
        };
      });

      const promisifiedStatement = promisifyStatement(mockStatement);

      // Call the cancel method
      await promisifiedStatement.cancel();

      // The promisified function should have been called
      assert.equal(promisifiedCancel.mock.callCount(), 1);
    });

    it("should preserve 'this' context for non-promisified methods", () => {
      const mockStatement = createMockStatement();

      // Create a new mock function that checks 'this'
      const contextCheckMock = mock.fn(function (this: any) {
        assert.equal(this, mockStatement);
        return "SELECT * FROM test";
      });

      // Replace the getSqlText method with our context-checking mock
      (mockStatement as any).getSqlText = contextCheckMock;

      const promisifiedStatement = promisifyStatement(mockStatement);

      promisifiedStatement.getSqlText();
      assert.equal(contextCheckMock.mock.callCount(), 1);
    });
  });

  describe("property access", () => {
    it("should allow access to properties", () => {
      const mockStatement = createMockStatement();
      // Add a test property using index signature
      (mockStatement as any).testProperty = "test value";

      const promisifiedStatement = promisifyStatement(mockStatement);

      assert.equal((promisifiedStatement as any).testProperty, "test value");
    });

    it("should allow setting properties", () => {
      const mockStatement = createMockStatement();
      const promisifiedStatement = promisifyStatement(mockStatement);

      (promisifiedStatement as any).testProperty = "new value";

      assert.equal((mockStatement as any).testProperty, "new value");
      assert.equal((promisifiedStatement as any).testProperty, "new value");
    });
  });
});
