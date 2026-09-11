// Units for the one thing the parser learned when the `reviews:` block
// arrived. The rest of its cases are in `tests/frontmatter.test.mjs`, where
// they were written and where they stay: a unit belongs beside the code it
// tests and moving somebody else's file is somebody else's diff.
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatter } from "./frontmatter.mjs";

test("a sub key may carry a slash, and a top level key may not", () => {
  const { data } = parseFrontmatter(
    "---\ntraces:\n  requirement: alpha@abc\n" +
      "reviews:\n  requirement/alpha: updated@def by kai: it moved, so this did\n" +
      "  principles: none\n---\n\nbody\n",
  );
  assert.deepEqual(data.traces, { requirement: "alpha@abc" });
  // The case that was dropped in silence: without the slash the key matched
  // nothing, the line was skipped, and the block came back holding only its
  // other entry.
  assert.deepEqual(data.reviews, {
    "requirement/alpha": "updated@def by kai: it moved, so this did",
    principles: "none",
  });
  // A value keeps everything after its first colon, which is why a reason
  // lives in this block and never on the pin.
  assert.equal(
    data.reviews["requirement/alpha"].endsWith("it moved, so this did"),
    true,
  );
  // And the liberty stops at the indent. A top level key with a slash is
  // nothing this tree writes, and reading one would be inventing a shape.
  const { data: top } = parseFrontmatter("---\na/b: one\nc: two\n---\n\n\n");
  assert.equal(top["a/b"], undefined, "a top level slash key was read");
  assert.equal(top.c, "two");
});

test("a sub key may carry a dot, which a case path always does", () => {
  const { data } = parseFrontmatter(
    "---\ncases:\n  requirements/a/acceptance.test.mjs: nothing\n  bin/lib/plans.test.mjs: " +
      "a".repeat(64) +
      "\n---\nbody\n",
  );
  assert.deepEqual(Object.keys(data.cases), [
    "requirements/a/acceptance.test.mjs",
    "bin/lib/plans.test.mjs",
  ]);
});

test("a top level key still carries neither a slash nor a dot", () => {
  // Only sub keys were widened. A top level key with either in it is nothing
  // this tree writes, and a line that is not a key is skipped as it always was.
  const { data } = parseFrontmatter(
    "---\na.b: one\ntraces:\n  parent: none\n---\n",
  );
  assert.equal(data["a.b"], undefined);
  assert.deepEqual(data.traces, { parent: "none" });
});
