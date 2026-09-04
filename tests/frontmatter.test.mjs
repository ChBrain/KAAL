import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatter } from "../bin/lib/frontmatter.mjs";

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
