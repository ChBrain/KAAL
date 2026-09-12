import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { ordinal, claimed, filed } from "./name.mjs";

const script = fileURLToPath(new URL("./name.mjs", import.meta.url));
const run = (...a) => spawnSync("node", [script, ...a], { encoding: "utf8" });

const tree = (files, fn) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-retro-name-"));
  try {
    for (const [rel, text] of Object.entries(files)) {
      const p = join(root, ...rel.split("/"));
      mkdirSync(join(p, ".."), { recursive: true });
      writeFileSync(p, text ?? "");
    }
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};
const retro = (date, skill, word) => `retros/${date}-${skill}-${word}-use.md`;

test("the ordinals are the words the tree already uses", () => {
  // Every boundary the two tables meet at. The tens alone are their own word
  // and not the tens before a ones word: twentieth, then twenty-first.
  assert.equal(ordinal(1), "first");
  assert.equal(ordinal(19), "nineteenth");
  assert.equal(ordinal(20), "twentieth");
  assert.equal(ordinal(21), "twenty-first");
  assert.equal(ordinal(50), "fiftieth");
  assert.equal(ordinal(77), "seventy-seventh");
  assert.equal(ordinal(99), "ninety-ninth");
  // And what it cannot name it does not guess at.
  for (const n of [0, 100, -1, 1.5, NaN]) assert.equal(ordinal(n), null);
});

test("a filename is read for the skill it names and not another", () => {
  assert.equal(claimed("2026-09-12-code-seventy-seventh-use.md", "code"), 77);
  assert.equal(claimed("2026-09-04-analyse-first-use.md", "analyse"), 1);
  // `retro-4ls` files retros too, and `code` must not read one of them.
  assert.equal(claimed("2026-09-12-retro-4ls-first-use.md", "code"), null);
  // A name that is not this shape at all, and a word that is not an ordinal.
  assert.equal(claimed("README.md", "code"), null);
  assert.equal(claimed("2026-09-12-code-umpteenth-use.md", "code"), null);
  // The skill name is the whole field between the date and the ordinal, not
  // a piece of a longer one. Read loosely, a retro filed against `no-code`
  // would be counted as a use of `code` and the next number would skip.
  assert.equal(claimed("2026-09-12-no-code-first-use.md", "code"), null);
  assert.equal(claimed("2026-09-12-codex-first-use.md", "code"), null);
  // And the shape is a dated markdown page, so an editor's leftover beside
  // one is not a use that happened.
  assert.equal(claimed("2026-09-12-code-first-use.md.bak", "code"), null);
  assert.equal(claimed("code-first-use.md", "code"), null);
});

test("a use is counted wherever it was filed", () => {
  // A consumed retro moves to `retros/archive/` and it is still a use that
  // happened: the archive says what a requirement has read, never what was
  // done. Counting only the live directory would hand out a number that is
  // already taken the first time a stack is consumed.
  tree(
    {
      [retro("2026-09-04", "code", "first")]: "",
      ["retros/archive/2026-09-05-code-second-use.md"]: "",
      ["retros/archive/2026-09-05-analyse-first-use.md"]: "",
    },
    (root) => {
      assert.deepEqual(filed(root, "code").sort(), [1, 2]);
      assert.deepEqual(filed(root, "analyse"), [1]);
      assert.deepEqual(filed(root, "test"), []);
    },
  );
});

test("the next name is past the highest and never the count", () => {
  // The defect this exists for: this league holds two retros both claiming
  // the fiftieth use of the code skill. A script that answered the count
  // would hand out the number below the highest and file a third page that
  // claims one somebody else already has.
  tree(
    {
      [retro("2026-09-08", "code", "first")]: "",
      [retro("2026-09-09", "code", "first")]: "",
      [retro("2026-09-10", "code", "fourth")]: "",
    },
    (root) => {
      assert.deepEqual(filed(root, "code").sort(), [1, 1, 4]);
      const r = run("code", root);
      assert.equal(r.status, 0, r.stderr);
      const [file, word] = r.stdout.trim().split("\n");
      assert.equal(word, "fifth");
      assert.match(file, /-code-fifth-use\.md$/);
    },
  );
});

test("a tree with no retros starts at the first", () => {
  tree({ "kaal.config.json": "{}" }, (root) => {
    const r = run("code", root);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.stdout.trim().split("\n")[1], "first");
  });
});

test("the answer is a path and its word, in that order, on two lines", () => {
  // Both come from one computation, so the page and the `Period:` line inside
  // it cannot disagree, which is how a retro claimed a number its filename
  // did not.
  tree({ [retro("2026-09-04", "code", "first")]: "" }, (root) => {
    const out = run("code", root).stdout.trim().split("\n");
    assert.equal(out.length, 2);
    assert.match(out[0], /^retros\/\d{4}-\d{2}-\d{2}-code-second-use\.md$/);
    assert.equal(out[1], "second");
    assert.ok(out[0].includes(out[1]), "the path and the word disagree");
  });
});

test("a missing or malformed skill exits 1 and says how to call it", () => {
  for (const a of [[], [""], ["Code"], ["../x"]]) {
    const r = run(...a);
    assert.equal(r.status, 1, `${JSON.stringify(a)} was accepted`);
    assert.match(r.stderr, /usage: name\.mjs/);
  }
});
