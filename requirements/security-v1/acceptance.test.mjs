// Acceptance tests for requirement security-v1. One per criterion. Surface
// only: files, workflows, the tool as a command.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const W = join(ROOT, ".github", "workflows");
const kaal = (...args) =>
  spawnSync("node", [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });
const REACH =
  /from ["']node:(child_process|net|http|https|dns|tls)["']|\bfetch\(/;

test("1. SECURITY.md: reporting, supported versions, and a threat model naming the untrusted channels", () => {
  const p = join(ROOT, "SECURITY.md");
  assert.ok(existsSync(p), "no SECURITY.md");
  const t = readFileSync(p, "utf8");
  for (const h of ["Reporting", "Supported versions", "Threats"])
    assert.ok(new RegExp("^## " + h, "m").test(t), `no section ${h}`);
  const threats = t.split(/^## /m).find((s) => s.startsWith("Threats")) ?? "";
  for (const c of ["ask", "fixture", "retro", "pull request", "tool output"])
    assert.ok(threats.includes(c), `threats do not name ${c}`);
  assert.match(threats, /data/);
});

test("2. every workflow declares permissions; only evals writes contents", () => {
  const files = readdirSync(W).filter((f) => /\.ya?ml$/.test(f));
  assert.ok(files.length >= 2);
  for (const f of files) {
    const t = readFileSync(join(W, f), "utf8");
    assert.ok(/^permissions:/m.test(t), `${f}: no permissions block`);
    const writes = /^\s*contents:\s*write/m.test(t);
    const isEvals = /startsWith\([^)]*['"]\/eval/.test(t);
    assert.equal(
      writes,
      isEvals,
      `${f}: contents: write is ${writes ? "present" : "absent"} and it ${isEvals ? "is" : "is not"} the evals workflow`,
    );
  }
});

test("3. the lockfile is committed and ci installs with npm ci", () => {
  assert.ok(existsSync(join(ROOT, "package-lock.json")), "no lockfile");
  const ci = readdirSync(W)
    .map((f) => readFileSync(join(W, f), "utf8"))
    .find((t) => /pull_request/.test(t) && /push:/.test(t));
  assert.ok(ci, "no ci workflow");
  assert.match(ci, /npm ci/);
});

test("4. kaal check reports reach for an undeclared script and passes the league", () => {
  const bad = kaal(
    "check",
    join(HERE, "fixtures", "undeclared-reach", "skills"),
  );
  assert.equal(bad.status, 1, "undeclared reach not refused");
  assert.match(bad.stderr, /x.*reach/);
  assert.equal(kaal("check").status, 0, "the league's skills refused");
});

test("5. every league skill declares exactly what its scripts reach", () => {
  const S = join(ROOT, "skills");
  for (const n of readdirSync(S).filter((n) =>
    statSync(join(S, n)).isDirectory(),
  )) {
    const dir = join(S, n, "scripts");
    const scripts = existsSync(dir)
      ? readdirSync(dir).filter(
          (f) => f.endsWith(".mjs") && !f.endsWith(".test.mjs"),
        )
      : [];
    const reaches = scripts.some((f) =>
      REACH.test(readFileSync(join(dir, f), "utf8")),
    );
    const declared = /^## Reach/m.test(
      readFileSync(join(S, n, "SKILL.md"), "utf8"),
    );
    assert.equal(
      declared,
      reaches,
      `${n}: reach ${reaches ? "undeclared" : "declared without a reaching script"}`,
    );
  }
});
