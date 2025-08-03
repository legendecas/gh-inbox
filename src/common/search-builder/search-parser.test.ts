import { test } from "node:test";
import { strict as assert } from "node:assert";
import { SearchParser } from "./search-parser.ts";

test("SearchParser", () => {
  test("parses search string into key-value pairs", () => {
    const parser = new SearchParser();
    const result = parser.parse('author:"John Doe" repo:my-repo');
    assert.deepEqual(result, {
      author: ["John Doe"],
      repo: ["my-repo"],
    });
  });

  test("parse strings with emojis", () => {
    const parser = new SearchParser();
    const result = parser.parse('emoji:"😀, 😃"');
    assert.deepEqual(result, {
      emoji: ["😀", "😃"],
    });
  });
});
