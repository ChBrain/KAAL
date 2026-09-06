// Acceptance tests for requirement nothing-stale. One per criterion. Surface
// only: the code skill's text, the tool as a command on fixture roots, the
// gates list, and retros/.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const text = () =>
  readFileSync(join(ROOT, "skills", "code", "SKILL.md"), "utf8");
const section = (t, title) =>
  t.match(
    new RegExp(
      `^## [^\\n]*${title}[^\\n]*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`,
      "m",
    ),
  )?.[1] ?? "";
const kaal = (args, cwd) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd,
    encoding: "utf8",
  });
const RETROS = [
  "2026-09-05-code-eleventh-use.md",
  "2026-09-05-code-twelfth-use.md",
  "2026-09-05-code-thirteenth-use.md",
  "2026-09-05-code-fourteenth-use.md",
  "2026-09-05-code-fifteenth-use.md",
  "2026-09-05-code-sixteenth-use.md",
  "2026-09-05-code-seventeenth-use.md",
  "2026-09-05-code-eighteenth-use.md",
  "2026-09-05-code-nineteenth-use.md",
  "2026-09-05-code-twentieth-use.md",
];

test("1. the build rules say a test that reads prose compares with whitespace folded", () => {
  const s = section(text(), "Build to the proof");
  assert.ok(s, "no build section");
  assert.match(s, /reads\s+prose/i);
  assert.match(s, /whitespace\s+folded/i);
});

test("2. section 1 says a contract change walks every fixture with the old shape and names the ones that must stay", () => {
  const s = section(text(), "Read what is fixed");
  assert.ok(s, "no section 1");
  assert.match(s, /walks\s+every\s+fixture/i);
  assert.match(s, /must\s+stay\s+as\s+they\s+are/i);
});

test("3. the build rules say a generated file is written as the formatter would write it", () => {
  const s = section(text(), "Build to the proof");
  assert.ok(s, "no build section");
  assert.match(s, /generated\s+file/i);
  assert.match(s, /as\s+the\s+formatter\s+would\s+write\s+it/i);
  assert.match(s, /formatted\s+tree/i);
});

test("4. section 5 says a task whose tests are all green is closed in the same change", () => {
  const s = section(text(), "Hand off");
  assert.ok(s, "no handoff section");
  assert.match(s, /closed\s+in\s+the\s+same\s+change/i);
});

test("5. kaal runner --check reads every RUNNER.md, exits by staleness, and the gates list carries it", () => {
  const stale = kaal(
    ["runner", "--check"],
    join(HERE, "fixtures", "stale-runner"),
  );
  assert.equal(stale.status, 1, stale.stdout + stale.stderr);
  assert.match(stale.stderr, /skills\/x\/fixtures\/f\/RUNNER\.md.*stale/);
  const current = kaal(
    ["runner", "--check"],
    join(HERE, "fixtures", "current-runner"),
  );
  assert.equal(current.status, 0, current.stdout + current.stderr);
  assert.match(current.stdout, /skills\/x\/fixtures\/f\/RUNNER\.md/);
  assert.doesNotMatch(
    current.stdout + current.stderr,
    /fixtures\/g\//,
    "a fixture without a runner was named",
  );
  const gates = JSON.parse(
    readFileSync(join(ROOT, "kaal.config.json"), "utf8"),
  ).gates;
  assert.ok(
    gates.some((g) => /kaal\.mjs runner --check$/.test(g.command)),
    "no runners wall in the gates list",
  );
});

test("6. the ten retros are archived and none remains in retros/", () => {
  assert.equal(RETROS.length, 10);
  for (const r of RETROS) {
    assert.ok(
      existsSync(join(ROOT, "retros", "archive", r)),
      `${r} not archived`,
    );
    assert.ok(!existsSync(join(ROOT, "retros", r)), `${r} still in retros/`);
  }
});
