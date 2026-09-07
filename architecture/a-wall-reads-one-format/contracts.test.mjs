// Contract tests for the drawing a-wall-reads-one-format. One per seam.
// Each drives one side and reads the other: the judged runner against a
// runtime it spawns, the board against output it is handed, and the verdict
// against two numbers. None of them needs the defect's runtime to show it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runAcceptance, judge } from "../../bin/lib/acceptance.mjs";
import { runGates } from "../../bin/lib/gates.mjs";

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

/** A requirement and its tests, the shape the judged runner reads. */
const task = (tests, status = "closed") => {
  const dir = mkdtempSync(join(tmpdir(), "kaal-format-c-"));
  mkdirSync(join(dir, "requirements", "t"), { recursive: true });
  writeFileSync(
    join(dir, "requirements", "t", "requirement.md"),
    `# Requirement: t\n\n## Handoff\n\n- Status: ${status}\n`,
  );
  const file = join(dir, "requirements", "t", "acceptance.test.mjs");
  writeFileSync(file, tests);
  return { dir, file };
};
// The runtime's default is whatever it is; forcing the other one is what
// makes this provable on a machine that does not have the defect.
const underSpec = (fn) => {
  const had = process.env.NODE_OPTIONS;
  process.env.NODE_OPTIONS = `${had ? `${had} ` : ""}--test-reporter=spec`;
  try {
    return fn();
  } finally {
    if (had === undefined) delete process.env.NODE_OPTIONS;
    else process.env.NODE_OPTIONS = had;
  }
};

test("1. the format it reads is the format it asked for", () => {
  const { dir, file } = task(GREEN);
  const red = task(RED);
  try {
    const plain = runAcceptance([file]);
    const spec = underSpec(() => runAcceptance([file]));
    assert.equal(plain.passed, 2, `the default run read ${plain.passed}`);
    assert.equal(
      spec.passed,
      plain.passed,
      `spec read ${spec.passed} where the default read ${plain.passed}`,
    );
    // Criterion 2's half of the same seam: the names, not the numbers.
    for (const [which, a] of [
      ["default", runAcceptance([red.file])],
      ["spec", underSpec(() => runAcceptance([red.file]))],
    ]) {
      assert.equal(a.ok, false, `${which}: a red file was not red`);
      const named = a.lines.join("\n");
      assert.match(named, /the one that breaks/, `${which}: ${named}`);
      assert.doesNotMatch(
        named,
        /the one that holds/,
        `${which}: a passing test was named`,
      );
    }
  } finally {
    for (const d of [dir, red.dir]) rmSync(d, { recursive: true, force: true });
  }
});

test("2. a count read from output it did not ask for", () => {
  const root = mkdtempSync(join(tmpdir(), "kaal-format-board-"));
  try {
    // Each wall is a script that prints one line. Written to a file rather
    // than passed with -e, because the command goes through a shell and a
    // quoted string inside a quoted string parses differently on each one.
    const say = (name, text) => {
      const file = join(root, `${name}.mjs`);
      writeFileSync(file, `console.log(${JSON.stringify(text)});\n`);
      return `"${process.execPath}" "${file}"`;
    };
    // The board never spawns a runtime here, which is the point: the
    // command belongs to whoever wrote the config, in either of the two
    // shapes the runtime prints, or in neither.
    const g = runGates(root, {
      gates: [
        { name: "tap", command: say("tap", "# pass 7") },
        { name: "spec", command: say("spec", "\u2139 pass 7") },
        { name: "silent", command: say("silent", "nothing to count") },
      ],
    });
    assert.equal(g.ok, true, `the board went red: ${g.lines.join(" | ")}`);
    const counted = Object.fromEntries(g.results.map((x) => [x.name, x.count]));
    assert.equal(counted.tap, 7, "the board lost the tap count");
    assert.equal(counted.spec, 7, "the board lost the spec count");
    // A wall that prints no count is still ok: a count is printed, never a
    // verdict, and a wall that says nothing has not failed.
    assert.equal(counted.silent, null, "a countless wall invented a count");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("3. nothing ran is not the same as nothing failed", () => {
  // Only the promise this seam adds. The four verdicts that were already
  // right have a unit test of their own and it is the developer's; asserting
  // them here would be the same claim in two lanes.
  const closed = judge("closed", 0, 0);
  assert.equal(
    closed.ok,
    false,
    "a closed requirement measuring nothing was ok",
  );
  assert.match(
    closed.label,
    /^FAIL/,
    `the label does not refuse: ${closed.label}`,
  );
  // A drawing is judged with mustClose false and inherits the same refusal,
  // because the rule lives in the verdict and both walls read it.
  const drawing = judge("closed", 0, 0, false);
  assert.equal(drawing.ok, false, "a closed drawing measuring nothing was ok");
  assert.match(
    drawing.label,
    /^FAIL/,
    `the label does not refuse: ${drawing.label}`,
  );
});
