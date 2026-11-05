import { Readable } from "node:stream";
import { type Mock, mock } from "node:test";

type AnyMock = Mock<(...args: any[]) => any>;

// Create a mock Readable stream
class MockReadable extends Readable {
  constructor() {
    super({ objectMode: true });
  }

  /* node:coverage ignore next 3 */
  _read() {
    // Implementation not needed for the mock
  }
}

// Mock connection object
const mockConnection: Record<string, AnyMock> = {
  connect: mock.fn((callback) => callback(null)),
  connectAsync: mock.fn((callback) => callback(null)),
  destroy: mock.fn((callback) => callback(null)),
  execute: mock.fn(),
  getId: mock.fn(() => "mock-connection-id"),
};

// Mock statement object
const mockStatement: Record<string, AnyMock> = {
  cancel: mock.fn((callback) => callback(null)),
  execute: mock.fn(),
  getSqlText: mock.fn(() => "mock-sql-text"),
  getStatus: mock.fn(() => "SUCCEEDED"),
  getColumns: mock.fn(() => [{ name: "COLUMN1", type: "TEXT" }]),
  getColumn: mock.fn(() => ({ name: "COLUMN1", type: "TEXT" })),
  getNumRows: mock.fn(() => 10),
  getNumUpdatedRows: mock.fn(() => 5),
  getSessionState: mock.fn(() => ({
    getCurrentDatabase: () => "MOCK_DB",
    getCurrentSchema: () => "MOCK_SCHEMA",
  })),
  getRequestId: mock.fn(() => "mock-request-id"),
  getStatementId: mock.fn(() => "mock-statement-id"),
  getQueryId: mock.fn(() => "mock-statement-id"),
  streamRows: mock.fn(() => {
    const stream = new MockReadable();

    // Simulate emitting data in the next tick
    process.nextTick(() => {
      for (let i = 0; i < 5; i++) {
        stream.push({ COLUMN1: `data-${i}` });
      }
      stream.push(null); // End the stream
    });

    return stream;
  }),
};

// Create the mock SDK
const mockSdk: Record<string, AnyMock> = {
  configure: mock.fn(),
  createConnection: mock.fn(() => mockConnection),
};

// Export the mock objects so tests can access and configure them
export { mockConnection, mockSdk, mockStatement };

// Export a function to reset all mocks
export function resetMocks() {
  for (const fn of [
    ...Object.values(mockConnection),
    ...Object.values(mockStatement),
    ...Object.values(mockSdk),
  ]) {
    fn.mock.resetCalls();
  }

  // Reset mockConnection execute to return a new statement each time
  mockConnection.execute.mock.mockImplementation((options) => {
    // Store the options on the statement for verification
    const stmt = { ...mockStatement, options };

    // Call the complete callback if provided
    if (options.complete) {
      const rows = [{ COLUMN1: "mock-data" }];
      process.nextTick(() => options.complete(null, stmt, rows));
    }

    return stmt;
  });
}

// Default export for mock.module
export default mockSdk;
