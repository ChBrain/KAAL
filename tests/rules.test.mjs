import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { checkSkills, RULES } from "../bin/lib/rules.mjs";

const F = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "architecture",
  "push-v1",
  "fixtures",
  "rules",
);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

test("the league's own skills carry no findings", () => {
  assert.deepEqual(checkSkills(join(ROOT, "skills")), []);
});

test("one finding per broken rule, naming skill and rule", () => {
  const f = checkSkills(F);
  const has = (skill, rule) =>
    f.some((x) => x.skill === skill && x.rule === rule);
  assert.ok(has("broken-name", "name"), "name");
  assert.ok(has("vendor", "vendor"), "vendor");
  assert.ok(has("dash", "dash"), "dash");
  assert.equal(
    f.filter((x) => x.skill === "broken-name").length,
    1,
    "broken-name has exactly one finding",
  );
});

test("reach: undeclared shell or network is a finding, declared network passes, a stale declaration is a finding", () => {
  const S = join(ROOT, "architecture", "security-v1", "fixtures");
  const R = join(
    ROOT,
    "requirements",
    "security-v1",
    "fixtures",
    "undeclared-reach",
    "skills",
  );
  assert.ok(RULES.includes("reach"));
  assert.ok(
    checkSkills(join(S, "shell-reach")).some((x) => x.rule === "reach"),
    "shell",
  );
  assert.ok(
    checkSkills(R).some((x) => x.rule === "reach"),
    "network undeclared",
  );
  assert.deepEqual(checkSkills(join(S, "declared-reach")), [], "declared");
  const stale = checkSkills(join(S, "stale-declaration"));
  assert.ok(
    stale.some(
      (x) => x.rule === "reach" && /no script reaches/.test(x.message),
    ),
    "stale declaration",
  );
});

test("fixtures: no adversary is a finding, an adversary with no refusal line is a finding, the league passes", () => {
  const RQ = join(
    ROOT,
    "requirements",
    "fixtures-v1",
    "fixtures",
    "no-adversary",
    "skills",
  );
  const AR = join(
    ROOT,
    "architecture",
    "fixtures-v1",
    "fixtures",
    "no-refusal",
  );
  assert.ok(RULES.includes("fixtures"));
  assert.ok(
    checkSkills(RQ).some(
      (x) => x.rule === "fixtures" && /no adversarial/.test(x.message),
    ),
    "no adversary",
  );
  assert.ok(
    checkSkills(AR).some(
      (x) => x.rule === "fixtures" && /Refuses/.test(x.message),
    ),
    "no refusal line",
  );
  assert.ok(
    !checkSkills(join(ROOT, "skills")).some((x) => x.rule === "fixtures"),
    "the league has a fixtures finding",
  );
});

test("the standard's optional fields: refused when malformed, accepted when well formed", () => {
  const FX = join(ROOT, "requirements", "standard-v1", "fixtures", "fields");
  const f = checkSkills(FX);
  assert.deepEqual(f.map((x) => `${x.skill}:${x.rule}`).sort(), [
    "compat-long:compatibility",
    // A metadata that is a string has no version to read, and the metadata
    // finding is the whole story: one broken thing, one finding.
    "metadata-flat:metadata",
    "tools-empty:allowed-tools",
  ]);
  for (const r of ["compatibility", "allowed-tools", "metadata"])
    assert.ok(RULES.includes(r));
});

// A skills directory of one skill whose metadata block is the caller's,
// obeying every rule it is not testing so a version finding stands alone.
const withMetadata = (metadata) => {
  const dir = mkdtempSync(join(tmpdir(), "kaal-rules-version-"));
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

test("version: absent, misshapen and raised are findings; a patch version is not", () => {
  assert.ok(RULES.includes("version"));
  const cases = [
    [[], "missing"],
    [["metadata:", '  version: "0.0"'], "0.0"],
    [["metadata:", '  version: "0.0.x"'], "0.0.x"],
    [["metadata:", '  version: "0.1.0"'], "0.1.0"],
    [["metadata:", '  version: "1.0.0"'], "1.0.0"],
  ];
  for (const [metadata, names] of cases) {
    const dir = withMetadata(metadata);
    try {
      const f = checkSkills(dir);
      assert.deepEqual(
        f.map((x) => x.rule),
        ["version"],
        `${names}: findings other than the version`,
      );
      if (names !== "missing")
        assert.ok(
          f[0].message.includes(names),
          `${names}: the message does not name it: ${f[0].message}`,
        );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  const ok = withMetadata(["metadata:", '  version: "0.0.9"']);
  try {
    assert.deepEqual(checkSkills(ok), []);
  } finally {
    rmSync(ok, { recursive: true, force: true });
  }
});
