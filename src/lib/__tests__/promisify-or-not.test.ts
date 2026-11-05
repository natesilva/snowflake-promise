import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { promisifyOrNot } from "../promisify-or-not.ts";

describe("promisifyOrNot", () => {
  // Helper function that takes a callback as its last argument
  function exampleFunction(
    value: string,
    callback: (error: Error | null, result: string) => void,
  ) {
    if (value === "error") {
      callback(new Error("Test error"), "");
    } else {
      callback(null, `Result: ${value}`);
    }
  }

  // Helper function that takes multiple arguments and a callback
  function multiArgFunction(
    arg1: string,
    arg2: number,
    arg3: boolean,
    callback: (error: Error | null, result: string) => void,
  ) {
    callback(null, `${arg1}-${arg2}-${arg3}`);
  }

  // Helper function to test 'this' context
  function contextFunction(
    // https://www.typescriptlang.org/docs/handbook/2/classes.html#this-parameters
    this: { prefix: string },
    value: string,
    callback: (error: Error | null, result: string) => void,
  ) {
    callback(null, `${this.prefix}: ${value}`);
  }

  describe("callback approach", () => {
    it("should work with callback and return correct result", () => {
      const wrappedFn = promisifyOrNot(exampleFunction);
      const callback = mock.fn();

      wrappedFn("test", callback);

      assert.deepEqual(callback.mock.calls[0]?.arguments, [null, "Result: test"]);
    });

    it("should propagate errors when using callback", () => {
      const wrappedFn = promisifyOrNot(exampleFunction);
      const callback = mock.fn();

      wrappedFn("error", callback);

      const [error, result] = callback.mock.calls[0]?.arguments ?? [];
      assert.ok(error instanceof Error);
      assert.equal(error.message, "Test error");
      assert.equal(result, "");
    });

    it("should work with multiple arguments", () => {
      const wrappedFn = promisifyOrNot(multiArgFunction);
      const callback = mock.fn();

      wrappedFn("hello", 42, true, callback);

      assert.deepEqual(callback.mock.calls[0]?.arguments, [null, "hello-42-true"]);
    });

    it("should preserve 'this' context", () => {
      const originalFn = mock.fn(contextFunction);
      const wrappedFn = promisifyOrNot(originalFn);
      const callback = mock.fn();
      const context = { prefix: "Prefix" };

      wrappedFn.call(context, "test", callback);

      const [value, callbackArg] = originalFn.mock.calls[0]?.arguments ?? [];
      assert.equal(value, "test");
      assert.equal(typeof callbackArg, "function");
      assert.deepEqual(callback.mock.calls[0]?.arguments, [null, "Prefix: test"]);
    });
  });

  describe("promise approach", () => {
    it("should return a promise that resolves with correct result", async () => {
      const wrappedFn = promisifyOrNot(exampleFunction);

      const result = await wrappedFn("test");

      assert.equal(result, "Result: test");
    });

    it("should return a promise that rejects on error", async () => {
      const wrappedFn = promisifyOrNot(exampleFunction);

      await assert.rejects(async () => await wrappedFn("error"), {
        message: "Test error",
      });
    });

    it("should work with multiple arguments", async () => {
      const wrappedFn = promisifyOrNot(multiArgFunction);

      const result = await wrappedFn("hello", 42, true);

      assert.equal(result, "hello-42-true");
    });

    it("should preserve 'this' context", async () => {
      const originalFn = mock.fn(contextFunction);
      const wrappedFn = promisifyOrNot(originalFn);
      const context = { prefix: "Prefix" };

      const result = await wrappedFn.call(context, "test");

      const [value, callbackArg] = originalFn.mock.calls[0]?.arguments ?? [];
      assert.equal(value, "test");
      assert.equal(typeof callbackArg, "function");
      assert.equal(result, "Prefix: test");
    });
  });

  describe("edge cases", () => {
    it("should handle functions with no arguments except callback", async () => {
      function noArgsFunction(callback: (error: Error | null, result: string) => void) {
        callback(null, "no args result");
      }

      const wrappedFn = promisifyOrNot(noArgsFunction);
      const callback = mock.fn();

      // Test with callback
      wrappedFn(callback);
      assert.deepEqual(callback.mock.calls[0]?.arguments, [null, "no args result"]);

      // Test with promise
      assert.equal(await wrappedFn(), "no args result");
    });

    it("should handle async functions that use callbacks", async (t) => {
      t.mock.method(process, "emitWarning", () => {});

      async function asyncFunction(
        value: string,
        callback: (error: Error | null, result: string) => void,
      ) {
        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 10));
        callback(null, `Async: ${value}`);
      }

      const wrappedFn = promisifyOrNot(asyncFunction);
      const callback = mock.fn();

      // Test with callback
      await wrappedFn("test", callback);
      assert.deepEqual(callback.mock.calls[0]?.arguments, [null, "Async: test"]);

      // Test with promise
      const result = await wrappedFn("test");
      assert.equal(result, "Async: test");
    });
  });
});
