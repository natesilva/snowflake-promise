import { SnowflakeError } from './SnowflakeError';

export class StatementStreamingModeMismatchError extends SnowflakeError {
  constructor(message) {
    super(
      message ||
      'mismatch: attempted non-streaming operation on a streaming-mode Statement, or ' +
      'attempted streaming operation on non-streaming-mode Statement'
    );
  }
}
