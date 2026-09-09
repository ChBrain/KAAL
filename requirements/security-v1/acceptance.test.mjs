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

// Every `permissions:` block in a file, top level or under a job, as the
// lines indented past the key that opened it. A blank line does not end a
// block; a line at or left of the key does. Reading only the top level was
// a snapshot of where the writes happened to be: the analysis workflow
// declares its write under a job, and no top level read would ever meet it.
function permissionBlocks(text) {
  const lines = text.split("\n");
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const opened = lines[i].match(/^([ \t]*)permissions:[ \t]*$/);
    if (!opened) continue;
    const depth = opened[1].length;
    const body = [];
    for (let j = i + 1; j < lines.length; j++) {
      if (!lines[j].trim()) continue;
      if (lines[j].match(/^[ \t]*/)[0].length <= depth) break;
      body.push(lines[j]);
    }
    blocks.push(body);
  }
  return blocks;
}

test("2. every workflow declares permissions, and every write says what it is for", () => {
  const files = readdirSync(W).filter((f) => /\.ya?ml$/.test(f));
  assert.ok(files.length >= 2);
  for (const f of files) {
    const t = readFileSync(join(W, f), "utf8");
    assert.ok(/^permissions:/m.test(t), `${f}: no permissions block`);
    // Which write says why, not which workflow may write. Naming the
    // workflows was a snapshot of who wrote at the time. Any write is a
    // thing this repository hands out, so any write must say what it is
    // for, on its own line, where a consumer reading the block meets it.
    // `contents: write` alone was the narrower claim, and it was narrow
    // because contents was the only write in the tree when it was written.
    for (const body of permissionBlocks(t))
      for (const line of body) {
        const write = line.match(/^\s*[a-z-]+:\s*write\b(.*)$/);
        if (!write) continue;
        assert.match(
          write[1],
          /#\s*\S/,
          `${f}: ${line.trim()} does not say what the write is for`,
        );
      }
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
