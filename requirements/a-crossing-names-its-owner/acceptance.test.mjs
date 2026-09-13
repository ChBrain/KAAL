// Acceptance tests for requirement a-crossing-names-its-owner. One per
// criterion. Surface only: `kaal seats` on scratch repositories, because the
// lane comes from a branch and the crossing from a diff, and both have to be
// real.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const config = () =>
  JSON.parse(readFileSync(join(ROOT, "kaal.config.json"), "utf8"));
const said = (r) =>
  `${r.error ? `${r.error.message}: ` : ""}${r.stdout ?? ""}${r.stderr ?? ""}`;
const notUsage = (out) =>
  assert.doesNotMatch(out, /^usage: kaal/m, `no such command: ${out}`);
const git = (cwd, ...args) => {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(r.status, 0, `git ${args.join(" ")}: ${said(r)}`);
};
const put = (root, files) => {
  for (const [rel, text] of Object.entries(files)) {
    const p = join(root, ...rel.split("/"));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  }
};

/** The seats and what each owns, read from the declaration and not assumed. */
const SEATS = config().seats;
const NAMES = SEATS.map((s) => s.name);
/** The lane this task's branches sit in, and the seat it carries. */
const LANE = "requirement/*";

/** A scratch repository on `branch`, with `change` left in the working tree. */
const scratch = (branch, change, fn) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-cross-"));
  try {
    git(root, "init", "--quiet", "-b", "main");
    git(root, "config", "user.email", "fixture@example.invalid");
    git(root, "config", "user.name", "fixture");
    put(root, {
      "kaal.config.json": JSON.stringify(config(), null, 2),
      "AGENTS.md": "# contract\n",
      "bin/kaal.mjs": "//\n",
      "tests/plans/units.md": "# units\n",
      "requirements/alpha/requirement.md": "# alpha\n",
    });
    git(root, "add", "-A");
    git(root, "commit", "--quiet", "-m", "base");
    git(root, "branch", "--quiet", "release");
    git(root, "checkout", "--quiet", "-B", branch);
    put(root, change);
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

const seats = (root) =>
  spawnSync(
    process.execPath,
    [join(ROOT, "bin", "kaal.mjs"), "seats", root, "--against", "release"],
    {
      encoding: "utf8",
      env: { ...process.env, KAAL_BRANCH: "", KAAL_BASE: "" },
    },
  );

/** The lines that refuse a path, told from the seat lines and the lane line. */
const findings = (out, path) =>
  out
    .split("\n")
    .filter((l) => l.includes(path) && !/^seat /.test(l) && !/^lane /.test(l));

test("1. a crossing names the seat that owns the path", () => {
  // Asserted rather than assumed: the criterion is about the owner of this
  // path, and a declaration that stopped naming one would make the test
  // green for its own defect.
  const owner = SEATS.find((s) => (s.owns ?? []).includes("bin/**"));
  assert.ok(owner, `no seat owns bin/**: ${JSON.stringify(SEATS)}`);
  scratch(
    "requirement/alpha",
    { "bin/kaal.mjs": "//\n// changed\n" },
    (root) => {
      const r = seats(root);
      const out = said(r);
      notUsage(out);
      assert.equal(r.status, 1, `the crossing was let through: ${out}`);
      const lines = findings(out, "bin/kaal.mjs");
      assert.equal(lines.length, 1, `one finding about the path: ${out}`);
      assert.match(
        lines[0],
        new RegExp(`\\b${owner.name}\\b`),
        `the finding does not name the owner ${owner.name}: ${lines[0]}`,
      );
    },
  );
});

test("2. a crossing onto a path no seat owns says so in words, and names no seat", () => {
  // A path the governance lane allows and no seat owns, which is why the
  // answer has no name to give.
  const unowned = "AGENTS.md";
  assert.ok(
    !SEATS.some((s) => (s.owns ?? []).includes(unowned)),
    `a seat owns ${unowned}, so this criterion has no subject`,
  );
  scratch(
    "requirement/alpha",
    { "AGENTS.md": "# contract\n# changed\n" },
    (root) => {
      const r = seats(root);
      const out = said(r);
      notUsage(out);
      // The witness that the run did its work: the path is still refused.
      assert.equal(r.status, 1, `the crossing was let through: ${out}`);
      const lines = findings(out, unowned);
      assert.equal(lines.length, 1, `one finding about the path: ${out}`);
      // Both halves. Saying nothing is what it does today, so the finding
      // has to say it: a reader must be able to tell a path nobody owns from
      // a path whose owner the wall forgot to name.
      assert.match(
        lines[0],
        /no seat/i,
        `the finding does not say no seat owns it: ${lines[0]}`,
      );
      for (const n of NAMES)
        assert.doesNotMatch(
          lines[0],
          new RegExp(`\\b${n}\\b`),
          `the finding names the seat ${n} for a path no seat owns: ${lines[0]}`,
        );
    },
  );
});

test("3. the refusal says a block is the way through, naming the seat to ask", () => {
  const owner = SEATS.find((s) => (s.owns ?? []).includes("bin/**"));
  assert.ok(owner, `no seat owns bin/**: ${JSON.stringify(SEATS)}`);
  scratch(
    "requirement/alpha",
    { "bin/kaal.mjs": "//\n// changed\n" },
    (root) => {
      const out = said(seats(root));
      notUsage(out);
      const block = out.split("\n").filter((l) => /\bblock\b/i.test(l));
      assert.ok(block.length, `the answer says nothing about a block: ${out}`);
      assert.ok(
        block.some((l) => new RegExp(`\\b${owner.name}\\b`).test(l)),
        `no line about a block names the seat to ask: ${block.join(" | ")}`,
      );
    },
  );
});

test("4. the block is recorded in the lane that was refused", () => {
  const owner = SEATS.find((s) => (s.owns ?? []).includes("bin/**"));
  assert.ok(owner, `no seat owns bin/**: ${JSON.stringify(SEATS)}`);
  scratch(
    "requirement/alpha",
    { "bin/kaal.mjs": "//\n// changed\n" },
    (root) => {
      const out = said(seats(root));
      notUsage(out);
      const block = out.split("\n").filter((l) => /\bblock\b/i.test(l));
      assert.ok(block.length, `the answer says nothing about a block: ${out}`);
      assert.ok(
        block.some((l) => l.includes(LANE)),
        `no line about a block names ${LANE} as where it is recorded: ${block.join(" | ")}`,
      );
      // And never the owner's tree, which would be a seat writing in another
      // seat's lane, the thing this whole rule exists to refuse.
      const theirs = (owner.owns ?? [])[0];
      assert.ok(
        !block.some((l) => l.includes(theirs)),
        `a line about a block sends it into ${theirs}: ${block.join(" | ")}`,
      );
    },
  );
});

test("5. the owner and the block are said about the refused path and nothing else", () => {
  const owner = SEATS.find((s) => (s.owns ?? []).includes("bin/**"));
  assert.ok(owner, `no seat owns bin/**: ${JSON.stringify(SEATS)}`);
  scratch(
    "requirement/alpha",
    {
      "bin/kaal.mjs": "//\n// changed\n",
      "requirements/alpha/requirement.md": "# alpha\n## changed\n",
    },
    (root) => {
      const r = seats(root);
      const out = said(r);
      notUsage(out);
      // The witness that both paths reached the wall: one was refused and the
      // other is the analyst's own, so a diff that carried neither would make
      // every assertion below vacuous.
      assert.equal(r.status, 1, `the crossing was let through: ${out}`);
      const crossed = findings(out, "bin/kaal.mjs");
      assert.equal(crossed.length, 1, `one finding about the crossing: ${out}`);
      assert.match(
        crossed[0],
        new RegExp(`\\b${owner.name}\\b`),
        `the finding does not name the owner: ${crossed[0]}`,
      );
      assert.deepEqual(
        findings(out, "requirements/alpha/requirement.md"),
        [],
        `the path its own lane allows was refused too: ${out}`,
      );
      // One negotiation and not one per path: a block is a message to a seat
      // and this diff reached one.
      const block = out.split("\n").filter((l) => /\bblock\b/i.test(l));
      assert.equal(
        block.length,
        1,
        `one line about the block, not ${block.length}: ${block.join(" | ")}`,
      );
    },
  );
});
