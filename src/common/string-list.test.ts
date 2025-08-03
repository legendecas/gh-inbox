import { deepEqual, equal } from "node:assert/strict";
import { test } from "node:test";

import { formatStringList, parseStringListStr } from "./string-list.ts";

test("should format string list", (t) => {
  t.test("empty list", () => {
    const result = formatStringList([]);
    equal(result, "");
  });

  t.test("single item", () => {
    const result = formatStringList(["item1"]);
    equal(result, "|item1|");
  });

  t.test("multiple items", () => {
    const result = formatStringList(["item1", "item2", "item3"]);
    equal(result, "|item1|item2|item3|");
  });
});

test("should parse list string", (t) => {
  t.test("empty string", () => {
    const result = parseStringListStr("");
    deepEqual(result, []);
  });

  t.test("single item string", () => {
    const result = parseStringListStr("|item1|");
    deepEqual(result, ["item1"]);
  });

  t.test("multiple items string", () => {
    const result = parseStringListStr("|item1|item2|item3|");
    deepEqual(result, ["item1", "item2", "item3"]);
  });
});
