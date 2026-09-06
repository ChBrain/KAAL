// Units for the witness: the manifest's two directions and the verdict.
// The command is held by the acceptance and contract tests; these hold the
// pieces, including the cases a command cannot easily be driven into.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { entries, render, parse } from "../bin/lib/witness/manifest.mjs";
import { compare } from "../bin/lib/witness/compare.mjs";

const SHA_ONE = "a".repeat(64);
const SHA_TWO = "b".repeat(64);
const tree = () => {
  const dir = mkdtempSync(join(tmpdir(), "kaal-witness-unit-"));
  mkdirSync(join(dir, "deep", "deeper"), { recursive: true });
  writeFileSync(join(dir, "top.txt"), "top\n");
  // A sibling whose name shares the directory's prefix: "-" sorts before "/",
  // so sorted order and walk order differ whatever readdir returns first.
  writeFileSync(join(dir, "deep-file.txt"), "sibling\n");
  writeFileSync(join(dir, "deep", "mid.txt"), "mid\n");
  writeFileSync(join(dir, "deep", "deeper", "low.txt"), "low\n");
  return dir;
};
const withTree = (fn) => {
  const dir = tree();
  try {
    fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

test("entries walks nested directories and gives paths relative to the root", () => {
  withTree((dir) => {
    assert.deepEqual(
      entries(dir).map((e) => e.path),
      ["deep-file.txt", "deep/deeper/low.txt", "deep/mid.txt", "top.txt"],
    );
    for (const e of entries(dir)) assert.match(e.sha, /^[0-9a-f]{64}$/);
  });
});

test("render of a tree with no files is the empty string, not a blank line", () => {
  const empty = mkdtempSync(join(tmpdir(), "kaal-witness-empty-"));
  try {
    assert.equal(render(empty), "");
    mkdirSync(join(empty, "just-a-directory"));
    assert.equal(render(empty), "", "an empty directory became a line");
  } finally {
    rmSync(empty, { recursive: true, force: true });
  }
});

test("parse reads what render wrote, and tolerates blank lines", () => {
  withTree((dir) => {
    const back = parse(`\n${render(dir)}\n\n`);
    assert.equal(back.size, 4);
    for (const e of entries(dir)) assert.equal(back.get(e.path), e.sha);
  });
});

test("parse names the line that is not a manifest line, and refuses the whole text", () => {
  assert.throws(
    () => parse(`${SHA_ONE}  a.txt\nnot a line\n${SHA_TWO}  b.txt\n`),
    /line 2 is not a manifest line/,
  );
  // A sha of the wrong length is not a sha, and a line with one space is not
  // the format: both are the line's fault and neither is silently skipped.
  assert.throws(() => parse("abc  a.txt\n"), /line 1/);
  assert.throws(() => parse(`${SHA_ONE} a.txt\n`), /line 1/);
});

test("compare names what was added, removed and changed, in path order", () => {
  withTree((dir) => {
    const before = render(dir);
    assert.deepEqual(compare(dir, before), []);
    writeFileSync(join(dir, "deep", "mid.txt"), "mid, edited\n");
    writeFileSync(join(dir, "added.txt"), "new\n");
    rmSync(join(dir, "top.txt"));
    assert.deepEqual(compare(dir, before), [
      { path: "added.txt", verb: "added" },
      { path: "deep/mid.txt", verb: "changed" },
      { path: "top.txt", verb: "removed" },
    ]);
  });
});

test("compare against an empty manifest is every file added", () => {
  withTree((dir) => {
    assert.deepEqual(
      compare(dir, "").map((f) => f.verb),
      ["added", "added", "added", "added"],
    );
  });
});
