import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConnectionOptions, Snowflake } from "../index.js";
import { mockConnection, mockSdk, resetMocks } from "./mocks/snowflake-sdk.mock.js";

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

describe("Snowflake", () => {
  // Sample connection options for testing
  const connectionOptions: ConnectionOptions = {
    account: "test-account",
    username: "test-user",
    password: "test-password",
  };

  beforeEach(() => {
    resetMocks();
  });

  describe("constructor", () => {
    it("should create a connection with the provided options", () => {
      const snowflake_ = new Snowflake(connectionOptions);
      expect(mockSdk.createConnection).toHaveBeenCalledWith(connectionOptions);
    });

    it("should configure SDK with logLevel if provided", () => {
      const snowflake_ = new Snowflake(connectionOptions, { logLevel: "debug" });
      expect(mockSdk.configure).toHaveBeenCalledWith({
        logLevel: expect.toBeOneOf(["debug", "DEBUG"]),
      });
    });

    it("should handle configureOptions if provided as an object", () => {
      const configureOptions = { ocspFailOpen: true };
      const snowflake_ = new Snowflake(connectionOptions, {}, configureOptions);
      expect(mockSdk.configure).toHaveBeenCalledWith(configureOptions);
    });

    it("should warn but not fail if configureOptions is provided as a boolean", () => {
      // Mock console.warn
      const originalWarn = console.warn;
      console.warn = vi.fn();

      const snowflake_ = new Snowflake(connectionOptions, {}, true);

      expect(console.warn).toHaveBeenCalled();

      // Restore console.warn
      console.warn = originalWarn;
    });
  });

  describe("id", () => {
    it("should return the connection id", () => {
      const snowflake = new Snowflake(connectionOptions);
      expect(snowflake.id).toBe("mock-connection-id");
      expect(mockConnection.getId).toHaveBeenCalled();
    });
  });

  describe("connect", () => {
    it("should establish a connection", async () => {
      const snowflake = new Snowflake(connectionOptions);
      await snowflake.connect();
      expect(mockConnection.connect).toHaveBeenCalled();
    });

    it("should reject if connection fails", async () => {
      // Mock connection failure
      mockConnection.connect.mockImplementationOnce((callback) =>
        callback(new Error("Connection failed")),
      );

      const snowflake = new Snowflake(connectionOptions);
      await expect(snowflake.connect()).rejects.toThrow("Connection failed");
    });
  });

  describe("connectAsync", () => {
    it("should establish a connection asynchronously", async () => {
      const snowflake = new Snowflake(connectionOptions);
      await snowflake.connectAsync();
      expect(mockConnection.connectAsync).toHaveBeenCalled();
    });

    it("should reject if connection fails", async () => {
      // Mock connection failure
      mockConnection.connectAsync.mockImplementationOnce((callback) =>
        callback(new Error("Connection failed")),
      );

      const snowflake = new Snowflake(connectionOptions);
      await expect(snowflake.connectAsync()).rejects.toThrow("Connection failed");
    });
  });

  describe("destroy", () => {
    it("should terminate the connection", async () => {
      const snowflake = new Snowflake(connectionOptions);
      await snowflake.destroy();
      expect(mockConnection.destroy).toHaveBeenCalled();
    });

    it("should reject if destroy fails", async () => {
      // Mock destroy failure
      mockConnection.destroy.mockImplementationOnce((callback) =>
        callback(new Error("Destroy failed")),
      );

      const snowflake = new Snowflake(connectionOptions);
      await expect(snowflake.destroy()).rejects.toThrow("Destroy failed");
    });
  });

  describe("createStatement", () => {
    it("should create a Statement with the provided options", () => {
      const snowflake = new Snowflake(connectionOptions);
      const options = { sqlText: "SELECT * FROM test" };
      const statement = snowflake.createStatement(options);

      // Verify the statement was created with the right parameters
      expect(statement).toBeDefined();
    });
  });

  describe("execute", () => {
    it("should execute a SQL statement and return rows", async () => {
      const snowflake = new Snowflake(connectionOptions);
      const sqlText = "SELECT * FROM test";
      const binds = ["param1"];

      const rows = await snowflake.execute(sqlText, binds);

      // Verify the statement was created and executed with the right parameters
      expect(mockConnection.execute).toHaveBeenCalled();
      const executeCall = mockConnection.execute.mock.calls[0][0];
      expect(executeCall.sqlText).toBe(sqlText);
      expect(executeCall.binds).toBe(binds);

      // Verify rows were returned
      expect(rows).toEqual([{ COLUMN1: "mock-data" }]);
    });
  });
});
