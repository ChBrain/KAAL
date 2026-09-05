// Contract tests for the drawing code-v2. One per seam. Blind to the code:
// the tool as a command on fixture roots and the tree, the skill's text.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const INSIDE = process.env.KAAL_GATES === "1";
const kaal = (args, cwd = ROOT) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd,
    encoding: "utf8",
  });
const GLOBS = join(ROOT, "requirements", "gates-v2", "fixtures", "globs");
const FX = join(ROOT, "requirements", "code-v2", "fixtures");
const last = (out) => out.trim().split("\n").at(-1);

test("1. judged runner to board: the count line is last, and the board shows a count", () => {
  assert.equal(
    last(
      kaal(["acceptance", "requirements/*/acceptance.test.mjs"], GLOBS).stdout,
    ),
    "# pass 2",
  );
  assert.equal(
    last(
      kaal(["contracts", "architecture/*/contracts.test.mjs"], GLOBS).stdout,
    ),
    "# pass 2",
  );
  if (!INSIDE) {
    const g = kaal(["gates"]).stdout;
    assert.match(g, /^ok {3}acceptance \(\d+ passing\)/m);
    assert.match(g, /^ok {3}contracts \(\d+ passing\)/m);
  }
});

test("2. tree to fixture list: five shapes, sorted by path; none is a refusal with one line", () => {
  const some = kaal(["fixtures", join(FX, "some")]);
  assert.equal(some.status, 0, some.stderr);
  const rows = some.stdout
    .trim()
    .split("\n")
    .map((l) => l.split(" "));
  assert.equal(rows.length, 5);
  assert.deepEqual(rows.map((r) => r[0]).sort(), [
    "config",
    "drawing",
    "record",
    "requirement",
    "skill",
  ]);
  const paths = rows.map((r) => r.slice(1).join(" "));
  assert.deepEqual(paths, [...paths].sort());
  for (const p of paths)
    assert.doesNotMatch(p, /\\/, "a backslash in a listed path");
  const none = kaal(["fixtures", join(FX, "none")]);
  assert.equal(none.status, 1);
  assert.equal(none.stderr.trim().split("\n").length, 1);
});

test("3. ledger to standings: the fixture's candidate stands at 2 of 2; the tree prints one line per candidate", () => {
  const f = kaal([
    "ledger",
    join(ROOT, "architecture", "push-v1", "fixtures", "ledger"),
  ]);
  assert.equal(f.status, 0, f.stderr);
  assert.match(f.stdout, /^good: .+: candidate skill, 2 of 2 fresh models$/m);
  const candidates = readdirSync(join(ROOT, "skills")).flatMap((s) =>
    JSON.parse(readFileSync(join(ROOT, "skills", s, "moves.json"), "utf8"))
      .moves.filter((m) => m.candidate === "skill")
      .map((m) => `${s}: ${m.name}`),
  );
  assert.ok(candidates.length > 0, "no candidate in the league");
  const t = kaal(["ledger"]);
  const lines =
    t.stdout.match(/^[\w-]+: .+: candidate skill, (\d) of 2 fresh models$/gm) ??
    [];
  assert.equal(
    lines.length,
    candidates.length,
    `standings ${lines.length}, candidates ${candidates.length}`,
  );
  for (const l of lines) assert.ok(Number(l.match(/(\d) of 2/)[1]) <= 2);
});

test("4. skill text to the developer: whole tree and escape; fixtures obey, and the shell", () => {
  const t = readFileSync(join(ROOT, "skills", "code", "SKILL.md"), "utf8");
  const s3 = t.slice(t.indexOf("## 3."), t.indexOf("## 4."));
  assert.match(s3, /whole tree/i);
  assert.match(s3, /escape/i);
  const s13 = t.slice(t.indexOf("## 1."), t.indexOf("## 4."));
  assert.match(s13, /fixtures obey the rules they are not testing/i);
  assert.match(s13, /shell/i);
});
