import { describe, it, expect, vi } from "vitest";
import { promisifyOrNot } from "./promisify-or-not.js";

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
      const callback = vi.fn();

      wrappedFn("test", callback);

      expect(callback).toHaveBeenCalledWith(null, "Result: test");
    });

    it("should propagate errors when using callback", () => {
      const wrappedFn = promisifyOrNot(exampleFunction);
      const callback = vi.fn();

      wrappedFn("error", callback);

      expect(callback).toHaveBeenCalledWith(expect.any(Error), "");
      const error = callback.mock.calls[0][0];
      expect(error.message).toBe("Test error");
    });

    it("should work with multiple arguments", () => {
      const wrappedFn = promisifyOrNot(multiArgFunction);
      const callback = vi.fn();

      wrappedFn("hello", 42, true, callback);

      expect(callback).toHaveBeenCalledWith(null, "hello-42-true");
    });

    it("should preserve 'this' context", () => {
      const originalFn = vi.fn(contextFunction);
      const wrappedFn = promisifyOrNot(originalFn);
      const callback = vi.fn();
      const context = { prefix: "Prefix" };

      wrappedFn.call(context, "test", callback);

      expect(originalFn).toHaveBeenCalledWith("test", expect.any(Function));
      expect(callback).toHaveBeenCalledWith(null, "Prefix: test");
    });
  });

  describe("promise approach", () => {
    it("should return a promise that resolves with correct result", async () => {
      const wrappedFn = promisifyOrNot(exampleFunction);

      const result = await wrappedFn("test");

      expect(result).toBe("Result: test");
    });

    it("should return a promise that rejects on error", async () => {
      const wrappedFn = promisifyOrNot(exampleFunction);

      await expect(wrappedFn("error")).rejects.toThrow("Test error");
    });

    it("should work with multiple arguments", async () => {
      const wrappedFn = promisifyOrNot(multiArgFunction);

      const result = await wrappedFn("hello", 42, true);

      expect(result).toBe("hello-42-true");
    });

    it("should preserve 'this' context", async () => {
      const originalFn = vi.fn(contextFunction);
      const wrappedFn = promisifyOrNot(originalFn);
      const context = { prefix: "Prefix" };

      const result = await wrappedFn.call(context, "test");

      expect(originalFn).toHaveBeenCalledWith("test", expect.any(Function));
      expect(result).toBe("Prefix: test");
    });
  });

  describe("edge cases", () => {
    it("should handle functions with no arguments except callback", () => {
      function noArgsFunction(callback: (error: Error | null, result: string) => void) {
        callback(null, "no args result");
      }

      const wrappedFn = promisifyOrNot(noArgsFunction);
      const callback = vi.fn();

      // Test with callback
      wrappedFn(callback);
      expect(callback).toHaveBeenCalledWith(null, "no args result");

      // Test with promise
      return expect(wrappedFn()).resolves.toBe("no args result");
    });

    it("should handle async functions that use callbacks", async () => {
      async function asyncFunction(
        value: string,
        callback: (error: Error | null, result: string) => void,
      ) {
        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 10));
        callback(null, `Async: ${value}`);
      }

      const wrappedFn = promisifyOrNot(asyncFunction);
      const callback = vi.fn();

      // Test with callback
      await wrappedFn("test", callback);
      expect(callback).toHaveBeenCalledWith(null, "Async: test");

      // Test with promise
      const result = await wrappedFn("test");
      expect(result).toBe("Async: test");
    });
  });
});
