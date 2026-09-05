// Contract tests for the drawing waiver-v1. One per seam. Blind to the code.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const RQ = join(ROOT, "requirements", "waiver-v1", "fixtures");
const gates = (cwd) =>
  spawnSync("node", [join(ROOT, "bin", "kaal.mjs"), "gates"], {
    cwd,
    encoding: "utf8",
  });

test("1. waiver file to runner: a waiver that counts for nothing prints its reason beside the FAIL", () => {
  const e = gates(join(RQ, "expired"));
  assert.equal(e.status, 1);
  assert.match(e.stdout, /^FAIL broken.*\[waiver.*expired/m);
  const i = gates(join(RQ, "incomplete"));
  assert.equal(i.status, 1);
  assert.match(i.stdout, /^FAIL broken.*\[waiver.*missing why/m);
});

test("2. runner to shell: the waived line, the unused line, and the three-count summary", () => {
  const w = gates(join(RQ, "waived"));
  assert.equal(w.status, 0, w.stdout);
  assert.match(w.stdout, /^waived broken by Kai: .* \(until 2999-12-31\)$/m);
  assert.match(
    w.stdout.trim().split("\n").at(-1),
    /^green: 2 wall\(s\), 0 failing, 1 waived$/,
  );
  const u = gates(join(HERE, "fixtures", "unused"));
  assert.equal(u.status, 0, u.stdout);
  assert.match(u.stdout, /^unused waiver fine/m);
});

test("3. config to the seats: the config's human gates are the design's three seams", () => {
  const seams =
    JSON.parse(
      readFileSync(join(ROOT, "kaal.config.json"), "utf8"),
    ).human?.gates?.map((g) => g.seam) ?? [];
  const design = readFileSync(join(ROOT, "DESIGN.md"), "utf8");
  assert.deepEqual(seams.sort(), [
    "architecture",
    "deployment",
    "requirements",
  ]);
  assert.match(design, /sets the\s+requirements/);
  assert.match(design, /approves the\s+architecture/);
  assert.match(design, /key to\s+deployment/);
});
