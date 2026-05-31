import { strict as assert } from "node:assert";
import { test } from "node:test";

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

  test("captures remaining text as $keyword", () => {
    const parser = new SearchParser();
    const result = parser.parse("state:open docs foobar");
    assert.deepEqual(result, {
      state: ["open"],
      $keyword: ["docs foobar"],
    });
  });

  test("plain text without any filter keys becomes $keyword", () => {
    const parser = new SearchParser();
    const result = parser.parse("just some keywords");
    assert.deepEqual(result, {
      $keyword: ["just some keywords"],
    });
  });

  test("no keyword when input is only filter keys", () => {
    const parser = new SearchParser();
    const result = parser.parse("state:open unread:true");
    assert.deepEqual(result, {
      state: ["open"],
      unread: ["true"],
    });
  });

  test("colon in unquoted value is consumed as filter key:value, not keyword", () => {
    // The regex consumes "docs:foobar" as key=docs, value=foobar.
    // This is expected — filter keys win over keyword text.
    const parser = new SearchParser();
    const result = parser.parse("docs:foobar");
    assert.deepEqual(result, {
      docs: ["foobar"],
    });
  });
});
