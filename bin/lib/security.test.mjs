import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FIXTURES = join(
  ROOT,
  "architecture",
  "an-open-finding-blocks-every-target",
  "fixtures",
);
const fixture = (name) => join(FIXTURES, name);

const seam = async (name) => {
  let security;
  try {
    security = await import("./security.mjs");
  } catch (error) {
    assert.fail(`security seam is not loadable: ${error.message}`);
  }
  assert.equal(typeof security[name], "function", `no ${name} seam`);
  return security[name];
};

test("readEvidence distinguishes absent evidence from a clean snapshot", async () => {
  const readEvidence = await seam("readEvidence");
  assert.deepEqual(readEvidence(fixture("absent")), {
    state: "absent",
    findings: [],
  });
  assert.deepEqual(readEvidence(fixture("clean")), {
    state: "gathered",
    scanner: "fixture-scanner",
    findings: [],
  });
});

test("codeState binds complete regular files inside the root", async () => {
  const codeState = await seam("codeState");
  const evidence = (await seam("readEvidence"))(fixture("open"));
  assert.deepEqual(codeState(fixture("open"), evidence.findings[0].bindings), {
    current: true,
    changed: [],
  });
  assert.deepEqual(
    codeState(fixture("changed"), evidence.findings[0].bindings),
    { current: false, changed: ["src/guard.mjs"] },
  );
  assert.deepEqual(
    codeState(fixture("open"), { "../guard.mjs": "0".repeat(64) }),
    {
      current: false,
      changed: ["../guard.mjs"],
    },
  );
});

test("security reports absent evidence and every gathered finding", async () => {
  const security = await seam("security");
  assert.deepEqual(security(fixture("clean")), { ok: true, findings: [] });
  assert.match(security(fixture("absent")).findings.join("\n"), /absent/i);
  assert.match(
    security(fixture("open")).findings.join("\n"),
    /fixture-scanner\/unsafe-guard/,
  );
});

test("securityWaiver accepts exact current bindings and rejects changed code", async () => {
  const securityWaiver = await seam("securityWaiver");
  const accepted = securityWaiver(fixture("waived"));
  assert.equal(accepted.reason, null);
  assert.equal(accepted.waiver.who, "Kai");
  assert.match(securityWaiver(fixture("changed")).reason, /changed|match/i);
});

test("binding adds only targets named by a gate", async () => {
  const { binding } = await import("./targets.mjs");
  assert.equal(binding("main", { binds: ["release"] }), true);
  assert.equal(binding("release", { binds: ["release"] }), true);
  assert.equal(binding("release", { name: "ordinary" }), false);
});
