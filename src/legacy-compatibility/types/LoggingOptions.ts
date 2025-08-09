import type { LogLevel } from "snowflake-sdk";

export interface LoggingOptions {
  /** optional function to log SQL statements (e.g. console.log) */
  logSql?: (sqlText: string) => void;
  /** turn on SDK-level logging */
  logLevel?: "error" | "warn" | "debug" | "info" | "trace" | "off";
}

export function toSdkLogLevel(logLevel: string): LogLevel {
  return logLevel.toUpperCase() as LogLevel;
}
