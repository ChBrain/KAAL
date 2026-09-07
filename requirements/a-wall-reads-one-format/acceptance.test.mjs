// Acceptance tests for requirement a-wall-reads-one-format. One per
// criterion. Surface only: the tool's commands, run twice over a root these
// tests build, once with the runtime's default reporter and once with spec
// forced. The defect is a disagreement between two runs, so one run of
// either kind proves nothing.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
// The runtime's own default, whatever it is, and the other one. Node 22
// prints TAP when piped and node 24 prints spec; forcing spec reproduces on
// 22 what 24 does by itself, and on 24 the two runs are simply the same.
const kaal = (args, spec) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
    env: spec
      ? { ...process.env, NODE_OPTIONS: "--test-reporter=spec" }
      : process.env,
  });
const both = (args) => [kaal(args, false), kaal(args, true)];
const passCount = (r) => r.stdout.match(/^# pass (\d+)/m)?.[1] ?? null;

/**
 * A root with one requirement and its drawing, whose tests are the caller's.
 * It obeys what the walls read: a status in the requirement's handoff, the
 * test file beside it, and the drawing two directories over.
 */
const root = ({ tests, status = "closed" }) => {
  const dir = mkdtempSync(join(tmpdir(), "kaal-one-format-"));
  for (const p of [
    join(dir, "requirements", "t"),
    join(dir, "architecture", "t"),
  ])
    mkdirSync(p, { recursive: true });
  writeFileSync(
    join(dir, "requirements", "t", "requirement.md"),
    `# Requirement: t\n\n## Acceptance criteria\n\n1. It is so.\n\n## Handoff\n\n- Status: ${status}\n`,
  );
  writeFileSync(join(dir, "requirements", "t", "acceptance.test.mjs"), tests);
  writeFileSync(join(dir, "architecture", "t", "contracts.test.mjs"), tests);
  return dir;
};
const GREEN = [
  'import { test } from "node:test";',
  'test("1. the first", () => {});',
  'test("2. the second", () => {});',
  "",
].join("\n");
const RED = [
  'import { test } from "node:test";',
  'import assert from "node:assert/strict";',
  'test("1. the one that holds", () => {});',
  'test("2. the one that breaks", () => assert.equal(1, 2));',
  "",
].join("\n");
const EMPTY = ['import { test } from "node:test";', ""].join("\n");

test("1. the passing count is the same under either reporter", () => {
  const dir = root({ tests: GREEN });
  try {
    for (const [cmd, file] of [
      ["acceptance", join(dir, "requirements", "t", "acceptance.test.mjs")],
      ["contracts", join(dir, "architecture", "t", "contracts.test.mjs")],
    ]) {
      const [plain, spec] = both([cmd, file]);
      assert.equal(
        passCount(plain),
        "2",
        `${cmd}: the default run read ${passCount(plain)}`,
      );
      assert.equal(
        passCount(spec),
        passCount(plain),
        `${cmd}: spec read ${passCount(spec)} where the default read ${passCount(plain)}`,
      );
      // And the judged line agrees, not only the summary.
      for (const [which, r] of [
        ["default", plain],
        ["spec", spec],
      ])
        assert.match(
          r.stdout,
          /\(2 passing, 0 failing\)/,
          `${cmd} under ${which}: ${r.stdout.trim().split("\n")[0]}`,
        );
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("2. a red file's failing tests are named under either reporter", () => {
  const dir = root({ tests: RED });
  try {
    for (const [cmd, file] of [
      ["acceptance", join(dir, "requirements", "t", "acceptance.test.mjs")],
      ["contracts", join(dir, "architecture", "t", "contracts.test.mjs")],
    ]) {
      for (const spec of [false, true]) {
        const r = kaal([cmd, file], spec);
        assert.equal(r.status, 1, `${cmd} (spec=${spec}) did not go red`);
        assert.ok(
          /the one that breaks/.test(r.stdout),
          `${cmd} (spec=${spec}) did not name the failing test: ${r.stdout}`,
        );
        assert.ok(
          !/the one that holds/.test(r.stdout),
          `${cmd} (spec=${spec}) named a test that passed`,
        );
      }
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("3. the board's units line carries its count under either reporter", () => {
  const dir = mkdtempSync(join(tmpdir(), "kaal-one-format-board-"));
  try {
    mkdirSync(join(dir, "tests"));
    writeFileSync(join(dir, "tests", "a.test.mjs"), GREEN);
    writeFileSync(
      join(dir, "kaal.config.json"),
      `${JSON.stringify(
        {
          gates: [
            {
              name: "units",
              command: `"${process.execPath}" --test tests/a.test.mjs`,
              fix: "fix the unit",
            },
          ],
        },
        null,
        2,
      )}\n`,
    );
    for (const spec of [false, true]) {
      const r = kaal(["gates", dir], spec);
      assert.equal(r.status, 0, `gates (spec=${spec}): ${r.stdout}`);
      assert.match(
        r.stdout,
        /^ok {3}units \(2 passing\)$/m,
        `gates (spec=${spec}) lost the count: ${r.stdout.trim()}`,
      );
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("4. a closed requirement with nothing passing is not judged ok", () => {
  const dir = root({ tests: EMPTY });
  try {
    const file = join(dir, "requirements", "t", "acceptance.test.mjs");
    for (const spec of [false, true]) {
      const r = kaal(["acceptance", file], spec);
      assert.equal(
        r.status,
        1,
        `a closed requirement measuring nothing was green (spec=${spec}): ${r.stdout}`,
      );
      assert.ok(
        /\bt\b/.test(r.stdout),
        `the wall did not name the requirement (spec=${spec}): ${r.stdout}`,
      );
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
