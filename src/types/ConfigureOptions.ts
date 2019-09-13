export interface ConfigureOptions {
  /**
   * If true, don’t fail the connection if OCSP validation doesn’t provide a valid
   * response. (Default: true)
   */
  ocspFailOpen?: boolean;
}
