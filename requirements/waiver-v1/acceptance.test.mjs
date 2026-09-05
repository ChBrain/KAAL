// Acceptance tests for requirement waiver-v1. One per criterion. Surface
// only: the config, the runner as a command on fixture roots.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const F = join(HERE, "fixtures");
const gates = (cwd) =>
  spawnSync("node", [join(ROOT, "bin", "kaal.mjs"), "gates"], {
    cwd,
    encoding: "utf8",
  });

test("1. the three human gates are data in kaal.config.json", () => {
  const h = JSON.parse(
    readFileSync(join(ROOT, "kaal.config.json"), "utf8"),
  ).human;
  assert.ok(h && Array.isArray(h.gates), "no human.gates");
  assert.deepEqual(h.gates.map((g) => g.seam).sort(), [
    "architecture",
    "deployment",
    "requirements",
  ]);
  for (const g of h.gates)
    for (const f of ["act", "evidence", "recorded"])
      assert.ok(g[f] && g[f].trim(), `${g.seam}: empty ${f}`);
});

test("2. a valid waiver turns a red wall into waived, exit 0, naming wall and who", () => {
  const r = gates(join(F, "waived"));
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^waived\b.*broken.*Kai/m);
});

test("3. an expired waiver counts for nothing and says so", () => {
  const r = gates(join(F, "expired"));
  assert.equal(r.status, 1);
  assert.match(r.stdout + r.stderr, /expired/i);
});

test("4. an incomplete waiver counts for nothing and names the missing field", () => {
  const r = gates(join(F, "incomplete"));
  assert.equal(r.status, 1);
  assert.match(r.stdout + r.stderr, /why/);
});

test("5. the summary counts waived walls apart from failing ones", () => {
  const r = gates(join(F, "waived"));
  const last = r.stdout.trim().split("\n").at(-1);
  assert.match(last, /1 waived/);
  assert.match(last, /0 failing/);
});
