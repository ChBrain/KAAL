// Contract tests for the drawing each-skill-carries-its-own-version. One per
// seam. Blind to the wall's code: the skills as text, the tool as a command
// on a skills directory these tests build, and the page.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  readdirSync,
  statSync,
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SKILLS = join(ROOT, "skills");
const kaal = (...args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });

/**
 * A skills directory of one skill whose metadata block is the caller's. It
 * obeys every rule it is not testing, adversarial fixture included: a fixture
 * a test builds is a fixture, and until this one was, the passing case could
 * not pass and two failing cases failed for another rule.
 */
const skillsDir = (metadata) => {
  const dir = mkdtempSync(join(tmpdir(), "kaal-skill-v-c-"));
  mkdirSync(join(dir, "one", "fixtures", "adversarial-out-of-scope"), {
    recursive: true,
  });
  writeFileSync(
    join(dir, "one", "fixtures", "adversarial-out-of-scope", "expect.md"),
    "# Expect\n\n- Refuses to do the other thing, and says which seat owns it.\n",
  );
  writeFileSync(
    join(dir, "one", "SKILL.md"),
    [
      "---",
      "name: one",
      'description: "In one mode you become the one and do the one thing. You take an ask and produce the pair every seat owes: the want and its proof. You do not do anything else. Use when the one thing is the next thing missing."',
      "license: MIT",
      ...metadata,
      "---",
      "",
      "# One",
      "",
      "It does the one thing.",
      "",
    ].join("\n"),
  );
  return dir;
};
const versioned = (v) => skillsDir(["metadata:", `  version: "${v}"`]);

test("1. a version a skill declares", () => {
  const names = readdirSync(SKILLS).filter((n) =>
    statSync(join(SKILLS, n)).isDirectory(),
  );
  assert.ok(names.length >= 5, `only ${names.length} skills to read`);
  for (const n of names) {
    const front = readFileSync(join(SKILLS, n, "SKILL.md"), "utf8").split(
      /^---$/m,
    )[1];
    // A string, and quoted: metadata takes string values, and an unquoted
    // 0.0.1 is not a number in YAML but 0.1 would be, so the quotes are the
    // habit that keeps the next one safe.
    assert.match(
      front,
      /^\s+version:\s*["']0\.0\.\d+["']\s*$/m,
      `${n} declares no quoted version in its patch place`,
    );
  }
});

test("2. a version missing or misshapen is a finding", () => {
  const cases = [
    [[], null, "missing"],
    [["metadata:", '  version: "0.0"'], "0.0", "two places"],
    [["metadata:", '  version: "0.0.x"'], "0.0.x", "not a number"],
    [["metadata:", '  version: "0.1.0"'], "0.1.0", "the minor place"],
    [["metadata:", '  version: "1.0.0"'], "1.0.0", "the major place"],
  ];
  for (const [metadata, version, why] of cases) {
    const dir = skillsDir(metadata);
    try {
      const r = kaal("check", dir);
      assert.equal(r.status, 1, `${why}: check exited ${r.status}`);
      const lines = r.stderr.trim().split("\n").filter(Boolean);
      const mine = lines.filter((l) => l.startsWith("one: version: "));
      assert.ok(mine.length >= 1, `${why}: no version finding: ${r.stderr}`);
      // Nothing else is wrong with this skill, so nothing else is reported.
      assert.deepEqual(
        lines.filter((l) => !l.startsWith("one: version: ")),
        [],
        `${why}: the fixture broke a rule it was not testing`,
      );
      if (version)
        assert.ok(
          mine.some((l) => l.includes(version)),
          `${why}: the finding does not name ${version}: ${mine.join(" ")}`,
        );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  // The shape that is right passes, or the five above prove nothing.
  const ok = versioned("0.0.1");
  try {
    const r = kaal("check", ok);
    assert.equal(r.status, 0, `a good skill was refused: ${r.stderr}`);
  } finally {
    rmSync(ok, { recursive: true, force: true });
  }
});

test("3. the page and the command agree on the rules", () => {
  const page = readFileSync(join(ROOT, "SURFACE.md"), "utf8");
  const section = page.match(/^## check\n([\s\S]*?)(?=^## )/m);
  assert.ok(section, "the page has no section for check");
  assert.match(
    section[1].replace(/\s+/g, " "),
    /version/i,
    "the check section does not name the version",
  );
  // And the rule is real, not only written down: the command finds it.
  const dir = skillsDir([]);
  try {
    assert.equal(
      kaal("check", dir).status,
      1,
      "the page promises a rule the command does not keep",
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
