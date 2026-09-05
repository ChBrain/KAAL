import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
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
    "metadata-flat:metadata",
    "tools-empty:allowed-tools",
  ]);
  for (const r of ["compatibility", "allowed-tools", "metadata"])
    assert.ok(RULES.includes(r));
});
