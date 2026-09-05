import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { checkAgents, RULES } from "../bin/lib/agents.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const A = join(ROOT, "architecture", "agent-v1", "fixtures");
const R = join(ROOT, "requirements", "agent-v1", "fixtures");
const rules = (f) => f.map((x) => `${x.agent}:${x.rule}`);

test("the thirteen rule names the drawing fixed", () => {
  assert.deepEqual(RULES, [
    "fields",
    "name",
    "division",
    "skills",
    "hands_to",
    "lane",
    "license",
    "sections",
    "chapters",
    "credit",
    "scope",
    "ledger",
    "fixtures",
  ]);
});

test("the league's own agents carry no findings", () => {
  assert.deepEqual(checkAgents(ROOT), []);
});

test("a name that does not match its directory, and missing files, are named findings", () => {
  const f = checkAgents(join(R, "bad-agent"));
  assert.ok(rules(f).includes("x:name"), "name");
  assert.ok(rules(f).includes("x:sections"), "sections");
  assert.ok(
    rules(f).includes("x:chapters") || rules(f).includes("x:credit"),
    "persona missing",
  );
});

test("unresolved loadout and hands are named per entry", () => {
  const f = checkAgents(join(A, "unresolved"));
  assert.ok(
    f.some((x) => x.rule === "skills" && /no-such-skill/.test(x.message)),
  );
  assert.ok(f.some((x) => x.rule === "hands_to" && /nobody/.test(x.message)));
});

test("a persona carrying scope is a finding, and nothing else in that fixture is", () => {
  const f = checkAgents(join(A, "scoped"));
  assert.deepEqual(rules(f), ["x:scope"]);
});
