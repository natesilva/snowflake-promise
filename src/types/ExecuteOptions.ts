export type FetchAsStringTypes = 'String' | 'Boolean' | 'Number' | 'Date' | 'JSON';

export interface ExecuteOptions {
  sqlText: string;
  binds?: any[];
  streamResult?: boolean;
  fetchAsString?: FetchAsStringTypes[];
  // note: the complete callback is not exposed; our Promise wrapper uses it internally
}
