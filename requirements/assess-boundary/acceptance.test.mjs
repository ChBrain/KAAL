// Acceptance tests for requirement assess-boundary. One per criterion.
// Surface only: the tool as a command, on fixture roots and in temporary
// directories, and the gates list read as data.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  readdirSync,
  statSync,
  mkdtempSync,
  mkdirSync,
  cpSync,
  rmSync,
} from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const FX = join(HERE, "fixtures");
const kaal = (args, cwd) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd,
    encoding: "utf8",
  });
/** Every file under a directory, by path, with the sha256 of its bytes. */
const shape = (dir) => {
  const out = {};
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, e.name);
      if (e.isDirectory()) walk(full);
      else
        out[relative(dir, full).split(sep).join("/")] = createHash("sha256")
          .update(readFileSync(full))
          .digest("hex");
    }
  };
  walk(dir);
  return out;
};
const temp = () => mkdtempSync(join(tmpdir(), "kaal-assess-"));
/** A copy of the plain target and an empty directory to run in. */
const scene = () => {
  const dir = temp();
  const target = join(dir, "target");
  const run = join(dir, "run");
  cpSync(join(FX, "plain"), target, { recursive: true });
  mkdirSync(run);
  return { dir, target, run };
};

test("1. assess prints a target descriptor, writes nothing, and records both writes as forbidden", () => {
  const { dir, target, run } = scene();
  try {
    const before = shape(target);
    const r = kaal(["assess", target], run);
    assert.equal(r.status, 0, r.stderr);
    const d = JSON.parse(r.stdout);
    assert.equal(d.schema, "kaal.target/v1");
    assert.equal(d.target.kind, "local");
    assert.ok(
      /^[0-9a-f]{40}$/.test(d.target.resolved_sha ?? "") ||
        (d.target.resolved_sha === null &&
          typeof d.target.unresolved === "string" &&
          d.target.unresolved.trim() !== ""),
      "neither a resolved sha nor a reason it is missing",
    );
    assert.equal(d.access.target_write, "forbidden");
    assert.equal(d.access.provider_write, "forbidden");
    assert.deepEqual(shape(target), before, "the target changed");
    assert.deepEqual(readdirSync(run), [], "the run directory gained a file");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("2. the output option writes exactly one file, and its bytes are what the command prints", () => {
  const { dir, target, run } = scene();
  try {
    const before = shape(target);
    const out = join(dir, "out");
    mkdirSync(out);
    const file = join(out, "descriptor.json");
    const w = kaal(["assess", target, "--output", file], run);
    assert.equal(w.status, 0, w.stderr);
    assert.deepEqual(readdirSync(out), ["descriptor.json"]);
    const printed = kaal(["assess", target], run);
    assert.equal(printed.status, 0, printed.stderr);
    assert.equal(readFileSync(file, "utf8"), printed.stdout);
    assert.deepEqual(shape(target), before, "the target changed");
    assert.deepEqual(readdirSync(run), [], "the run directory gained a file");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("3. two runs on an unchanged target print byte-identical documents", () => {
  const { dir, target, run } = scene();
  try {
    const a = kaal(["assess", target], run);
    const b = kaal(["assess", target], run);
    assert.equal(a.status, 0, a.stderr);
    assert.equal(b.status, 0, b.stderr);
    assert.ok(a.stdout.trim(), "the first run printed nothing");
    assert.equal(a.stdout, b.stdout);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("4. an output path inside the league's own tree is refused, and nothing is written", () => {
  const { dir, target, run } = scene();
  try {
    const file = join(ROOT, "evals", "must-not-appear.json");
    const r = kaal(["assess", target, "--output", file], run);
    assert.equal(r.status, 1, r.stdout);
    assert.match(r.stderr, /must-not-appear\.json/);
    assert.equal(r.stdout.trim(), "", "a document was printed anyway");
    assert.ok(!existsPath(file), "a file landed in the league's tree");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("5. an output path inside the target is refused, and the target is unchanged", () => {
  const { dir, target, run } = scene();
  try {
    const before = shape(target);
    const r = kaal(
      ["assess", target, "--output", join(target, "report.json")],
      run,
    );
    assert.equal(r.status, 1, r.stdout);
    assert.match(r.stderr, /report\.json/);
    assert.equal(r.stdout.trim(), "", "a document was printed anyway");
    assert.deepEqual(shape(target), before, "the target changed");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("6. the boundary wall reads the assess tree, names a writer and a reacher, and the gates list runs it", () => {
  const clean = kaal(["boundary"], join(FX, "clean-assess"));
  assert.equal(clean.status, 0, clean.stderr);
  const bad = kaal(["boundary"], join(FX, "second-writer"));
  assert.equal(bad.status, 1, bad.stdout);
  assert.match(bad.stderr, /collect\.mjs writes/);
  assert.match(bad.stderr, /run\.mjs reaches/);
  assert.doesNotMatch(bad.stderr, /output\.mjs/);
  const gates = JSON.parse(
    readFileSync(join(ROOT, "kaal.config.json"), "utf8"),
  ).gates;
  assert.ok(
    gates.some((g) => /kaal\.mjs boundary$/.test(g.command)),
    "no boundary wall in the gates list",
  );
});

function existsPath(p) {
  try {
    statSync(p);
    return true;
  } catch {
    return false;
  }
}
