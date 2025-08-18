import { strict as assert } from "node:assert";
import { test } from "node:test";

import { getSubjectPathnameEssence } from "./github-utils.ts";

test("getSubjectPathnameEssence", (t) => {
  t.test("should return null for invalid URL", () => {
    const result = getSubjectPathnameEssence("https://example.com/invalid/url");
    assert.strictEqual(result, null);
  });

  t.test("should extract essence from valid issue URL", () => {
    const url = "https://api.github.com/repos/nodejs/node-gyp/issues/3095";
    const result = getSubjectPathnameEssence(url);
    assert.deepStrictEqual(result, {
      pathname: "/repos/nodejs/node-gyp/issues/3095",
      owner: "nodejs",
      repoName: "node-gyp",
      type: "issues",
      number: 3095,
    });
  });

  t.test(
    "should extract essence from valid issue URL from an enterprise endpoint",
    () => {
      const url =
        "https://enterprise.github.com/api/v3/repos/nodejs/node-gyp/issues/3095";
      const result = getSubjectPathnameEssence(url);
      assert.deepStrictEqual(result, {
        pathname: "/repos/nodejs/node-gyp/issues/3095",
        owner: "nodejs",
        repoName: "node-gyp",
        type: "issues",
        number: 3095,
      });
    },
  );
});
