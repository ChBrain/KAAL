// Contract tests for the drawing honest-records. One per seam. Blind to the
// code: the tool as a command on fixture roots, and three texts.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  mkdtempSync,
  cpSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const kaal = (args, cwd = ROOT) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd,
    encoding: "utf8",
  });

test("1. frontmatter to contract: setup missing or off the list is refused; the four words pass", () => {
  const src = join(
    ROOT,
    "requirements",
    "honest-records",
    "fixtures",
    "no-setup",
  );
  assert.match(kaal(["ledger", src]).stderr, /missing setup/);
  const tmp = mkdtempSync(join(tmpdir(), "kaal-setup-"));
  try {
    cpSync(src, tmp, { recursive: true });
    const rec = (f) => join(tmp, "evals", "good", "f", f);
    const withSetup = (f, v) =>
      writeFileSync(
        rec(f),
        readFileSync(rec(f), "utf8").replace(
          /^verdict:/m,
          `setup: ${v}\nverdict:`,
        ),
      );
    withSetup("alpha.md", "phone");
    withSetup("beta.md", "chat");
    assert.match(kaal(["ledger", tmp]).stderr, /alpha\.md is missing setup/);
    for (const v of ["chat", "system", "workspace", "workflow"]) {
      cpSync(src, tmp, { recursive: true, force: true });
      withSetup("alpha.md", v);
      withSetup("beta.md", v);
      const r = kaal(["ledger", tmp]);
      assert.equal(r.status, 0, `${v}: ${r.stderr}`);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("2. freshness to board: the standing keeps its shape and the stale record is named under it with why", () => {
  const r = kaal(["ledger", join(HERE, "fixtures", "stale-standing")]);
  assert.equal(r.status, 0, r.stderr);
  const lines = r.stdout.trim().split("\n");
  const i = lines.findIndex((l) =>
    /^x: a candidate: candidate skill, 0 of 2 fresh models$/.test(l),
  );
  assert.ok(i >= 0, r.stdout);
  assert.equal(lines[i + 1], "  stale: evals/x/f/alpha.md (skill moved)");
});

test("3. texts to writers: the README's two rules and four words, the workflow's setup, the template's Task line", () => {
  const readme = readFileSync(join(ROOT, "evals", "README.md"), "utf8");
  assert.match(readme, /whole exchange/i);
  assert.match(readme, /expect_sha/);
  for (const v of ["chat", "system", "workspace", "workflow"])
    assert.ok(readme.includes(`\`${v}\``));
  assert.match(
    readFileSync(join(ROOT, ".github", "workflows", "evals.yml"), "utf8"),
    /setup: workflow/,
  );
  assert.match(
    readFileSync(
      join(ROOT, "skills", "analyse", "references", "requirement.md"),
      "utf8",
    ),
    /named for the change/,
  );
});
