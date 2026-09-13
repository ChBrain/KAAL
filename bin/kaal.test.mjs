import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const kaal = (...a) =>
  spawnSync("node", [join(HERE, "kaal.mjs"), ...a], {
    cwd: ROOT,
    encoding: "utf8",
  });

test("an unknown command exits 1 with usage", () => {
  const r = kaal("nope");
  assert.equal(r.status, 1);
  assert.match(r.stderr, /usage/i);
});

test("a bad ledger root exits 1 and names the move on stderr", () => {
  const r = kaal(
    "ledger",
    join(ROOT, "requirements", "push-v1", "fixtures", "bad-ledger"),
  );
  assert.equal(r.status, 1);
  assert.match(r.stderr, /claims a rung with no evidence/);
});

test("a clean run exits 0 with a summary on stdout and nothing on stderr", () => {
  const r = kaal("check");
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.trim());
  assert.equal(r.stderr.trim(), "");
});

test("runner --check with no fixture sweeps the tree: every runner current, exit 0, one line each", () => {
  const r = kaal("runner", "--check");
  assert.equal(r.status, 0, r.stderr);
  assert.match(
    r.stdout,
    /^runner: skills\/analyse\/fixtures\/json-flag\/RUNNER\.md is current$/m,
  );
  assert.equal(r.stderr.trim(), "");
});

test("runner --check on a root whose runner moved exits 1 and names it on stderr, once", () => {
  const root = join(
    ROOT,
    "architecture",
    "nothing-stale",
    "fixtures",
    "tree-stale",
  );
  const r = spawnSync("node", [join(HERE, "kaal.mjs"), "runner", "--check"], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(r.status, 1, r.stdout);
  const named = r.stderr.match(/^runner: .* is stale$/gm) ?? [];
  assert.deepEqual(named, ["runner: skills/x/fixtures/f/RUNNER.md is stale"]);
});

test("backlog names present and absent declared pages, then counts reads", () => {
  const config = readFileSync(join(ROOT, "kaal.config.json"), "utf8");
  const scratch = (read, fn) => {
    const root = mkdtempSync(join(tmpdir(), "kaal-backlog-pages-"));
    try {
      writeFileSync(join(root, "kaal.config.json"), config);
      const declared = JSON.parse(config).seats.map(
        (seat) => `${String(seat.owns[0]).split("/")[0]}/backlog.md`,
      );
      for (const page of declared.slice(0, read)) {
        const path = join(root, ...page.split("/"));
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, "# Backlog\n");
      }
      fn(root, declared);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  };

  const invariant = (root, declared) => {
    const r = kaal("backlog", root);
    assert.equal(r.status, 0, r.stderr);
    const rows = [
      ...r.stdout.matchAll(/^backlog: (read|absent) (.*\/backlog\.md)$/gm),
    ].map((m) => ({ label: m[1], page: m[2] }));
    assert.equal(
      rows.length,
      declared.length,
      `the output did not name each of ${declared.length} declared pages once`,
    );
    for (const page of declared) {
      const named = rows.filter((row) => row.page === page);
      assert.equal(named.length, 1, `${page} appeared ${named.length} times`);
      assert.equal(
        named[0].label,
        existsSync(join(root, ...page.split("/"))) ? "read" : "absent",
        `${page} has the wrong label`,
      );
    }
    const read = rows.filter((row) => row.label === "read").length;
    assert.deepEqual(
      r.stdout.match(/^backlog: read \d+ of \d+ declared pages$/gm),
      [`backlog: read ${read} of ${declared.length} declared pages`],
    );
    assert.equal(r.stderr.trim(), "");
  };

  // Two, three and every declared page: six today, without making six the
  // next census this unit has to maintain.
  for (const read of [2, 3, JSON.parse(config).seats.length])
    scratch(read, invariant);
});
