import { Readable } from "stream";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConnectionOptions, Snowflake } from "../index.js";
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

describe("Integration Tests", () => {
  // Sample connection options for testing
  const connectionOptions: ConnectionOptions = {
    account: "test-account",
    username: "test-user",
    password: "test-password",
    database: "test-db",
    schema: "test-schema",
    warehouse: "test-wh",
  };

  let snowflake: Snowflake;

  beforeEach(() => {
    resetMocks();
    snowflake = new Snowflake(connectionOptions);
  });

  describe("Basic Query Workflow", () => {
    it("should connect and execute a query", async () => {
      await snowflake.connect();
      const rows = await snowflake.execute("SELECT * FROM test");

      expect(mockConnection.connect).toHaveBeenCalled();
      expect(mockConnection.execute).toHaveBeenCalledWith(
        expect.objectContaining({ sqlText: "SELECT * FROM test" }),
      );
      expect(rows).toEqual([{ COLUMN1: "mock-data" }]);
    });

    it("should connect and execute a parameterized query", async () => {
      await snowflake.connect();
      const rows = await snowflake.execute("SELECT * FROM test WHERE id = ?", [123]);

      expect(mockConnection.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          sqlText: "SELECT * FROM test WHERE id = ?",
          binds: [123],
        }),
      );
      expect(rows).toEqual([{ COLUMN1: "mock-data" }]);
    });
  });

  describe("Statement API Workflow", () => {
    it("should create and execute a statement", async () => {
      await snowflake.connect();

      const statement = snowflake.createStatement({
        sqlText: "SELECT * FROM test WHERE id = ?",
        binds: [123],
      });

      await statement.execute();
      const rows = await statement.getRows();

      expect(mockConnection.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          sqlText: "SELECT * FROM test WHERE id = ?",
          binds: [123],
        }),
      );
      expect(rows).toEqual([{ COLUMN1: "mock-data" }]);
    });

    it("should stream results from a statement", async () => {
      await snowflake.connect();

      const statement = snowflake.createStatement({
        sqlText: "SELECT * FROM test",
        streamResult: true,
      });

      await statement.execute();
      const stream = statement.streamRows();

      expect(stream).toBeInstanceOf(Readable);

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
  });

  describe("Error Handling", () => {
    it("should handle connection errors", async () => {
      // Mock connection failure
      mockConnection.connect.mockImplementationOnce((callback) =>
        callback(new Error("Connection failed")),
      );

      await expect(snowflake.connect()).rejects.toThrow("Connection failed");
    });

    it("should handle query execution errors", async () => {
      await snowflake.connect();

      // Mock execution failure
      mockConnection.execute.mockImplementationOnce((options) => {
        process.nextTick(() => options.complete(new Error("Query failed")));
        return mockStatement;
      });

      await expect(snowflake.execute("SELECT * FROM test")).rejects.toThrow(
        "Query failed",
      );
    });
  });

  describe("Connection Lifecycle", () => {
    it("should connect, execute queries, and destroy the connection", async () => {
      await snowflake.connect();
      await snowflake.execute("SELECT * FROM test");
      await snowflake.destroy();

      expect(mockConnection.connect).toHaveBeenCalled();
      expect(mockConnection.execute).toHaveBeenCalled();
      expect(mockConnection.destroy).toHaveBeenCalled();
    });
  });
});
