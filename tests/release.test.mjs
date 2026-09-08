import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { checkRelease, recordPath } from "../bin/lib/release.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = (n) =>
  join(ROOT, "requirements", "the-release-runs-on-a-key", "fixtures", n);

/** A tree built while the test runs, held to every rule it is not testing. */
const tree = (version, record) => {
  const dir = mkdtempSync(join(tmpdir(), "kaal-release-"));
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({ name: "fixture", version }, null, 2) + "\n",
  );
  if (record) {
    mkdirSync(join(dir, "deploy", "releases"), { recursive: true });
    writeFileSync(
      join(dir, "deploy", "releases", `${record}.md`),
      "# Release\n",
    );
  }
  return dir;
};

test("the plan's path is the same line on every platform", () => {
  // Written out, not joined. This test asserted `join(...)` and so agreed
  // with the host it ran on, which is how a finding that reads
  // `deploy\\releases\\0.0.1.md` on Windows reached CI: the unit encoded the
  // defect and only the Windows wall could see it.
  assert.equal(recordPath("0.0.1"), "deploy/releases/0.0.1.md");
  assert.doesNotMatch(
    recordPath("0.0.1"),
    /\\/,
    "a path a person reads should not carry the host's separator",
  );
  assert.match(recordPath("1.2.3"), /1\.2\.3\.md$/);
});

test("a tree that agrees answers, and the answer names the version and the plan", () => {
  const r = checkRelease(FIX("agrees"), "0.0.1");
  assert.equal(r.ok, true, r.lines.join(" "));
  const said = r.lines.join(" ");
  assert.match(said, /0\.0\.1/);
  assert.match(said, /deploy[/\\]releases[/\\]0\.0\.1\.md/);
});

test("each disagreement is its own finding, and two of them are two", () => {
  const both = checkRelease(tree("0.0.2", null), "0.0.1");
  assert.equal(both.ok, false);
  assert.equal(both.lines.length, 2, both.lines.join(" | "));
  // The version finding names both numbers; the plan finding names the path.
  assert.ok(
    both.lines.some((l) => /0\.0\.1/.test(l) && /0\.0\.2/.test(l)),
    `no finding names both versions: ${both.lines.join(" | ")}`,
  );
  assert.ok(
    both.lines.some((l) => /0\.0\.1\.md/.test(l)),
    `no finding names the plan: ${both.lines.join(" | ")}`,
  );
});

test("a version with no plan is one finding, and a plan for another version is not the plan", () => {
  const one = checkRelease(tree("0.0.1", null), "0.0.1");
  assert.equal(one.lines.length, 1, one.lines.join(" | "));
  // The plan is looked up by the version being released, so a record for
  // some other version is no record at all.
  const wrong = checkRelease(tree("0.0.1", "0.0.2"), "0.0.1");
  assert.equal(wrong.ok, false, "a plan for another version was accepted");
  assert.match(wrong.lines.join(" "), /0\.0\.1\.md/);
});
