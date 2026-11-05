import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, mock } from "node:test";
import type { Connection } from "snowflake-sdk";

const actualPromisifyOrNot = await import("../promisify-or-not.ts");
const actualPromisifyOptionsCallbackFunction = await import(
  "../promisify-options-callback-function.ts"
);
const actualPromisifyStatement = await import("../promisify-statement.ts");

const promisifyOrNotMock = mock.fn(actualPromisifyOrNot.promisifyOrNot);
const promisifyOptionsCallbackFunctionMock = mock.fn(
  actualPromisifyOptionsCallbackFunction.promisifyOptionsCallbackFunction,
);
const promisifyStatementMock = mock.fn(actualPromisifyStatement.promisifyStatement);

mock.module("../promisify-or-not.ts", {
  namedExports: { promisifyOrNot: promisifyOrNotMock },
});
mock.module("../promisify-options-callback-function.ts", {
  namedExports: {
    promisifyOptionsCallbackFunction: promisifyOptionsCallbackFunctionMock,
  },
});
mock.module("../promisify-statement.ts", {
  namedExports: { promisifyStatement: promisifyStatementMock },
});

const { promisifyConnection } = await import("../promisify-connection.ts");

// Extend Connection type to include our test methods
interface MockConnection extends Connection {
  otherMethod: (...args: any[]) => any;
  contextMethod?: (...args: any[]) => any;
}

describe("promisifyConnection", () => {
  let mockConnection: MockConnection;

  afterEach(() => {
    promisifyOrNotMock.mock.resetCalls();
    promisifyOrNotMock.mock.mockImplementation(actualPromisifyOrNot.promisifyOrNot);
    promisifyOptionsCallbackFunctionMock.mock.resetCalls();
    promisifyOptionsCallbackFunctionMock.mock.mockImplementation(
      actualPromisifyOptionsCallbackFunction.promisifyOptionsCallbackFunction,
    );
    promisifyStatementMock.mock.resetCalls();
    promisifyStatementMock.mock.mockImplementation(
      actualPromisifyStatement.promisifyStatement,
    );
  });

  beforeEach(() => {
    // Create a mock Snowflake Connection object
    mockConnection = {
      execute: mock.fn(),
      fetchResult: mock.fn(),
      connect: mock.fn(),
      connectAsync: mock.fn(),
      destroy: mock.fn(),
      otherMethod: mock.fn(),
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
      assert.equal(result, mockConnection);
    });

    it("should set the __isPromisified property on the proxy", () => {
      const promisifiedConnection = promisifyConnection(mockConnection);

      // The property should be accessible through the proxy
      assert.equal(promisifiedConnection.__isPromisified, true);

      // The property should not be set on the original object
      assert.equal(
        Object.getOwnPropertyDescriptor(mockConnection, "__isPromisified"),
        undefined,
      );
    });
  });

  describe("method promisification", () => {
    it("should promisify execute method using promisifyOptionsCallbackFunction", async () => {
      // Create a mock for promisifyOptionsCallbackFunction
      const mockPromisifyOptionsCallbackFunction = mock.fn(() => "promisified-execute");
      promisifyOptionsCallbackFunctionMock.mock.mockImplementation(
        mockPromisifyOptionsCallbackFunction as never,
      );

      const promisifiedConnection = promisifyConnection(mockConnection);

      // Access the execute method
      const executeMethod = promisifiedConnection.execute;

      // Verify promisifyOptionsCallbackFunction was called with the right arguments
      assert.deepEqual(mockPromisifyOptionsCallbackFunction.mock.calls[0]?.arguments, [
        mockConnection,
        mockConnection.execute,
      ]);

      // The execute method should be the promisified version
      assert.equal(executeMethod, "promisified-execute");
    });

    it("should promisify fetchResult method using promisifyOptionsCallbackFunction", async () => {
      // Create a mock for promisifyOptionsCallbackFunction
      const mockPromisifyOptionsCallbackFunction = mock.fn(
        () => "promisified-fetchResult",
      );
      promisifyOptionsCallbackFunctionMock.mock.mockImplementation(
        mockPromisifyOptionsCallbackFunction as never,
      );

      const promisifiedConnection = promisifyConnection(mockConnection);

      // Access the fetchResult method
      const fetchResultMethod = promisifiedConnection.fetchResult;

      // Verify promisifyOptionsCallbackFunction was called with the right arguments
      assert.deepEqual(mockPromisifyOptionsCallbackFunction.mock.calls[0]?.arguments, [
        mockConnection,
        mockConnection.fetchResult,
      ]);

      // The fetchResult method should be the promisified version
      assert.equal(fetchResultMethod, "promisified-fetchResult");
    });

    it("should promisify connect method using promisifyOrNot", async () => {
      // Create a mock for promisifyOrNot that returns a function with bind method
      const mockPromisifiedFunction = mock.fn(() => "promisified-connect-result");
      const mockBoundFunction = mock.fn(() => mockPromisifiedFunction);
      const mockPromisifyOrNot = mock.fn(() => ({ bind: mockBoundFunction }));
      promisifyOrNotMock.mock.mockImplementation(mockPromisifyOrNot as never);

      const promisifiedConnection = promisifyConnection(mockConnection);

      // Access the connect method
      void promisifiedConnection.connect;

      // Verify promisifyOrNot was called with the right arguments
      assert.deepEqual(mockPromisifyOrNot.mock.calls[0]?.arguments, [
        mockConnection.connect,
      ]);

      // Verify bind was called with the right context
      assert.deepEqual(mockBoundFunction.mock.calls[0]?.arguments, [mockConnection]);
    });

    it("should promisify connectAsync method using promisifyOrNot", async () => {
      // Create a mock for promisifyOrNot that returns a function with bind method
      const mockPromisifiedFunction = mock.fn(() => "promisified-connectAsync-result");
      const mockBoundFunction = mock.fn(() => mockPromisifiedFunction);
      const mockPromisifyOrNot = mock.fn(() => ({ bind: mockBoundFunction }));
      promisifyOrNotMock.mock.mockImplementation(mockPromisifyOrNot as never);

      const promisifiedConnection = promisifyConnection(mockConnection);

      // Access the connectAsync method
      void promisifiedConnection.connectAsync;

      // Verify promisifyOrNot was called with the right arguments
      assert.deepEqual(mockPromisifyOrNot.mock.calls[0]?.arguments, [
        mockConnection.connectAsync,
      ]);

      // Verify bind was called with the right context
      assert.deepEqual(mockBoundFunction.mock.calls[0]?.arguments, [mockConnection]);
    });

    it("should promisify destroy method using promisifyOrNot", async () => {
      // Create a mock for promisifyOrNot that returns a function with bind method
      const mockPromisifiedFunction = mock.fn(() => "promisified-destroy-result");
      const mockBoundFunction = mock.fn(() => mockPromisifiedFunction);
      const mockPromisifyOrNot = mock.fn(() => ({ bind: mockBoundFunction }));
      promisifyOrNotMock.mock.mockImplementation(mockPromisifyOrNot as never);

      const promisifiedConnection = promisifyConnection(mockConnection);

      // Access the destroy method
      void promisifiedConnection.destroy;

      // Verify promisifyOrNot was called with the right arguments
      assert.deepEqual(mockPromisifyOrNot.mock.calls[0]?.arguments, [
        mockConnection.destroy,
      ]);

      // Verify bind was called with the right context
      assert.deepEqual(mockBoundFunction.mock.calls[0]?.arguments, [mockConnection]);
    });

    it("should not promisify other methods but should bind them to the original object", () => {
      const promisifiedConnection = promisifyConnection(
        mockConnection,
      ) as unknown as MockConnection;

      // Call another method
      promisifiedConnection.otherMethod("test");

      // The original method should be called with the right arguments
      assert.deepEqual(
        (mockConnection.otherMethod as never as ReturnType<typeof mock.fn>).mock.calls[0]
          ?.arguments,
        ["test"],
      );
    });
  });

  describe("context preservation", () => {
    it("should preserve context for methods promisified with promisifyOptionsCallbackFunction", async () => {
      // Create a mock function to track the context
      const contextTracker = { context: null as any };

      const promisifiedConnection = promisifyConnection(mockConnection);

      // Call the execute method with the required sqlText
      const options = { sqlText: "SELECT * FROM test" };

      // We need to mock the statement returned by execute to avoid errors
      promisifyStatementMock.mock.mockImplementation((stmt) => {
        return { ...stmt, __isPromisified: true } as any;
      });

      // Execute should be called with the mockConnection as 'this'
      // We need to cast to any to avoid TypeScript errors with the mock implementation
      (mockConnection as any).execute = mock.fn(function (this: any) {
        // Record the context
        contextTracker.context = this;
        return { id: "statement-id" };
      });

      // Call execute
      promisifiedConnection.execute(options);

      // Verify the spy was called
      assert.equal(promisifyOptionsCallbackFunctionMock.mock.callCount() > 0, true);

      // Verify the context was preserved (execute was called with mockConnection as 'this')
      assert.equal(contextTracker.context, mockConnection);
    });

    it("should preserve context for methods promisified with promisifyOrNot", async () => {
      // Create a mock function that will be bound to the target
      const mockPromisifiedFunction = mock.fn();

      // Mock the promisifyOrNot to return our mock and check binding
      promisifyOrNotMock.mock.mockImplementation(() => {
        // Return a function that checks if it's bound to the mockConnection
        return function (this: any, ...args: any[]) {
          assert.equal(this, mockConnection);
          return mockPromisifiedFunction.apply(this, args);
        };
      });

      const promisifiedConnection = promisifyConnection(mockConnection);

      // Call the connect method
      promisifiedConnection.connect();

      // The promisified function should have been called
      assert.equal(mockPromisifiedFunction.mock.callCount(), 1);
    });

    it("should preserve context for non-promisified methods", () => {
      // Create a mock method that checks 'this'
      const contextCheckMock = mock.fn(function (this: any) {
        assert.equal(this, mockConnection);
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
      assert.equal(contextCheckMock.mock.callCount(), 1);
    });
  });

  describe("property access", () => {
    it("should allow access to properties", () => {
      // Add a test property
      (mockConnection as any).testProperty = "test value";

      const promisifiedConnection = promisifyConnection(mockConnection);

      // Should be able to access the property through the proxy
      assert.equal((promisifiedConnection as any).testProperty, "test value");
    });

    it("should allow setting properties", () => {
      const promisifiedConnection = promisifyConnection(mockConnection);

      // Set a property through the proxy
      (promisifiedConnection as any).testProperty = "new value";

      // The property should be set on the original object
      assert.equal((mockConnection as any).testProperty, "new value");

      // And accessible through the proxy
      assert.equal((promisifiedConnection as any).testProperty, "new value");
    });
  });

  describe("integration with real dependencies", () => {
    beforeEach(async () => {
      // Mock promisifyStatement to return the statement with __isPromisified set to true
      promisifyStatementMock.mock.mockImplementation((stmt) => {
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
      const mockExecute = mock.fn((options: any) => {
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
      assert.ok("statement" in result);
      assert.ok("resultsPromise" in result);

      // The resultsPromise should resolve to the mock rows
      const rows = await result.resultsPromise;
      assert.deepEqual(rows, [{ id: 1, name: "Test" }]);
    });

    it("should correctly integrate with real promisifyOrNot", async () => {
      // Create a mock connect method that calls the callback
      const mockConnect = mock.fn((callback?: (err: Error | null, conn: any) => void) => {
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
      assert.deepEqual(result, { connected: true });
    });
  });
});
