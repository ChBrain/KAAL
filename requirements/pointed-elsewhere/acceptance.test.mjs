// Acceptance tests for requirement pointed-elsewhere. One per criterion.
// Surface only: the fixture's files, the runner page as a person receives
// it, and the ledger as a command on a fixture root.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FX = join(ROOT, "skills", "analyse", "fixtures", "pointed-elsewhere");
const ROOTS = join(
  dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "guest-records",
);
const kaal = (args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });
const files = (dir, prefix = "") =>
  existsSync(dir)
    ? readdirSync(dir).flatMap((n) =>
        statSync(join(dir, n)).isDirectory()
          ? files(join(dir, n), `${prefix}${n}/`)
          : [`${prefix}${n}`],
      )
    : [];

test("1. the fixture carries a tree, and its ask points the skill at a directory", () => {
  for (const f of ["ask.md", "expect.md"])
    assert.ok(existsSync(join(FX, f)), `no ${f}`);
  const tree = files(join(FX, "tree"));
  assert.ok(tree.length >= 2, `the tree holds ${tree.length} file(s)`);
  assert.ok(
    tree.some((f) => f.includes("/")),
    `no nested file in the tree: ${tree.join(", ")}`,
  );
  assert.ok(!existsSync(join(FX, "tree", ".git")), "the tree is a git copy");
  const ask = readFileSync(join(FX, "ask.md"), "utf8").replace(/\s+/g, " ");
  assert.match(ask, /directory/i, "the ask names no directory");
  assert.doesNotMatch(
    ask,
    /\b(KAAL|the league|this repository)\b/i,
    "the ask names a place inside the league",
  );
});

test("2. the checklist judges naming the place, writing nothing, and handing over", () => {
  const items = readFileSync(join(FX, "expect.md"), "utf8")
    .split(/^- /m)
    .slice(1)
    .map((i) => i.replace(/\s+/g, " "));
  assert.ok(items.length >= 3, `only ${items.length} checklist item(s)`);
  const has = (re) => items.filter((i) => re.test(i)).length === 1;
  assert.ok(has(/which of the two places/i), "no item on naming the place");
  assert.ok(has(/writes nothing/i), "no item on writing nothing there");
  assert.ok(has(/where the work lands/i), "no item on handing the work over");
});

test("3. the runner page carries the guest procedure, and only for a fixture with a tree", () => {
  const guest = kaal(["runner", "analyse", "pointed-elsewhere"]);
  assert.equal(guest.status, 0, guest.stderr);
  const page = guest.stdout.replace(/\s+/g, " ");
  for (const phrase of [
    /copy the tree/i,
    /outside the repository/i,
    /kaal witness/,
    /--against/,
    /a tree that moved fails the run/i,
  ])
    assert.match(page, phrase, "the procedure is not on the page");
  const plain = kaal(["runner", "analyse", "json-flag"]);
  assert.equal(plain.status, 0, plain.stderr);
  assert.doesNotMatch(
    plain.stdout.replace(/\s+/g, " "),
    /copy the tree/i,
    "a fixture with no tree was given the procedure",
  );
});

test("4. the ledger counts a record that says the tree was untouched, and no other", () => {
  const r = kaal(["ledger", ROOTS]);
  assert.equal(r.status, 1, r.stdout);
  const said = `${r.stdout}\n${r.stderr}`;
  assert.match(said, /1 of 2 fresh models|1 fresh passing model/);
  for (const dropped of ["beta.md", "gamma.md"]) {
    const line = said
      .split("\n")
      .find((l) => l.includes(dropped) && /witness/i.test(l));
    assert.ok(line, `${dropped} was not dropped for its witness: ${said}`);
  }
  assert.doesNotMatch(
    said,
    /alpha\.md is/,
    "the record that says clean was dropped",
  );
  const doc = readFileSync(join(ROOT, "evals", "README.md"), "utf8");
  assert.ok(doc.includes("`witness`"), "the README does not name witness");
});
