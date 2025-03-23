import { vi } from "vitest";
import { Readable } from "stream";

// Create a mock Readable stream
class MockReadable extends Readable {
  constructor() {
    super({ objectMode: true });
  }

  _read() {
    // Implementation not needed for the mock
  }
}

// Mock connection object
const mockConnection = {
  connect: vi.fn((callback) => callback(null)),
  connectAsync: vi.fn((callback) => callback(null)),
  destroy: vi.fn((callback) => callback(null)),
  execute: vi.fn(),
  getId: vi.fn(() => "mock-connection-id"),
};

// Mock statement object
const mockStatement = {
  cancel: vi.fn((callback) => callback(null)),
  execute: vi.fn(),
  getSqlText: vi.fn(() => "mock-sql-text"),
  getStatus: vi.fn(() => "SUCCEEDED"),
  getColumns: vi.fn(() => [{ name: "COLUMN1", type: "TEXT" }]),
  getColumn: vi.fn(() => ({ name: "COLUMN1", type: "TEXT" })),
  getNumRows: vi.fn(() => 10),
  getNumUpdatedRows: vi.fn(() => 5),
  getSessionState: vi.fn(() => ({
    getCurrentDatabase: () => "MOCK_DB",
    getCurrentSchema: () => "MOCK_SCHEMA",
  })),
  getRequestId: vi.fn(() => "mock-request-id"),
  getStatementId: vi.fn(() => "mock-statement-id"),
  streamRows: vi.fn(() => {
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
const mockSdk = {
  configure: vi.fn(),
  createConnection: vi.fn(() => mockConnection),
};

// Export the mock objects so tests can access and configure them
export { mockSdk, mockConnection, mockStatement };

// Export a function to reset all mocks
export function resetMocks() {
  vi.clearAllMocks();

  // Reset mockConnection execute to return a new statement each time
  mockConnection.execute.mockImplementation((options) => {
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

// Default export for vi.mock
export default mockSdk;
