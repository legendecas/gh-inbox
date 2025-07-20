import { test } from "node:test";
import { equal, deepEqual } from "node:assert/strict";
import { formatReasons, parseReasonsString } from "./thread.ts";

test("should format reasons", (t) => {
  t.test("empty reasons", () => {
    const result = formatReasons([]);
    equal(result, "");
  });

  t.test("single reason", () => {
    const result = formatReasons(["reason1"]);
    equal(result, "|reason1|");
  });

  t.test("multiple reasons", () => {
    const result = formatReasons(["reason1", "reason2", "reason3"]);
    equal(result, "|reason1|reason2|reason3|");
  });
});

test("should parse reasons string", (t) => {
  t.test("empty string", () => {
    const result = parseReasonsString("");
    deepEqual(result, []);
  });

  t.test("single reason string", () => {
    const result = parseReasonsString("|reason1|");
    deepEqual(result, ["reason1"]);
  });

  t.test("multiple reasons string", () => {
    const result = parseReasonsString("|reason1|reason2|reason3|");
    deepEqual(result, ["reason1", "reason2", "reason3"]);
  });
});
