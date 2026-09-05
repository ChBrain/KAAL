// Acceptance tests for requirement eval-runner. One per criterion. Surface
// only: the tool as a command and the files it writes.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  existsSync,
  mkdtempSync,
  cpSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const kaal = (args, cwd = ROOT) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd,
    encoding: "utf8",
  });
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
// A fenced block closes at a line of exactly its opening fence, so a fence
// inside the block (a skill's own example) does not end it.
const blocks = (doc) =>
  [...doc.matchAll(/^(`{3,})[^\n]*\n([\s\S]*?)^\1[ \t]*$/gm)].map((m) => m[2]);

test("1. the runner prints the skill, its references, the ask, the checklist, and the current shas", () => {
  const r = kaal(["runner", "analyse", "json-flag"]);
  assert.equal(r.status, 0, r.stderr);
  const b = blocks(r.stdout);
  assert.ok(b.length >= 3, `expected three fenced blocks, got ${b.length}`);
  const skill = readFileSync(
    join(ROOT, "skills", "analyse", "SKILL.md"),
    "utf8",
  ).trim();
  assert.ok(b[0].includes(skill), "prompt 1 lacks SKILL.md");
  assert.match(b[0], /references\/requirement\.md/);
  assert.ok(
    b[0].includes(
      readFileSync(
        join(ROOT, "skills", "analyse", "references", "requirement.md"),
        "utf8",
      ).trim(),
    ),
  );
  assert.ok(
    b[0]
      .trimEnd()
      .endsWith(
        readFileSync(
          join(ROOT, "skills", "analyse", "fixtures", "json-flag", "ask.md"),
          "utf8",
        ).trim(),
      ),
  );
  const items = readFileSync(
    join(ROOT, "skills", "analyse", "fixtures", "json-flag", "expect.md"),
    "utf8",
  )
    .split("\n")
    .filter((l) => l.startsWith("- "));
  for (const it of items)
    assert.ok(b[1].includes(it), `prompt 2 lacks: ${it.slice(0, 40)}`);
  assert.ok(b[1].trimEnd().endsWith("Output:"));
  assert.ok(
    b[2].includes(
      `ask_sha: ${sha(join(ROOT, "skills", "analyse", "fixtures", "json-flag", "ask.md"))}`,
    ),
  );
  assert.ok(
    b[2].includes(
      `expect_sha: ${sha(join(ROOT, "skills", "analyse", "fixtures", "json-flag", "expect.md"))}`,
    ),
  );
  assert.ok(
    b[2].includes(
      `skill_sha: ${sha(join(ROOT, "skills", "analyse", "SKILL.md"))}`,
    ),
  );
  assert.ok(b[2].includes("fixture: json-flag"));
});

test("2. --write files RUNNER.md beside the fixture; --check passes on it and refuses a stale one", () => {
  const tmp = mkdtempSync(join(tmpdir(), "kaal-runner-"));
  try {
    for (const d of ["skills", "evals"])
      cpSync(join(ROOT, d), join(tmp, d), { recursive: true });
    const w = kaal(["runner", "analyse", "json-flag", "--write"], tmp);
    assert.equal(w.status, 0, w.stderr);
    const file = join(
      tmp,
      "skills",
      "analyse",
      "fixtures",
      "json-flag",
      "RUNNER.md",
    );
    assert.ok(existsSync(file), "no RUNNER.md written");
    assert.equal(
      kaal(["runner", "analyse", "json-flag", "--check"], tmp).status,
      0,
    );
    writeFileSync(file, readFileSync(file, "utf8") + "x");
    const c = kaal(["runner", "analyse", "json-flag", "--check"], tmp);
    assert.equal(c.status, 1);
    assert.match(c.stderr, /stale/i);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  const s = kaal(
    ["runner", "x", "f", "--check"],
    join(HERE, "fixtures", "stale-runner"),
  );
  assert.equal(s.status, 1, s.stdout + s.stderr);
});

test("3. the league's own fixture carries a current RUNNER.md", () => {
  assert.ok(
    existsSync(
      join(ROOT, "skills", "analyse", "fixtures", "json-flag", "RUNNER.md"),
    ),
  );
  const c = kaal(["runner", "analyse", "json-flag", "--check"]);
  assert.equal(c.status, 0, c.stderr);
});
