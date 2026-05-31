import { strict as assert } from "node:assert";
import { test } from "node:test";

import { FilterBuilder } from "./filter-builder.ts";

test("FilterBuilder", () => {
  test("builds keyword filter — single word", () => {
    const builder = new FilterBuilder();
    const result = builder.fromRecord({ $keyword: ["bug"] }).build();
    assert.deepEqual(result, {
      AND: [{ subject_title: { contains: "bug" } }],
      archived: false,
    });
  });

  test("builds keyword filter — multiple words as AND", () => {
    const builder = new FilterBuilder();
    const result = builder
      .fromRecord({ $keyword: ["session timeout"] })
      .build();
    assert.deepEqual(result, {
      AND: [
        { subject_title: { contains: "session" } },
        { subject_title: { contains: "timeout" } },
      ],
      archived: false,
    });
  });

  test("builds keyword filter — extra whitespace collapsed", () => {
    const builder = new FilterBuilder();
    const result = builder
      .fromRecord({ $keyword: ["  foo   bar   baz  "] })
      .build();
    assert.deepEqual(result, {
      AND: [
        { subject_title: { contains: "foo" } },
        { subject_title: { contains: "bar" } },
        { subject_title: { contains: "baz" } },
      ],
      archived: false,
    });
  });

  test("combines keyword with state filter", () => {
    const builder = new FilterBuilder();
    const result = builder
      .fromRecord({ state: ["open"], $keyword: ["docs"] })
      .build();
    assert.deepEqual(result, {
      AND: [
        { subject: { state: { in: ["open"] } } },
        { subject_title: { contains: "docs" } },
      ],
      archived: false,
    });
  });

  test("combines keyword with type filter", () => {
    const builder = new FilterBuilder();
    const result = builder
      .fromRecord({ type: ["issue", "pull"], $keyword: ["fix"] })
      .build();
    assert.deepEqual(result, {
      AND: [
        {
          OR: [{ subject_type: "Issue" }, { subject_type: "PullRequest" }],
        },
        { subject_title: { contains: "fix" } },
      ],
      archived: false,
    });
  });

  test("filter-only input produces no keyword", () => {
    const builder = new FilterBuilder();
    const result = builder
      .fromRecord({ state: ["open"], unread: ["true"] })
      .build();
    assert.deepEqual(result, {
      AND: [{ subject: { state: { in: ["open"] } } }, { unread: true }],
      archived: false,
    });
  });

  test("archived filter works alongside keyword", () => {
    const builder = new FilterBuilder();
    const result = builder
      .fromRecord({ archived: ["true"], $keyword: ["old"] })
      .build();
    assert.deepEqual(result, {
      AND: [{ subject_title: { contains: "old" } }],
      archived: true,
    });
  });

  test("negative filter works alongside keyword", () => {
    const builder = new FilterBuilder();
    const result = builder
      .fromRecord({ "-bot": ["true"], $keyword: ["crash"] })
      .build();
    assert.deepEqual(result, {
      AND: [
        {
          NOT: {
            OR: [
              {
                subject: {
                  user_login: { endsWith: "[bot]" },
                },
              },
              {
                subject: {
                  user_login: { endsWith: "-bot" },
                },
              },
            ],
          },
        },
        { subject_title: { contains: "crash" } },
      ],
      archived: false,
    });
  });

  test("unknown keys are silently dropped", () => {
    const builder = new FilterBuilder();
    const result = builder
      .fromRecord({ state: ["open"], foobar: ["baz"] })
      .build();
    assert.deepEqual(result, {
      AND: [{ subject: { state: { in: ["open"] } } }],
      archived: false,
    });
  });

  test("empty record produces default filter", () => {
    const builder = new FilterBuilder();
    const result = builder.fromRecord({}).build();
    assert.deepEqual(result, {
      AND: [],
      archived: false,
    });
  });
});
