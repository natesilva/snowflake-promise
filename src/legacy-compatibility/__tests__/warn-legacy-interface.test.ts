import { describe, expect, it, vi } from "vitest";
import { warnLegacyInterface } from "../warn-legacy-interface.ts";

describe("warnLegacyInterface", () => {
  it("emits a DeprecationWarning only once", () => {
    const emitWarning = vi.spyOn(process, "emitWarning").mockImplementation(() => {});

    warnLegacyInterface();
    warnLegacyInterface();

    expect(emitWarning).toHaveBeenCalledTimes(1);
    expect(emitWarning).toHaveBeenCalledWith(
      expect.stringContaining("legacy compatibility interface"),
      "DeprecationWarning",
      "SNOWFLAKE_PROMISE_LEGACY",
      expect.any(Function),
    );
  });
});
