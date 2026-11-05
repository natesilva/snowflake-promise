import { SnowflakeError } from "./SnowflakeError.ts";

export class StatementNotCompleteError extends SnowflakeError {
  constructor() {
    super("Statement has not finished executing - await the execute() method");
  }
}
