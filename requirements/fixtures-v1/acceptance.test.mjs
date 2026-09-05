// Acceptance tests for requirement fixtures-v1. One per criterion. Surface
// only: fixture directories and the tool as a command.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const S = join(ROOT, "skills");
const skills = () =>
  readdirSync(S)
    .filter((n) => statSync(join(S, n)).isDirectory())
    .sort();
const adversarial = (n) => {
  const f = join(S, n, "fixtures");
  return existsSync(f)
    ? readdirSync(f).filter(
        (c) =>
          c.startsWith("adversarial-") && statSync(join(f, c)).isDirectory(),
      )
    : [];
};
const kaal = (...args) =>
  spawnSync("node", [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });

test("1. every skill has an adversarial fixture with ask and expect", () => {
  assert.ok(skills().length >= 1);
  for (const n of skills()) {
    const a = adversarial(n);
    assert.ok(a.length >= 1, `${n}: no adversarial fixture`);
    for (const c of a)
      for (const f of ["ask.md", "expect.md"])
        assert.ok(
          existsSync(join(S, n, "fixtures", c, f)),
          `${n}/${c}: no ${f}`,
        );
  }
});

test("2. every adversarial expect names a refusal or an abstention", () => {
  let seen = 0;
  for (const n of skills())
    for (const c of adversarial(n)) {
      seen++;
      const t = readFileSync(join(S, n, "fixtures", c, "expect.md"), "utf8");
      assert.ok(
        /^- (Refuses|Does not)\b/m.test(t),
        `${n}/${c}: no Refuses or Does not line`,
      );
    }
  assert.ok(seen >= 1, "no adversarial fixtures to check");
});

test("3. the six adversaries are present, one per skill", () => {
  const want = {
    analyse: /ambiguous|underspecified|vague/i,
    architect: /seam|scope/i,
    code: /test/i,
    test: /cannot fail|wish|always/i,
    operate: /production|key/i,
    "retro-4ls": /tension|smooth/i,
  };
  for (const [n, re] of Object.entries(want)) {
    const texts = adversarial(n).map(
      (c) =>
        readFileSync(join(S, n, "fixtures", c, "ask.md"), "utf8") +
        readFileSync(join(S, n, "fixtures", c, "expect.md"), "utf8"),
    );
    assert.ok(
      texts.some((t) => re.test(t)),
      `${n}: no adversary matching ${re}`,
    );
  }
});

test("4. kaal check reports fixtures for a skill with no adversarial fixture", () => {
  const bad = kaal("check", join(HERE, "fixtures", "no-adversary", "skills"));
  assert.equal(bad.status, 1, "skill without an adversary not refused");
  assert.match(bad.stderr, /x: fixtures:/);
  assert.equal(kaal("check").status, 0, "the league refused");
});
