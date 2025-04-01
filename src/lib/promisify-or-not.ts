import { promisify } from "node:util";

type Callback<ResultType> = (error: Error | null, result: ResultType) => void;

/**
 * Given a function that takes a callback as its last argument, return a wrapper that
 * can be called using either a Promise or a callback.
 *
 * @param fn The function to promisify.
 * @returns A function that can be called using either a Promise or a callback.
 */
export function promisifyOrNot<Args extends unknown[], ResultType>(
  original: (...args: [...Args, Callback<ResultType>]) => unknown,
) {
  const promisified = promisify(original) as (...args: Args) => Promise<ResultType>;

  return function (this: unknown, ...args: [...Args] | [...Args, Callback<ResultType>]) {
    const lastArg = args.at(-1);

    if (typeof lastArg === "function") {
      return original.apply(this, args as [...Args, Callback<ResultType>]);
    }

    return promisified.apply(this, args as Args);
  };
}
