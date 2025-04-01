/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { promisifyStatement } from "./promisify-statement.js";
import type { RowStatement, StatementCallback } from "snowflake-sdk";

describe("promisifyStatement", () => {
  // Create a mock RowStatement with the necessary methods
  function createMockStatement() {
    const mockStatement = {
      cancel: vi.fn((callback?: StatementCallback) => {
        if (callback) {
          callback(undefined, mockStatement as unknown as RowStatement);
        }
        return undefined;
      }),
      getSqlText: vi.fn().mockReturnValue("SELECT * FROM test"),
      getStatus: vi.fn().mockReturnValue("complete" as const),
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
    return mockStatement as unknown as RowStatement;
  }

  describe("promisification", () => {
    it("should promisify the cancel method", async () => {
      const mockStatement = createMockStatement();

      // Create a mock function for the promisified cancel method
      const promisifiedCancel = vi.fn().mockResolvedValue(undefined);

      // Mock the promisifyOrNot function at the module level
      vi.spyOn(
        await import("./promisify-or-not.js"),
        "promisifyOrNot",
      ).mockImplementation(() => {
        return promisifiedCancel;
      });

      const promisifiedStatement = promisifyStatement(mockStatement);

      // Call the cancel method without a callback
      const result = await promisifiedStatement.cancel();

      // The result should be undefined
      expect(result).toBeUndefined();

      // The promisified function should have been called
      expect(promisifiedCancel).toHaveBeenCalled();
    });

    it("should support callback for the cancel method", () => {
      const mockStatement = createMockStatement();
      const promisifiedStatement = promisifyStatement(mockStatement);
      const callback = vi.fn() as StatementCallback;

      // Test with callback
      promisifiedStatement.cancel(callback);
      expect(mockStatement.cancel).toHaveBeenCalledWith(callback);
      expect(callback).toHaveBeenCalled();
    });

    it("should pass through other methods unchanged", () => {
      const mockStatement = createMockStatement();
      const promisifiedStatement = promisifyStatement(mockStatement);

      // Test a few methods
      promisifiedStatement.getSqlText();
      expect(mockStatement.getSqlText).toHaveBeenCalled();

      promisifiedStatement.getNumRows();
      expect(mockStatement.getNumRows).toHaveBeenCalled();
      expect(promisifiedStatement.getNumRows()).toBe(2);
    });

    it("should set the __isPromisified property on the proxy", () => {
      const mockStatement = createMockStatement();
      const promisifiedStatement = promisifyStatement(mockStatement);

      // The property should NOT be set on the original object
      expect((mockStatement as any).__isPromisified).toBeFalsy();

      // But it should be accessible through the proxy
      expect(promisifiedStatement.__isPromisified).toBe(true);
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
      expect(promisifiedStatement).toBe(mockStatement);
    });
  });

  describe("error handling", () => {
    it("should propagate errors when using promise", async () => {
      const mockStatement = createMockStatement();

      // Create a mock function that rejects with an error
      const promisifiedCancel = vi.fn().mockRejectedValue(new Error("Test error"));

      // Mock the promisifyOrNot function at the module level
      vi.spyOn(
        await import("./promisify-or-not.js"),
        "promisifyOrNot",
      ).mockImplementation(() => {
        return promisifiedCancel;
      });

      const promisifiedStatement = promisifyStatement(mockStatement);

      // The promise should reject with the error
      await expect(promisifiedStatement.cancel()).rejects.toThrow("Test error");

      // The promisified function should have been called
      expect(promisifiedCancel).toHaveBeenCalled();
    });

    it("should propagate errors when using callback", () => {
      const mockStatement = createMockStatement();
      const promisifiedStatement = promisifyStatement(mockStatement);
      const callback = vi.fn();

      // Create a mock error that matches the SnowflakeError interface
      const testError = {
        name: "Error",
        message: "Test error",
        code: 123,
        sqlState: "12345",
      } as any;

      // Mock the cancel method to call the callback with an error
      (mockStatement.cancel as any).mockImplementation((callback?: StatementCallback) => {
        if (callback) {
          callback(testError, mockStatement as unknown as RowStatement);
        }
        return undefined;
      });

      // Call with a callback
      promisifiedStatement.cancel(callback as any);

      // The original cancel method should be called with the callback
      expect(mockStatement.cancel).toHaveBeenCalledWith(callback);

      // The callback should have been called with the error
      expect(callback).toHaveBeenCalledWith(testError, expect.anything());
      expect((callback as any).mock.calls[0][0].message).toBe("Test error");
    });
  });

  describe("context preservation", () => {
    it("should preserve 'this' context for promisified methods", async () => {
      const mockStatement = createMockStatement();

      // Create a mock function that will be bound to the target
      const promisifiedCancel = vi.fn().mockResolvedValue(undefined);

      // Mock the promisifyOrNot function to return our mock and check binding
      vi.spyOn(
        await import("./promisify-or-not.js"),
        "promisifyOrNot",
      ).mockImplementation(() => {
        // Return a function that checks if it's bound to the mockStatement
        return function (this: any, ...args: any[]) {
          expect(this).toBe(mockStatement);
          return promisifiedCancel.apply(this, args);
        };
      });

      const promisifiedStatement = promisifyStatement(mockStatement);

      // Call the cancel method
      await promisifiedStatement.cancel();

      // The promisified function should have been called
      expect(promisifiedCancel).toHaveBeenCalled();
    });

    it("should preserve 'this' context for non-promisified methods", () => {
      const mockStatement = createMockStatement();

      // Create a new mock function that checks 'this'
      const contextCheckMock = vi.fn(function (this: any) {
        expect(this).toBe(mockStatement);
        return "SELECT * FROM test";
      });

      // Replace the getSqlText method with our context-checking mock
      (mockStatement as any).getSqlText = contextCheckMock;

      const promisifiedStatement = promisifyStatement(mockStatement);

      promisifiedStatement.getSqlText();
      expect(contextCheckMock).toHaveBeenCalled();
    });
  });

  describe("property access", () => {
    it("should allow access to properties", () => {
      const mockStatement = createMockStatement();
      // Add a test property using index signature
      (mockStatement as any)["testProperty"] = "test value";

      const promisifiedStatement = promisifyStatement(mockStatement);

      expect((promisifiedStatement as any)["testProperty"]).toBe("test value");
    });

    it("should allow setting properties", () => {
      const mockStatement = createMockStatement();
      const promisifiedStatement = promisifyStatement(mockStatement);

      (promisifiedStatement as any)["testProperty"] = "new value";

      expect((mockStatement as any)["testProperty"]).toBe("new value");
      expect((promisifiedStatement as any)["testProperty"]).toBe("new value");
    });
  });
});
