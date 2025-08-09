import { SnowflakeError } from "./SnowflakeError.ts";

export class StatementAlreadyExecutedError extends SnowflakeError {
  constructor() {
    super("Statement already executed - it cannot be executed again");
  }
}
