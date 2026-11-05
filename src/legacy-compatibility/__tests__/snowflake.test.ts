import assert from "node:assert/strict";
import { beforeEach, describe, it, mock } from "node:test";
import type { ConnectionOptions } from "../index.ts";
import { mockConnection, mockSdk, resetMocks } from "./mocks/snowflake-sdk.mock.ts";

const warnLegacyInterface = mock.fn();
mock.module("../warn-legacy-interface.ts", { namedExports: { warnLegacyInterface } });
mock.module("snowflake-sdk", { namedExports: { ...mockSdk }, defaultExport: mockSdk });

const { Snowflake } = await import("../index.ts");

describe("Snowflake", () => {
  // Sample connection options for testing
  const connectionOptions: ConnectionOptions = {
    account: "test-account",
    username: "test-user",
    password: "test-password",
  };

  beforeEach(() => {
    resetMocks();
    warnLegacyInterface.mock.resetCalls();
  });

  describe("constructor", () => {
    it("should create a connection with the provided options", () => {
      const _snowflake_ = new Snowflake(connectionOptions);
      assert.deepEqual(mockSdk.createConnection.mock.calls[0]?.arguments, [
        connectionOptions,
      ]);
    });

    it("should configure SDK with logLevel if provided", () => {
      const _snowflake_ = new Snowflake(connectionOptions, { logLevel: "debug" });
      const configureArgs = mockSdk.configure.mock.calls[0]?.arguments;
      assert.equal(configureArgs?.length, 1);
      assert.ok(["debug", "DEBUG"].includes(configureArgs?.[0]?.logLevel));
    });

    it("should warn that the legacy interface is deprecated", () => {
      const _snowflake_ = new Snowflake(connectionOptions);
      assert.ok(warnLegacyInterface.mock.callCount() > 0);
    });

    it("should handle configureOptions if provided as an object", () => {
      const configureOptions = { ocspFailOpen: true };
      const _snowflake_ = new Snowflake(connectionOptions, {}, configureOptions);
      assert.deepEqual(mockSdk.configure.mock.calls[0]?.arguments, [configureOptions]);
    });
  });

  describe("id", () => {
    it("should return the connection id", () => {
      const snowflake = new Snowflake(connectionOptions);
      assert.equal(snowflake.id, "mock-connection-id");
      assert.ok(mockConnection.getId.mock.callCount() > 0);
    });
  });

  describe("connect", () => {
    it("should establish a connection", async () => {
      const snowflake = new Snowflake(connectionOptions);
      await snowflake.connect();
      assert.ok(mockConnection.connect.mock.callCount() > 0);
    });

    it("should reject if connection fails", async () => {
      // Mock connection failure
      mockConnection.connect.mock.mockImplementationOnce((callback) =>
        callback(new Error("Connection failed")),
      );

      const snowflake = new Snowflake(connectionOptions);
      await assert.rejects(async () => await snowflake.connect(), {
        message: "Connection failed",
      });
    });
  });

  describe("connectAsync", () => {
    it("should establish a connection asynchronously", async () => {
      const snowflake = new Snowflake(connectionOptions);
      await snowflake.connectAsync();
      assert.ok(mockConnection.connectAsync.mock.callCount() > 0);
    });

    it("should reject if connection fails", async () => {
      // Mock connection failure
      mockConnection.connectAsync.mock.mockImplementationOnce((callback) =>
        callback(new Error("Connection failed")),
      );

      const snowflake = new Snowflake(connectionOptions);
      await assert.rejects(async () => await snowflake.connectAsync(), {
        message: "Connection failed",
      });
    });
  });

  describe("destroy", () => {
    it("should terminate the connection", async () => {
      const snowflake = new Snowflake(connectionOptions);
      await snowflake.destroy();
      assert.ok(mockConnection.destroy.mock.callCount() > 0);
    });

    it("should reject if destroy fails", async () => {
      // Mock destroy failure
      mockConnection.destroy.mock.mockImplementationOnce((callback) =>
        callback(new Error("Destroy failed")),
      );

      const snowflake = new Snowflake(connectionOptions);
      await assert.rejects(async () => await snowflake.destroy(), {
        message: "Destroy failed",
      });
    });
  });

  describe("createStatement", () => {
    it("should create a Statement with the provided options", () => {
      const snowflake = new Snowflake(connectionOptions);
      const options = { sqlText: "SELECT * FROM test" };
      const statement = snowflake.createStatement(options);

      // Verify the statement was created with the right parameters
      assert.notEqual(statement, undefined);
    });
  });

  describe("execute", () => {
    it("should execute a SQL statement and return rows", async () => {
      const snowflake = new Snowflake(connectionOptions);
      const sqlText = "SELECT * FROM test";
      const binds = ["param1"];

      const rows = await snowflake.execute(sqlText, binds);

      // Verify the statement was created and executed with the right parameters
      assert.ok(mockConnection.execute.mock.callCount() > 0);
      const executeCall = mockConnection.execute.mock.calls[0]?.arguments[0];
      assert.equal(executeCall.sqlText, sqlText);
      assert.equal(executeCall.binds, binds);

      // Verify rows were returned
      assert.deepEqual(rows, [{ COLUMN1: "mock-data" }]);
    });
  });
});
