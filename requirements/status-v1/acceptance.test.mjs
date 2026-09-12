// Acceptance tests for requirement status-v1. One per criterion, numbered to
// match. Surface only: requirement files, the tool as a command, the config.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const F = join(HERE, "fixtures");
const kaal = (...args) =>
  spawnSync("node", [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });
const fixture = (name) => join(F, name, "acceptance.test.mjs");

// Criteria 1 and 2 are superseded by `a-task-is-delivered-by-its-run`. The
// field they fixed is gone from every page: whether a task was delivered is a
// report a run produces, not a declaration a seat writes. What survives is
// the question those criteria were really asking, which is that the wall
// tells a red that matters from a red that does not, and it asks it of the
// report instead of the field.
test("1. no requirement declares a status, and the wall asks no page for one", () => {
  const dirs = readdirSync(join(ROOT, "requirements")).filter((d) =>
    existsSync(join(ROOT, "requirements", d, "requirement.md")),
  );
  assert.ok(dirs.length >= 1);
  for (const d of dirs) {
    const lines =
      readFileSync(
        join(ROOT, "requirements", d, "requirement.md"),
        "utf8",
      ).match(/^- Status: (open|closed)\s*$/gm) ?? [];
    assert.equal(lines.length, 0, `${d}: still declares a status`);
  }
});

test("2. kaal acceptance: a regression fails, an unbuilt task is reported, and neither reads a page", () => {
  const F = join(
    ROOT,
    "requirements",
    "a-task-is-delivered-by-its-run",
    "fixtures",
  );
  const suite = (n) =>
    join(F, n, "requirements", "alpha", "acceptance.test.mjs");
  // Red and never recorded is work in progress: reported, and the wall
  // answers. Red with a record of it passing is a regression and refuses.
  const ok = kaal("acceptance", suite("not-delivered"), suite("delivered"));
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.match(ok.stdout, /not delivered/, "an unbuilt task was not reported");
  assert.match(
    ok.stdout,
    /\bok +delivered/,
    "a recorded pass was not reported",
  );
  assert.equal(
    kaal("acceptance", suite("regressed")).status,
    1,
    "a regression was not refused",
  );
  // And the verdict comes from the record, not from the page: these fixture
  // pages carry no status at all and the wall still answers.
  assert.doesNotMatch(
    readFileSync(
      join(F, "delivered", "requirements", "alpha", "requirement.md"),
      "utf8",
    ),
    /^- Status:/m,
    "the fixture page carries a status, so this proves nothing",
  );
});

test("3. the acceptance wall runs kaal acceptance over the requirements glob", () => {
  const gates = JSON.parse(
    readFileSync(join(ROOT, "kaal.config.json"), "utf8"),
  ).gates;
  const wall = gates.find((g) => g.name === "acceptance");
  assert.ok(wall, "no acceptance wall");
  assert.match(
    wall.command,
    /kaal\.mjs acceptance requirements\/\*\/acceptance\.test\.mjs/,
  );
});

test("4. an unfinished task reads not delivered and does not fail the wall", () => {
  // Superseded by `a-task-is-delivered-by-its-run`, and it is the same claim
  // asked of the report. It used to read `- Status: open` from the page;
  // there is no page to ask, so it asks the tree: a task nobody has proved
  // has no record, and a red suite with no record is work in progress rather
  // than a failure. That is the whole of what this criterion ever said.
  //
  // On fixed ground, which is a rule this case used to break. It read
  // `push-v1` out of the league's own tree because that task happened to be
  // unfinished, and the day two models passed a fixture and somebody
  // recorded the run, the case went red for a reason that has nothing to do
  // with the criterion. An unfinished task is a shape, and `open-red` is a
  // fixture of that shape that no later day can finish.
  const r = kaal("acceptance", fixture("open-red"));
  assert.match(
    r.stdout,
    /not delivered/,
    `an unfinished task did not read as not delivered: ${r.stdout}`,
  );
  assert.equal(r.status, 0, `an unfinished task failed the wall: ${r.stdout}`);
});
