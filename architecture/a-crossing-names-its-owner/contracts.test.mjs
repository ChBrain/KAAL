// Contract tests for drawing a-crossing-names-its-owner. One per seam,
// numbered to match. Seams 1 and 2 drive the function directly, because the
// declaration is the input and a scratch repository would only be a way of
// writing one down; seam 3 drives the command, because where a sentence is
// printed is not a thing a function can be asked.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
// Imported inside each seam: a namespace import at the top saves a missing
// export, not a module that fails to load, and one absent file would share
// its red across all three.
const need = async (name) => {
  const mod = await import("../../bin/lib/seats.mjs");
  assert.ok(mod[name], `no ${name} export from seats.mjs`);
  return mod[name];
};
const said = (r) =>
  `${r.error ? `${r.error.message}: ` : ""}${r.stdout ?? ""}${r.stderr ?? ""}`;
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

/** A declaration with three owned trees and one path nobody owns. */
const DECLARED = {
  seats: [
    { name: "analyst", owns: ["requirements/**"] },
    { name: "architect", owns: ["architecture/**"] },
    { name: "developer", owns: ["bin/**", "SURFACE.md"] },
  ],
  lanes: [
    { pattern: "requirement/*", seat: "analyst", allows: [] },
    { pattern: "governance/*", seat: null, allows: ["AGENTS.md"] },
  ],
  shared: ["retros/**"],
};
const LANE = DECLARED.lanes[0];
const NAMES = DECLARED.seats.map((s) => s.name);
const about = (findings, path) =>
  (findings ?? []).filter((f) => f.includes(path));

test("1. a finding says whose path it is, or that it is nobody's", async () => {
  const crossings = await need("crossings");
  const r = crossings(
    ["bin/kaal.mjs", "AGENTS.md", "requirements/alpha/requirement.md"],
    LANE,
    DECLARED,
  );
  // Two refused and one allowed, so the shape the closed task fixed is the
  // ground this stands on and a change to it would be seen here first.
  assert.equal(
    (r.findings ?? []).length,
    2,
    `expected two findings: ${JSON.stringify(r.findings)}`,
  );
  const owned = about(r.findings, "bin/kaal.mjs");
  assert.equal(owned.length, 1, `one finding about the owned path: ${owned}`);
  assert.match(
    owned[0],
    /\bdeveloper\b/,
    `the finding does not name the owner: ${owned[0]}`,
  );
  // The other branch of the same line. Saying nothing is what it does today,
  // so it has to say it: a reader must be able to tell a path nobody owns
  // from a path whose owner the wall forgot to name.
  const nobodys = about(r.findings, "AGENTS.md");
  assert.equal(
    nobodys.length,
    1,
    `one finding about the unowned path: ${nobodys}`,
  );
  assert.match(
    nobodys[0],
    /no seat/i,
    `the finding does not say no seat owns it: ${nobodys[0]}`,
  );
  for (const n of NAMES)
    assert.doesNotMatch(
      nobodys[0],
      new RegExp(`\\b${n}\\b`),
      `the finding names ${n} for a path no seat owns: ${nobodys[0]}`,
    );
  // And both still carry what the closed task fixed.
  for (const f of r.findings) assert.ok(f.includes(LANE.pattern), f);
});

test("2. the wall answers who to ask and where the block is written", async () => {
  const crossings = await need("crossings");
  // Two seats crossed at once, so a sentence that named only the first would
  // be caught, and one line and not two, which is the decision this seam
  // carries.
  const two = crossings(
    ["bin/kaal.mjs", "SURFACE.md", "architecture/alpha/drawing.md"],
    LANE,
    DECLARED,
  );
  assert.equal(
    typeof two.block,
    "string",
    `no block sentence: ${JSON.stringify(two)}`,
  );
  for (const n of ["developer", "architect"])
    assert.match(
      two.block,
      new RegExp(`\\b${n}\\b`),
      `the block does not name ${n}: ${two.block}`,
    );
  assert.ok(
    two.block.includes(LANE.pattern),
    `the block does not name the lane: ${two.block}`,
  );
  // Never the owner's tree: a block recorded there is a seat writing in
  // another seat's lane, which is the thing this whole rule refuses.
  for (const glob of ["bin/**", "architecture/**"])
    assert.ok(
      !two.block.includes(glob),
      `the block sends it into ${glob}: ${two.block}`,
    );
  // Nobody to ask, so nothing to say. A path no seat owns is refused all the
  // same, which is the witness that this is about the owner and not about
  // the refusal.
  const nobodys = crossings(["AGENTS.md"], LANE, DECLARED);
  assert.equal((nobodys.findings ?? []).length, 1, JSON.stringify(nobodys));
  assert.ok(!nobodys.block, `a block with nobody to ask: ${nobodys.block}`);
  // And nothing refused at all.
  const clean = crossings(
    ["requirements/alpha/requirement.md"],
    LANE,
    DECLARED,
  );
  assert.deepEqual(clean.findings ?? [], [], JSON.stringify(clean.findings));
  assert.ok(!clean.block, `a block where nothing was refused: ${clean.block}`);
});

test("3. the board says it once, and never where the question was not asked", () => {
  const kaal = (root, ...args) =>
    spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
      encoding: "utf8",
      cwd: root,
      env: { ...process.env, KAAL_BRANCH: "", KAAL_BASE: "" },
    });
  /** A scratch repository on `branch`, carrying `change` against `release`. */
  const repo = (branch, change, fn) => {
    const root = mkdtempSync(join(tmpdir(), "kaal-own-"));
    try {
      git(root, "init", "--quiet", "-b", "main");
      git(root, "config", "user.email", "fixture@example.invalid");
      git(root, "config", "user.name", "fixture");
      put(root, {
        "kaal.config.json": JSON.stringify(DECLARED, null, 2),
        "AGENTS.md": "# contract\n",
        "bin/kaal.mjs": "//\n",
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
  const blocks = (out) => out.split("\n").filter((l) => /\bblock\b/i.test(l));

  repo("requirement/alpha", { "bin/kaal.mjs": "//\n// changed\n" }, (root) => {
    const r = kaal(root, "seats", root, "--against", "release");
    const out = said(r);
    assert.doesNotMatch(out, /^usage: kaal/m, `no such command: ${out}`);
    assert.equal(r.status, 1, `the crossing was let through: ${out}`);
    const lines = blocks(out);
    assert.equal(
      lines.length,
      1,
      `one block line, not ${lines.length}: ${out}`,
    );
    assert.match(lines[0], /\bdeveloper\b/, lines[0]);
  });
  // A branch no lane holds never asks the question, so there is no lane to
  // record a block in and nothing to print. The witness is that the command
  // still refused the branch, which is the closed task's answer, unmoved.
  repo("wip/whatever", { "bin/kaal.mjs": "//\n// changed\n" }, (root) => {
    const r = kaal(root, "seats", root, "--against", "release");
    const out = said(r);
    assert.equal(r.status, 1, `an unknown branch answered clean: ${out}`);
    assert.ok(out.includes("wip/whatever"), `the branch is not named: ${out}`);
    assert.deepEqual(
      blocks(out),
      [],
      `a block on a branch with no lane: ${out}`,
    );
  });
});
