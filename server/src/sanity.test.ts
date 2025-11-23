// server/src/sanity.test.ts
import assert from "node:assert";
import { test } from "node:test";

test("sanity check", () => {
  assert.strictEqual(1 + 1, 2);
});
