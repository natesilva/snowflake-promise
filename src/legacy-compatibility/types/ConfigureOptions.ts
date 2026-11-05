export interface ConfigureOptions {
  /**
   * If true, don’t fail the connection if OCSP validation doesn’t provide a valid
   * response. OCSP is disabled by default in snowflake-sdk 3.x and is deprecated
   * there; setting this option enables OCSP checking.
   */
  ocspFailOpen?: boolean;
}
