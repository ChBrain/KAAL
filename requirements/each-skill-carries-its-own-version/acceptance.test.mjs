// Acceptance tests for requirement each-skill-carries-its-own-version. One
// per criterion. Surface only: the skills' frontmatter, the command, and the
// page. Nothing here imports the tool.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  readdirSync,
  existsSync,
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
const names = () =>
  readdirSync(SKILLS).filter((n) => statSync(join(SKILLS, n)).isDirectory());
// The version as it stands in the file, read without a parser: the value of
// a `version:` line inside the frontmatter's metadata block.
const declared = (file) => {
  const front = readFileSync(file, "utf8").split(/^---$/m)[1] ?? "";
  return front.match(/^\s+version:\s*["']?([^"'\s]+)["']?\s*$/m)?.[1] ?? null;
};

/**
 * A skills directory of one skill, whose metadata block is the caller's. The
 * skill obeys every rule it is not testing, adversarial fixture included, or
 * a finding about the version is indistinguishable from a finding about
 * something else and the passing case can never pass.
 */
const fixture = (metadata) => {
  const dir = mkdtempSync(join(tmpdir(), "kaal-skill-version-"));
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

test("1. every skill declares a version, and it is in its patch place", () => {
  const found = names();
  assert.ok(found.length >= 5, `only ${found.length} skills to read`);
  for (const n of found) {
    const v = declared(join(SKILLS, n, "SKILL.md"));
    assert.ok(v, `${n} declares no version`);
    const places = v.split(".");
    assert.equal(places.length, 3, `${n}: ${v} is not three places`);
    for (const p of places)
      assert.match(
        p,
        /^(0|[1-9][0-9]*)$/,
        `${n}: ${v} has a place that is not a number`,
      );
    assert.equal(places[0], "0", `${n}: major place is ${places[0]}`);
    assert.equal(places[1], "0", `${n}: minor place is ${places[1]}`);
  }
});

test("2. a skill with no version is a finding that names it", () => {
  const dir = fixture([]);
  try {
    const r = kaal("check", dir);
    assert.equal(
      r.status,
      1,
      `check exited ${r.status}: ${r.stdout}${r.stderr}`,
    );
    const lines = r.stderr.trim().split("\n").filter(Boolean);
    assert.ok(lines.length >= 1, "check said nothing");
    assert.ok(
      lines.some((l) => /\bone\b/.test(l) && /version/i.test(l)),
      `no finding naming the skill and the version: ${r.stderr}`,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("3. a version of the wrong shape or the wrong place is a finding that names it", () => {
  const cases = [
    ["0.0", "two places"],
    ["0.0.x", "a place that is not a number"],
    ["0.1.0", "the minor place"],
    ["1.0.0", "the major place"],
  ];
  for (const [version, why] of cases) {
    const dir = fixture(["metadata:", `  version: "${version}"`]);
    try {
      const r = kaal("check", dir);
      assert.equal(r.status, 1, `${why}: check exited ${r.status}`);
      const lines = r.stderr.trim().split("\n").filter(Boolean);
      assert.ok(
        lines.some((l) => /\bone\b/.test(l) && l.includes(version)),
        `${why}: no finding naming the skill and ${version}: ${r.stderr}`,
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  // And the shape that is right passes, or the three above prove nothing.
  const ok = fixture(["metadata:", '  version: "0.0.1"']);
  try {
    const r = kaal("check", ok);
    assert.equal(r.status, 0, `a good skill was refused: ${r.stderr}`);
  } finally {
    rmSync(ok, { recursive: true, force: true });
  }
});

test("4. the page says the version is among what the rules require", () => {
  const page = readFileSync(join(ROOT, "SURFACE.md"), "utf8");
  const m = page.match(/^## check\n([\s\S]*?)(?=^## )/m);
  assert.ok(m, "the page has no section for check");
  assert.match(
    m[1].replace(/\s+/g, " "),
    /version/i,
    "the check section does not name the version",
  );
});
