import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { checkSkills } from "../bin/lib/rules.mjs";

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
