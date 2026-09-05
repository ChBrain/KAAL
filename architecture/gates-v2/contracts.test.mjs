// Contract tests for the drawing gates-v2. One per seam. Blind to the code.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, symlinkSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const GLOBS = join(ROOT, "requirements", "gates-v2", "fixtures", "globs");
const kaal = (args, opts = {}) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
    ...opts,
  });

test("1. runner to platform shell: a node wall runs with no sh on the PATH, at the root, in the wall environment", () => {
  const bin = mkdtempSync(join(tmpdir(), "kaal-shell-"));
  try {
    symlinkSync(process.execPath, join(bin, "node"));
    const r = kaal(["gates"], {
      cwd: join(HERE, "fixtures", "env"),
      env: { ...process.env, PATH: bin, KAAL_GATES: undefined },
    });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /^ok {3}where/m);
  } finally {
    rmSync(bin, { recursive: true, force: true });
  }
});

test("2. argv to judged files: a literal glob names the same files as its expansion, sorted; nothing matched is red", () => {
  const literal = kaal(["acceptance", "requirements/*/acceptance.test.mjs"], {
    cwd: GLOBS,
  });
  const expanded = kaal(
    [
      "acceptance",
      "requirements/alpha/acceptance.test.mjs",
      "requirements/beta/acceptance.test.mjs",
    ],
    { cwd: GLOBS },
  );
  assert.equal(literal.status, 0, literal.stdout + literal.stderr);
  assert.equal(literal.stdout, expanded.stdout);
  const names = [...literal.stdout.matchAll(/^ok {3}closed\s+(\w+)/gm)].map(
    (m) => m[1],
  );
  assert.deepEqual(names, ["alpha", "beta"]);
  const none = kaal(["contracts", "architecture/*/nothing.test.mjs"], {
    cwd: GLOBS,
  });
  assert.equal(none.status, 1);
  assert.match(none.stdout, /no requirement files given/);
});

test("3. tree to checkout: the LF rule exists and the index holds no CRLF", () => {
  const rules = readFileSync(join(ROOT, ".gitattributes"), "utf8");
  assert.match(rules, /^\*\s+text=auto\s+eol=lf\s*$/m);
  const eol = spawnSync("git", ["ls-files", "--eol"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  assert.equal(eol.status, 0, "git ls-files failed: " + eol.stderr);
  assert.ok(eol.stdout.trim().length > 0, "no files listed");
  assert.equal(eol.stdout.match(/^i\/crlf/gm), null, "CRLF in the index");
});
