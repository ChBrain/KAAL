// Contract tests for the drawing eval-runner. One per seam. Blind to the
// code: the tool as a command on a fixture root and on a copy of it.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  existsSync,
  mkdtempSync,
  cpSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const TREE = join(HERE, "fixtures", "tree");
const kaal = (args, cwd = ROOT) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd,
    encoding: "utf8",
  });
// A fenced block closes at a line of exactly its opening fence, so a fence
// inside the block (a skill's own example) does not end it.
const blocks = (doc) =>
  [...doc.matchAll(/^(`{3,})[^\n]*\n([\s\S]*?)^\1[ \t]*$/gm)].map((m) => m[2]);

test("1. tree to document: skill, then each reference after its name, then the ask; the items, then Output", () => {
  const r = kaal(["runner", "y", "f"], TREE);
  assert.equal(r.status, 0, r.stderr);
  const b = blocks(r.stdout);
  assert.equal(b.length, 3);
  const skill = b[0].indexOf("# y");
  const ref = b[0].indexOf("references/r.md");
  const refText = b[0].indexOf("The reference text.");
  const ask = b[0].indexOf("Do the thing.");
  assert.ok(
    skill >= 0 && skill < ref && ref < refText && refText < ask,
    "block one is out of order",
  );
  assert.ok(b[0].trimEnd().endsWith("Do the thing."));
  assert.ok(
    b[1].includes("- Does the thing.") && b[1].includes("- Says nothing else."),
  );
  assert.ok(b[1].trimEnd().endsWith("Output:"));
  assert.match(b[2], /^fixture: f$/m);
});

test("2. document to file: write then check passes; a changed or missing file is stale", () => {
  const tmp = mkdtempSync(join(tmpdir(), "kaal-runner-"));
  try {
    cpSync(TREE, tmp, { recursive: true });
    const file = join(tmp, "skills", "y", "fixtures", "f", "RUNNER.md");
    const missing = kaal(["runner", "y", "f", "--check"], tmp);
    assert.equal(missing.status, 1);
    assert.match(missing.stderr, /stale|missing/i);
    assert.equal(kaal(["runner", "y", "f", "--write"], tmp).status, 0);
    assert.ok(existsSync(file));
    assert.equal(
      readFileSync(file, "utf8"),
      kaal(["runner", "y", "f"], tmp).stdout,
    );
    assert.equal(kaal(["runner", "y", "f", "--check"], tmp).status, 0);
    writeFileSync(
      file,
      readFileSync(file, "utf8").replace(
        "Do the thing.",
        "Do the other thing.",
      ),
    );
    const c = kaal(["runner", "y", "f", "--check"], tmp);
    assert.equal(c.status, 1);
    assert.match(c.stderr, /stale/i);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("3. generated text to walls: no dash characters, and the first line says generated", () => {
  const r = kaal(["runner", "analyse", "json-flag"]);
  assert.equal(r.status, 0, r.stderr);
  assert.doesNotMatch(r.stdout, /[–—]/);
  assert.match(r.stdout.split("\n")[0], /generated/i);
});
