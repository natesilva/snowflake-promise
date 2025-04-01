/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { promisifyConnection } from "./promisify-connection.js";
import type { Connection } from "snowflake-sdk";

// Extend Connection type to include our test methods
interface MockConnection extends Connection {
  otherMethod: (...args: any[]) => any;
  contextMethod?: (...args: any[]) => any;
}

describe("promisifyConnection", () => {
  let mockConnection: MockConnection;

  beforeEach(() => {
    // Create a mock Snowflake Connection object
    mockConnection = {
      execute: vi.fn(),
      fetchResult: vi.fn(),
      connect: vi.fn(),
      connectAsync: vi.fn(),
      destroy: vi.fn(),
      otherMethod: vi.fn(),
    } as unknown as MockConnection;
  });

  describe("basic functionality", () => {
    it("should return the connection as-is if it's already promisified", () => {
      // Set the __isPromisified property on the mock connection
      Object.defineProperty(mockConnection, "__isPromisified", {
        value: true,
        writable: false,
        enumerable: false,
        configurable: false,
      });

      const result = promisifyConnection(mockConnection);

      // Should be the same object
      expect(result).toBe(mockConnection);
    });

    it("should set the __isPromisified property on the proxy", () => {
      const promisifiedConnection = promisifyConnection(mockConnection);

      // The property should be accessible through the proxy
      expect(promisifiedConnection.__isPromisified).toBe(true);

      // The property should not be set on the original object
      expect(
        Object.getOwnPropertyDescriptor(mockConnection, "__isPromisified"),
      ).toBeUndefined();
    });
  });

  describe("method promisification", () => {
    it("should promisify execute method using promisifyOptionsCallbackFunction", async () => {
      // Create a mock for promisifyOptionsCallbackFunction
      const mockPromisifyOptionsCallbackFunction = vi
        .fn()
        .mockReturnValue("promisified-execute");

      // Mock the promisifyOptionsCallbackFunction at the module level
      vi.spyOn(
        await import("./promisify-options-callback-function.js"),
        "promisifyOptionsCallbackFunction",
      ).mockImplementation(mockPromisifyOptionsCallbackFunction);

      const promisifiedConnection = promisifyConnection(mockConnection);

      // Access the execute method
      const executeMethod = promisifiedConnection.execute;

      // Verify promisifyOptionsCallbackFunction was called with the right arguments
      expect(mockPromisifyOptionsCallbackFunction).toHaveBeenCalledWith(
        mockConnection,
        mockConnection.execute,
      );

      // The execute method should be the promisified version
      expect(executeMethod).toBe("promisified-execute");
    });

    it("should promisify fetchResult method using promisifyOptionsCallbackFunction", async () => {
      // Create a mock for promisifyOptionsCallbackFunction
      const mockPromisifyOptionsCallbackFunction = vi
        .fn()
        .mockReturnValue("promisified-fetchResult");

      // Mock the promisifyOptionsCallbackFunction at the module level
      vi.spyOn(
        await import("./promisify-options-callback-function.js"),
        "promisifyOptionsCallbackFunction",
      ).mockImplementation(mockPromisifyOptionsCallbackFunction);

      const promisifiedConnection = promisifyConnection(mockConnection);

      // Access the fetchResult method
      const fetchResultMethod = promisifiedConnection.fetchResult;

      // Verify promisifyOptionsCallbackFunction was called with the right arguments
      expect(mockPromisifyOptionsCallbackFunction).toHaveBeenCalledWith(
        mockConnection,
        mockConnection.fetchResult,
      );

      // The fetchResult method should be the promisified version
      expect(fetchResultMethod).toBe("promisified-fetchResult");
    });

    it("should promisify connect method using promisifyOrNot", async () => {
      // Create a mock for promisifyOrNot that returns a function with bind method
      const mockPromisifiedFunction = vi
        .fn()
        .mockReturnValue("promisified-connect-result");
      const mockBoundFunction = vi.fn().mockReturnValue(mockPromisifiedFunction);
      const mockPromisifyOrNot = vi.fn().mockReturnValue({
        bind: mockBoundFunction,
      });

      // Mock the promisifyOrNot at the module level
      vi.spyOn(
        await import("./promisify-or-not.js"),
        "promisifyOrNot",
      ).mockImplementation(mockPromisifyOrNot);

      const promisifiedConnection = promisifyConnection(mockConnection);

      // Access the connect method
      void promisifiedConnection.connect;

      // Verify promisifyOrNot was called with the right arguments
      expect(mockPromisifyOrNot).toHaveBeenCalledWith(mockConnection.connect);

      // Verify bind was called with the right context
      expect(mockBoundFunction).toHaveBeenCalledWith(mockConnection);
    });

    it("should promisify connectAsync method using promisifyOrNot", async () => {
      // Create a mock for promisifyOrNot that returns a function with bind method
      const mockPromisifiedFunction = vi
        .fn()
        .mockReturnValue("promisified-connectAsync-result");
      const mockBoundFunction = vi.fn().mockReturnValue(mockPromisifiedFunction);
      const mockPromisifyOrNot = vi.fn().mockReturnValue({
        bind: mockBoundFunction,
      });

      // Mock the promisifyOrNot at the module level
      vi.spyOn(
        await import("./promisify-or-not.js"),
        "promisifyOrNot",
      ).mockImplementation(mockPromisifyOrNot);

      const promisifiedConnection = promisifyConnection(mockConnection);

      // Access the connectAsync method
      void promisifiedConnection.connectAsync;

      // Verify promisifyOrNot was called with the right arguments
      expect(mockPromisifyOrNot).toHaveBeenCalledWith(mockConnection.connectAsync);

      // Verify bind was called with the right context
      expect(mockBoundFunction).toHaveBeenCalledWith(mockConnection);
    });

    it("should promisify destroy method using promisifyOrNot", async () => {
      // Create a mock for promisifyOrNot that returns a function with bind method
      const mockPromisifiedFunction = vi
        .fn()
        .mockReturnValue("promisified-destroy-result");
      const mockBoundFunction = vi.fn().mockReturnValue(mockPromisifiedFunction);
      const mockPromisifyOrNot = vi.fn().mockReturnValue({
        bind: mockBoundFunction,
      });

      // Mock the promisifyOrNot at the module level
      vi.spyOn(
        await import("./promisify-or-not.js"),
        "promisifyOrNot",
      ).mockImplementation(mockPromisifyOrNot);

      const promisifiedConnection = promisifyConnection(mockConnection);

      // Access the destroy method
      void promisifiedConnection.destroy;

      // Verify promisifyOrNot was called with the right arguments
      expect(mockPromisifyOrNot).toHaveBeenCalledWith(mockConnection.destroy);

      // Verify bind was called with the right context
      expect(mockBoundFunction).toHaveBeenCalledWith(mockConnection);
    });

    it("should not promisify other methods but should bind them to the original object", () => {
      const promisifiedConnection = promisifyConnection(
        mockConnection,
      ) as unknown as MockConnection;

      // Call another method
      promisifiedConnection.otherMethod("test");

      // The original method should be called with the right arguments
      expect(mockConnection.otherMethod).toHaveBeenCalledWith("test");
    });
  });

  describe("context preservation", () => {
    it("should preserve context for methods promisified with promisifyOptionsCallbackFunction", async () => {
      // Create a mock function to track the context
      const contextTracker = { context: null as any };

      // Mock the module import
      const module = await import("./promisify-options-callback-function.js");

      // Create a spy that just records the context
      const spy = vi.spyOn(module, "promisifyOptionsCallbackFunction");

      // We're not changing the implementation, just spying on the calls
      // This avoids TypeScript errors with mock implementations

      const promisifiedConnection = promisifyConnection(mockConnection);

      // Call the execute method with the required sqlText
      const options = { sqlText: "SELECT * FROM test" };

      // We need to mock the statement returned by execute to avoid errors
      vi.spyOn(
        await import("./promisify-statement.js"),
        "promisifyStatement",
      ).mockImplementation((stmt) => {
        return { ...stmt, __isPromisified: true } as any;
      });

      // Execute should be called with the mockConnection as 'this'
      // We need to cast to any to avoid TypeScript errors with the mock implementation
      (mockConnection as any).execute = vi.fn(function (this: any) {
        // Record the context
        contextTracker.context = this;
        return { id: "statement-id" };
      });

      // Call execute
      promisifiedConnection.execute(options);

      // Verify the spy was called
      expect(spy).toHaveBeenCalled();

      // Verify the context was preserved (execute was called with mockConnection as 'this')
      expect(contextTracker.context).toBe(mockConnection);
    });

    it("should preserve context for methods promisified with promisifyOrNot", async () => {
      // Create a mock function that will be bound to the target
      const mockPromisifiedFunction = vi.fn();

      // Mock the promisifyOrNot to return our mock and check binding
      vi.spyOn(
        await import("./promisify-or-not.js"),
        "promisifyOrNot",
      ).mockImplementation(() => {
        // Return a function that checks if it's bound to the mockConnection
        return function (this: any, ...args: any[]) {
          expect(this).toBe(mockConnection);
          return mockPromisifiedFunction.apply(this, args);
        };
      });

      const promisifiedConnection = promisifyConnection(mockConnection);

      // Call the connect method
      promisifiedConnection.connect();

      // The promisified function should have been called
      expect(mockPromisifiedFunction).toHaveBeenCalled();
    });

    it("should preserve context for non-promisified methods", () => {
      // Create a mock method that checks 'this'
      const contextCheckMock = vi.fn(function (this: any) {
        expect(this).toBe(mockConnection);
        return "test result";
      });

      // Add it to the mock connection
      mockConnection.contextMethod = contextCheckMock;

      const promisifiedConnection = promisifyConnection(
        mockConnection,
      ) as unknown as MockConnection;

      // Call the method
      promisifiedConnection.contextMethod?.();

      // Verify the method was called and checked the context
      expect(contextCheckMock).toHaveBeenCalled();
    });
  });

  describe("property access", () => {
    it("should allow access to properties", () => {
      // Add a test property
      (mockConnection as any).testProperty = "test value";

      const promisifiedConnection = promisifyConnection(mockConnection);

      // Should be able to access the property through the proxy
      expect((promisifiedConnection as any).testProperty).toBe("test value");
    });

    it("should allow setting properties", () => {
      const promisifiedConnection = promisifyConnection(mockConnection);

      // Set a property through the proxy
      (promisifiedConnection as any).testProperty = "new value";

      // The property should be set on the original object
      expect((mockConnection as any).testProperty).toBe("new value");

      // And accessible through the proxy
      expect((promisifiedConnection as any).testProperty).toBe("new value");
    });
  });

  describe("integration with real dependencies", () => {
    // Reset the mocks to use the real implementations
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    // Mock promisifyStatement for integration tests
    beforeEach(async () => {
      // Mock promisifyStatement to return the statement with __isPromisified set to true
      vi.spyOn(
        await import("./promisify-statement.js"),
        "promisifyStatement",
      ).mockImplementation((stmt) => {
        // Create a new object with __isPromisified set to true
        const promisifiedStmt = Object.create(stmt);
        Object.defineProperty(promisifiedStmt, "__isPromisified", {
          value: true,
          writable: false,
          enumerable: false,
          configurable: false,
        });
        return promisifiedStmt;
      });
    });

    it("should correctly integrate with real promisifyOptionsCallbackFunction", async () => {
      // Create a mock execute method that calls the complete callback
      const mockExecute = vi.fn((options: any) => {
        if (options && typeof options.complete === "function") {
          const mockStatement = { id: "statement-id" };
          const mockRows = [{ id: 1, name: "Test" }];
          options.complete(null, mockStatement, mockRows);
        }
        return { id: "statement-id" };
      });

      // Create a connection with the mock execute method
      const connection = {
        execute: mockExecute,
      } as unknown as Connection;

      const promisifiedConnection = promisifyConnection(connection);

      // Call execute without a callback (Promise mode)
      const result = promisifiedConnection.execute({
        sqlText: "SELECT * FROM test",
      });

      // Should return an object with statement and resultsPromise
      expect(result).toHaveProperty("statement");
      expect(result).toHaveProperty("resultsPromise");

      // The resultsPromise should resolve to the mock rows
      const rows = await result.resultsPromise;
      expect(rows).toEqual([{ id: 1, name: "Test" }]);
    });

    it("should correctly integrate with real promisifyOrNot", async () => {
      // Create a mock connect method that calls the callback
      const mockConnect = vi.fn((callback?: (err: Error | null, conn: any) => void) => {
        if (callback) {
          callback(null, { connected: true });
        }
      });

      // Create a connection with the mock connect method
      const connection = {
        connect: mockConnect,
      } as unknown as Connection;

      const promisifiedConnection = promisifyConnection(connection);

      // Call connect without a callback (Promise mode)
      const result = await promisifiedConnection.connect();

      // Should return the result from the callback
      expect(result).toEqual({ connected: true });
    });
  });
});
