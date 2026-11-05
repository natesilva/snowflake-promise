import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { warnLegacyInterface } from "../warn-legacy-interface.ts";

describe("warnLegacyInterface", () => {
  it("emits a DeprecationWarning only once", (t) => {
    const emitWarning = t.mock.method(process, "emitWarning", () => {});

    warnLegacyInterface();
    warnLegacyInterface();

    assert.equal(emitWarning.mock.callCount(), 1);
    const args: unknown[] = emitWarning.mock.calls[0]?.arguments ?? [];
    const [message, type, code, ctor] = args;
    assert.ok(String(message).includes("legacy compatibility interface"));
    assert.equal(type, "DeprecationWarning");
    assert.equal(code, "SNOWFLAKE_PROMISE_LEGACY");
    assert.equal(typeof ctor, "function");
  });
});
