// Contract tests for the drawing where-a-skill-acts. One per seam. The change
// is text, so the seams are the places that text is read from: the five
// working skills, the retro skill, the stack that counts a compiled retro,
// and the runner page a model is handed. Blind to any code behind them.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const PLACE = join(HERE, "fixtures", "place-line");
const raw = (skill) =>
  readFileSync(join(ROOT, "skills", skill, "SKILL.md"), "utf8");
// Folded, because the formatter wraps where it likes.
const fold = (text) => text.replace(/\s+/g, " ");
const section = (text, title) =>
  text.match(
    new RegExp(`^## ${title}\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"),
  )?.[1] ?? "";
const kaal = (args, cwd = ROOT) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd,
    encoding: "utf8",
  });
const WORKING = ["analyse", "architect", "code", "operate", "test"];

test("1. the two places, stated before the first step of every working skill", () => {
  assert.equal(WORKING.length, 5);
  for (const skill of WORKING) {
    const text = raw(skill);
    const here = text.indexOf("\n## Where you act\n");
    const first = text.search(/^## 1\. /m);
    assert.notEqual(here, -1, `${skill}: no Where you act section`);
    assert.notEqual(first, -1, `${skill}: no first numbered step`);
    assert.ok(here < first, `${skill}: the section stands after step one`);
    const said = fold(section(text, "Where you act"));
    for (const phrase of [
      /repository that holds/i,
      /directory you were pointed at/i,
      /the ask names which/i,
      /ask before you begin/i,
      /you write nothing there/i,
      /ask where the work lands/i,
    ])
      assert.match(said, phrase, `${skill}: not in the section`);
  }
});

test("2. the retro rule where the skill speaks of filing, and Place under Period", () => {
  const text = raw("retro-4ls");
  assert.equal(
    text.includes("\n## Where you act\n"),
    false,
    "the retro skill was given the working skills' section",
  );
  const loop = fold(section(text, "Feed the loop"));
  for (const phrase of [
    /filed in the league either way/i,
    /application of the skill/i,
    /not about the tree/i,
    /never the tree/i,
  ])
    assert.match(loop, phrase, "not in Feed the loop");
  // Read the fence from the heading, not from the section: the block holds
  // headings of its own, so a section reader stops inside it.
  const after = text.slice(text.indexOf("\n## Output format\n"));
  const block = after.match(/```\n([\s\S]*?)```/)?.[1];
  assert.ok(block, "no fenced block under Output format");
  const lines = block.split("\n");
  const period = lines.findIndex((l) => l.startsWith("Period: "));
  assert.notEqual(period, -1, "no Period line");
  assert.match(
    lines[period + 1] ?? "",
    /^Place: .*pointed at/,
    "Place does not stand directly under Period, naming the two kinds",
  );
});

test("3. the stack counts a retro by its Feeds line and reads past the Place line", () => {
  const filed = readFileSync(
    join(PLACE, "retros", "2026-09-06-a-use-elsewhere.md"),
    "utf8",
  );
  assert.match(filed, /^Place: /m, "the fixture retro carries no Place line");
  const r = kaal(["retros"], PLACE);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^analyse: 1 unconsumed$/m);
  assert.match(r.stdout, /^architect: 0 unconsumed$/m);
});

test("4. the section reaches a model inside prompt one, and the runner page is current", () => {
  const r = kaal(["runner", "analyse", "json-flag"]);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(
    r.stdout.includes("## Where you act"),
    "prompt one does not carry the section",
  );
  const check = kaal(["runner", "--check"]);
  assert.equal(check.status, 0, check.stdout + check.stderr);
});
