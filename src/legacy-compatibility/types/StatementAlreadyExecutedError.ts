import { SnowflakeError } from "./SnowflakeError.js";

export class StatementAlreadyExecutedError extends SnowflakeError {
  constructor() {
    super("Statement already executed - it cannot be executed again");
  }
}
