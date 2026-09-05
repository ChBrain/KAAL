// Acceptance tests for requirement gates-v2. One per criterion. Surface
// only: the tool as a command, under a controlled PATH, and a file.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  existsSync,
  mkdtempSync,
  symlinkSync,
  copyFileSync,
  rmSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const INSIDE = process.env.KAAL_GATES === "1";
const kaal = (args, opts = {}) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
    ...opts,
  });

// A PATH with node and nothing else. On Windows the file must be node.exe
// and a symlink may need a privilege, so a copy is the fallback.
const nodeOnly = () => {
  const bin = mkdtempSync(join(tmpdir(), "kaal-node-"));
  const name = process.platform === "win32" ? "node.exe" : "node";
  try {
    symlinkSync(process.execPath, join(bin, name), "file");
  } catch {
    copyFileSync(process.execPath, join(bin, name));
  }
  return bin;
};
const pathEnv = (bin) => {
  const env = { ...process.env };
  for (const k of Object.keys(env))
    if (k.toUpperCase() === "PATH") delete env[k];
  env.PATH = bin;
  delete env.KAAL_GATES;
  return env;
};

test("1. the runner passes plain node commands on a PATH with node and no sh", () => {
  const bin = nodeOnly();
  try {
    const r = kaal(["gates"], {
      cwd: join(HERE, "fixtures", "plain"),
      env: pathEnv(bin),
    });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /counted \(2 passing\)/);
  } finally {
    rmSync(bin, { recursive: true, force: true });
  }
});

test("2. acceptance and contracts expand a literal glob themselves", () => {
  // A fixture root, so the run never re-enters this file: node's own test
  // runner expands a glob too, and would recurse into gates-v2 forever.
  const cwd = join(HERE, "fixtures", "globs");
  const found = (out) =>
    out.split("\n").filter((l) => /\(\d+ passing, \d+ failing\)/.test(l));
  const a = kaal(["acceptance", "requirements/*/acceptance.test.mjs"], { cwd });
  assert.equal(a.status, 0, a.stdout + a.stderr);
  assert.equal(
    found(a.stdout).length,
    2,
    "acceptance did not expand the glob: " + a.stdout,
  );
  const c = kaal(["contracts", "architecture/*/contracts.test.mjs"], { cwd });
  assert.equal(c.status, 0, c.stdout + c.stderr);
  assert.equal(
    found(c.stdout).length,
    2,
    "contracts did not expand the glob: " + c.stdout,
  );
});

test("3. .gitattributes holds every text file to LF", () => {
  const p = join(ROOT, ".gitattributes");
  assert.ok(existsSync(p), "no .gitattributes");
  assert.match(readFileSync(p, "utf8"), /^\*\s+text=auto\s+eol=lf/m);
});

test("4. the board is green", () => {
  if (!INSIDE) assert.equal(kaal(["gates"]).status, 0, "the board is red");
});
