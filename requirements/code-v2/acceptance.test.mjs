// Acceptance tests for requirement code-v2. One per criterion. Surface only:
// the tool as a command, its output, the skill's text and fixtures.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const SKILL = join(ROOT, "skills", "code");
const INSIDE = process.env.KAAL_GATES === "1";
const kaal = (args, cwd = ROOT) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd,
    encoding: "utf8",
  });
const text = () => readFileSync(join(SKILL, "SKILL.md"), "utf8");
const GLOBS = join(ROOT, "requirements", "gates-v2", "fixtures", "globs");
const RETROS = [
  "2026-09-04-code-first-use.md",
  "2026-09-04-code-second-use.md",
  "2026-09-04-code-third-use.md",
  "2026-09-04-code-fourth-use.md",
  "2026-09-04-code-fifth-use.md",
  "2026-09-04-code-sixth-use.md",
  "2026-09-04-code-seventh-use.md",
  "2026-09-04-code-eighth-use.md",
  "2026-09-04-code-ninth-use.md",
  "2026-09-05-code-tenth-use.md",
];

test("1. the judged commands end with a count line and the board shows it", () => {
  const a = kaal(["acceptance", "requirements/*/acceptance.test.mjs"], GLOBS);
  assert.match(a.stdout.trim().split("\n").at(-1), /^# pass 2$/);
  const c = kaal(["contracts", "architecture/*/contracts.test.mjs"], GLOBS);
  assert.match(c.stdout.trim().split("\n").at(-1), /^# pass 2$/);
  if (!INSIDE) {
    const g = kaal(["gates"]);
    assert.match(g.stdout, /^ok {3}acceptance \(\d+ passing\)/m);
    assert.match(g.stdout, /^ok {3}contracts \(\d+ passing\)/m);
  }
});

test("2. kaal fixtures lists every fixture artefact by shape, sorted, and refuses a root with none", () => {
  const none = kaal(["fixtures", join(HERE, "fixtures", "none")]);
  assert.equal(none.status, 1);
  const some = kaal(["fixtures", join(HERE, "fixtures", "some")]);
  assert.equal(some.status, 0, some.stderr);
  const lines = some.stdout.trim().split("\n");
  assert.deepEqual(
    lines.map((l) => l.split(" ")[0]),
    ["config", "drawing", "record", "requirement", "skill"].sort((x, y) =>
      lines
        .find((l) => l.startsWith(x))
        .localeCompare(lines.find((l) => l.startsWith(y))),
    ),
  );
  assert.equal(lines.length, 5);
  const paths = lines.map((l) => l.split(" ").slice(1).join(" "));
  assert.deepEqual(paths, [...paths].sort());
});

test("3. kaal ledger prints the standing of every candidate move", () => {
  const f = kaal([
    "ledger",
    join(ROOT, "architecture", "push-v1", "fixtures", "ledger"),
  ]);
  assert.equal(f.status, 0, f.stderr);
  assert.match(
    f.stdout,
    /^[\w-]+: .+: candidate skill, \d of 2 fresh models$/m,
  );
  const t = kaal(["ledger"]);
  assert.equal(t.status, 0, t.stderr);
  const standings =
    t.stdout.match(/^[\w-]+: .+: candidate skill, \d of 2 fresh models$/gm) ??
    [];
  assert.ok(standings.length >= 1, "no standing line on the league's tree");
});

test("4. the skill's text says format the whole tree and the house rules apply to code", () => {
  const t = text();
  assert.match(t, /whole tree/i);
  assert.match(t, /escape/i);
});

test("5. the skill's text says fixtures obey the rules they are not testing and parse under every shell", () => {
  const t = text();
  assert.match(t, /fixtures obey the rules they are not testing/i);
  assert.match(t, /shell/i);
});

test("6. the whole-tree fixture exists and expects the tree formatted and every wall run", () => {
  const f = join(SKILL, "fixtures", "whole-tree");
  assert.ok(existsSync(join(f, "ask.md")), "no ask.md");
  const e = readFileSync(join(f, "expect.md"), "utf8");
  assert.match(e, /whole tree/i);
  assert.match(e, /every wall/i);
});

test("7. the ten retros are archived and none remains in retros/", () => {
  assert.equal(RETROS.length, 10);
  for (const r of RETROS) {
    assert.ok(
      existsSync(join(ROOT, "retros", "archive", r)),
      `${r} not archived`,
    );
    assert.ok(!existsSync(join(ROOT, "retros", r)), `${r} still in retros/`);
  }
});
