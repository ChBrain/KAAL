import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { describeTarget, renderTarget } from "../bin/lib/assess/target.mjs";
import { refuseOutput } from "../bin/lib/assess/paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHA = "1234567890abcdef1234567890abcdef12345678";
const temp = () => mkdtempSync(join(tmpdir(), "kaal-target-"));
const refs = (dir, head, ref) => {
  mkdirSync(join(dir, ".git", "refs", "heads"), { recursive: true });
  writeFileSync(join(dir, ".git", "HEAD"), head);
  if (ref) writeFileSync(join(dir, ".git", "refs", "heads", "main"), ref);
  return dir;
};

test("describeTarget reads the sha from the ref the head names", () => {
  const dir = temp();
  try {
    const d = describeTarget(refs(dir, "ref: refs/heads/main\n", SHA + "\n"));
    assert.equal(d.schema, "kaal.target/v1");
    assert.equal(d.mode, "external");
    assert.equal(d.target.kind, "local");
    assert.equal(d.target.resolved_sha, SHA);
    assert.ok(!("unresolved" in d.target));
    assert.equal(d.access.target_write, "forbidden");
    assert.equal(d.access.provider_write, "forbidden");
    assert.equal(d.access.target_execution, "none");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("describeTarget reads a detached head, and names a ref with no file", () => {
  const detached = temp();
  const dangling = temp();
  try {
    assert.equal(
      describeTarget(refs(detached, SHA + "\n", null)).target.resolved_sha,
      SHA,
    );
    const d = describeTarget(refs(dangling, "ref: refs/heads/main\n", null));
    assert.equal(d.target.resolved_sha, null);
    assert.match(d.target.unresolved, /refs\/heads\/main/);
  } finally {
    rmSync(detached, { recursive: true, force: true });
    rmSync(dangling, { recursive: true, force: true });
  }
});

test("describeTarget on a directory with no git says so, and on a missing path too", () => {
  const dir = temp();
  try {
    const d = describeTarget(dir);
    assert.equal(d.target.resolved_sha, null);
    assert.match(d.target.unresolved, /git/i);
    assert.equal(describeTarget(join(dir, "nope")).target.resolved_sha, null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("renderTarget ends with one newline, parses, and is the same on two calls", () => {
  const dir = temp();
  try {
    const a = renderTarget(refs(dir, "ref: refs/heads/main\n", SHA + "\n"));
    assert.ok(a.endsWith("}\n"));
    assert.equal(JSON.parse(a).target.resolved_sha, SHA);
    assert.equal(renderTarget(dir), a);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("refuseOutput names the league, names the target, and permits a third place", () => {
  const target = "/somewhere/target";
  const inside = (p) => refuseOutput(p, { league: ROOT, target });
  assert.match(inside(join(ROOT, "evals", "x.json")), /league's own tree/);
  assert.match(inside(ROOT), /league's own tree/);
  assert.match(inside(join(target, "x.json")), /inside the target/);
  assert.match(inside(target), /inside the target/);
  assert.equal(inside("/tmp/elsewhere/x.json"), null);
  assert.equal(refuseOutput(null, { league: ROOT, target }), null);
  // A sibling whose name merely begins with the same letters is not inside.
  assert.equal(inside("/somewhere/target-notes/x.json"), null);
});
