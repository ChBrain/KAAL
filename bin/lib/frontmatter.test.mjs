// Units for the parser. The first three arrived with the parser and lived in
// the tester's tree over the developer's code until item 2 of `plan/0.0.2.md`
// brought them here; the rest are what it learned when the `reviews:` block
// arrived. The header here used to say the first three stayed where they were
// written, because moving somebody else's file was somebody else's diff. The
// suites are shared now and it is one diff.
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

test("parses key: value lines, unquoted and double quoted, and returns the body", () => {
  const { data, body } = parseFrontmatter(
    '---\nname: x\ndescription: "a b"\nlicense: MIT\n---\n\n# X\n',
  );
  assert.deepEqual(data, { name: "x", description: "a b", license: "MIT" });
  assert.equal(body.trim(), "# X");
});

test("throws on text with no frontmatter fences", () => {
  assert.throws(() => parseFrontmatter("# no fences\n"), /frontmatter/);
});

test("reads one level of map under a key with no value, and keeps an empty value empty", () => {
  const { data } = parseFrontmatter(
    '---\nname: x\nmetadata:\n  author: k\n  version: "1"\nwhy:\nlicense: MIT\n---\n',
  );
  assert.deepEqual(data.metadata, { author: "k", version: "1" });
  assert.equal(data.why, "");
  assert.equal(data.license, "MIT");
});
