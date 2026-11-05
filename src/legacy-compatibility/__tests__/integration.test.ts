import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { beforeEach, describe, it, mock } from "node:test";
import type { ConnectionOptions } from "../index.ts";
import {
  mockConnection,
  mockSdk,
  mockStatement,
  resetMocks,
} from "./mocks/snowflake-sdk.mock.ts";

mock.module("snowflake-sdk", { namedExports: { ...mockSdk }, defaultExport: mockSdk });

const { Snowflake } = await import("../index.ts");
type Snowflake = InstanceType<typeof Snowflake>;

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

      assert.ok(mockConnection.connect.mock.callCount() > 0);
      assert.equal(
        mockConnection.execute.mock.calls[0]?.arguments[0]?.sqlText,
        "SELECT * FROM test",
      );
      assert.deepEqual(rows, [{ COLUMN1: "mock-data" }]);
    });

    it("should connect and execute a parameterized query", async () => {
      await snowflake.connect();
      const rows = await snowflake.execute("SELECT * FROM test WHERE id = ?", [123]);

      const executeOptions = mockConnection.execute.mock.calls[0]?.arguments[0];
      assert.equal(executeOptions?.sqlText, "SELECT * FROM test WHERE id = ?");
      assert.deepEqual(executeOptions?.binds, [123]);
      assert.deepEqual(rows, [{ COLUMN1: "mock-data" }]);
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

      const executeOptions = mockConnection.execute.mock.calls[0]?.arguments[0];
      assert.equal(executeOptions?.sqlText, "SELECT * FROM test WHERE id = ?");
      assert.deepEqual(executeOptions?.binds, [123]);
      assert.deepEqual(rows, [{ COLUMN1: "mock-data" }]);
    });

    it("should stream results from a statement", async () => {
      await snowflake.connect();

      const statement = snowflake.createStatement({
        sqlText: "SELECT * FROM test",
        streamResult: true,
      });

      await statement.execute();
      const stream = statement.streamRows();

      assert.ok(stream instanceof Readable);

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
  });

  describe("Error Handling", () => {
    it("should handle connection errors", async () => {
      // Mock connection failure
      mockConnection.connect.mock.mockImplementationOnce((callback) =>
        callback(new Error("Connection failed")),
      );

      await assert.rejects(async () => await snowflake.connect(), {
        message: "Connection failed",
      });
    });

    it("should handle query execution errors", async () => {
      await snowflake.connect();

      // Mock execution failure
      mockConnection.execute.mock.mockImplementationOnce((options) => {
        process.nextTick(() => options.complete(new Error("Query failed")));
        return mockStatement;
      });

      await assert.rejects(async () => await snowflake.execute("SELECT * FROM test"), {
        message: "Query failed",
      });
    });
  });

  describe("Connection Lifecycle", () => {
    it("should connect, execute queries, and destroy the connection", async () => {
      await snowflake.connect();
      await snowflake.execute("SELECT * FROM test");
      await snowflake.destroy();

      assert.ok(mockConnection.connect.mock.callCount() > 0);
      assert.ok(mockConnection.execute.mock.callCount() > 0);
      assert.ok(mockConnection.destroy.mock.callCount() > 0);
    });
  });
});
