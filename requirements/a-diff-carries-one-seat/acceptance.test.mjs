// Acceptance tests for requirement a-diff-carries-one-seat. One per
// criterion. Surface only: `kaal seats`, the board's config, `AGENTS.md`, and
// scratch git repositories built here, because a fixture that is a git
// repository cannot be committed inside one.
//
// The lane comes from the branch, so every scratch repository is branched by
// name before the change is written. A fixture that left the branch at main
// would prove the guard reads a diff and say nothing about which lane it read
// it against, which is the whole of what moved in this specification.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const config = () =>
  JSON.parse(readFileSync(join(ROOT, "kaal.config.json"), "utf8"));
const agents = () => readFileSync(join(ROOT, "AGENTS.md"), "utf8");
const kaal = (...args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    encoding: "utf8",
  });
const said = (r) =>
  `${r.error ? `${r.error.message}: ` : ""}${r.stdout}${r.stderr}`;
const notUsage = (out) =>
  assert.doesNotMatch(
    out,
    /^usage: kaal/m,
    `the command does not exist: ${out}`,
  );
const git = (cwd, ...args) => {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(r.status, 0, `git ${args.join(" ")}: ${said(r)}`);
  return r;
};
const put = (root, files) => {
  for (const [rel, text] of Object.entries(files)) {
    const p = join(root, ...rel.split("/"));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  }
};

/**
 * A scratch repository: `base` committed on main, a branch called `branch`
 * checked out, then `change` written over it and left in the working tree,
 * which is the state a person is in when they are about to push. The caller
 * removes it.
 */
function repo(branch, base, change) {
  const root = mkdtempSync(join(tmpdir(), "kaal-seats-"));
  git(root, "init", "--quiet", "-b", "main");
  git(root, "config", "user.email", "fixture@example.invalid");
  git(root, "config", "user.name", "fixture");
  put(root, { "kaal.config.json": JSON.stringify(config(), null, 2), ...base });
  git(root, "add", "-A");
  git(root, "commit", "--quiet", "-m", "base");
  git(root, "checkout", "--quiet", "-b", branch);
  put(root, change);
  return root;
}
const scratch = (branch, base, change, fn) => {
  const root = repo(branch, base, change);
  try {
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};
// A requirement page with the parts the seats question reads. No status
// field: nothing in this tree has carried one since delivery became a report.
const requirement = (name, criteria = "1. It holds.", extra = "") =>
  `---\ntraces:\n  supersedes: nothing\n---\n\n# Requirement: ${name}\n\n` +
  `## Acceptance criteria\n\n${criteria}\n\n## Handoff\n\n- Task: ${name}\n${extra}- People: none\n`;

test("1. the config declares the seats, the lanes and the shared paths, each once", () => {
  const c = config();
  assert.ok(Array.isArray(c.seats), "kaal.config.json declares no seats");
  assert.ok(c.seats.length >= 4, `only ${c.seats.length} seats declared`);
  for (const s of c.seats) {
    assert.ok(s.name, `a seat has no name: ${JSON.stringify(s)}`);
    assert.ok(Array.isArray(s.owns) && s.owns.length, `${s.name} owns nothing`);
  }
  const owned = c.seats.flatMap((s) => s.owns);
  assert.equal(
    new Set(owned).size,
    owned.length,
    `a path is owned twice: ${owned.filter((g, i) => owned.indexOf(g) !== i)}`,
  );
  assert.ok(Array.isArray(c.lanes), "kaal.config.json declares no lanes");
  assert.ok(c.lanes.length >= 4, `only ${c.lanes.length} lanes declared`);
  const names = new Set(c.seats.map((s) => s.name));
  for (const l of c.lanes) {
    assert.ok(l.pattern, `a lane has no pattern: ${JSON.stringify(l)}`);
    // One seat or none. A lane carrying a list is the thing this task exists
    // to make impossible, so the shape refuses it before the tool does.
    assert.ok(
      l.seat === null || l.seat === undefined || typeof l.seat === "string",
      `the lane ${l.pattern} carries more than one seat: ${JSON.stringify(l.seat)}`,
    );
    if (typeof l.seat === "string")
      assert.ok(names.has(l.seat), `the lane ${l.pattern} names no known seat`);
  }
  assert.ok(
    Array.isArray(c.shared) && c.shared.length,
    "kaal.config.json declares no shared paths",
  );
  // And the tool says so rather than trusting the page, on both halves: two
  // seats claiming one path, and a lane claiming two seats.
  for (const [what, bad, named] of [
    [
      "two seats owning one path",
      {
        seats: [
          { name: "analyst", owns: ["requirements/**"] },
          { name: "architect", owns: ["requirements/**"] },
        ],
      },
      /requirements\/\*\*/,
    ],
    [
      "a lane carrying two seats",
      { lanes: [{ pattern: "both/*", seat: ["analyst", "architect"] }] },
      /both\/\*/,
    ],
  ]) {
    scratch("governance/x", { "a.md": "one" }, {}, (root) => {
      writeFileSync(
        join(root, "kaal.config.json"),
        JSON.stringify({ ...config(), ...bad }, null, 2),
      );
      const r = kaal("seats", root, "--against", "main");
      notUsage(said(r));
      assert.equal(r.status, 1, `${what} passed: ${said(r)}`);
      assert.match(said(r), named, `${what}: not named: ${said(r)}`);
    });
  }
});

test("2. it reads the branch and a diff against a base ref, and refuses a ref it cannot resolve", () => {
  scratch(
    "build/alpha",
    { "bin/kaal.mjs": "// base\n" },
    { "bin/kaal.mjs": "// changed\n", "bin/lib/one.mjs": "// new\n" },
    (root) => {
      const r = kaal("seats", root, "--against", "main");
      const out = said(r);
      notUsage(out);
      // The lane it read, by name, so a reader never has to guess which
      // declaration the finding was measured against.
      assert.match(out, /build\/alpha|build\/\*/, `no lane is named: ${out}`);
      // Counted on the line's own word and not on the seat's name: the
      // lane line names its seat too, and a test that matched the name
      // alone would count the lane as a seat. The stand-in found that.
      const lines = out.split("\n").filter((l) => /^seat /.test(l));
      assert.deepEqual(
        lines,
        ["seat developer"],
        `expected one seat line for the one seat touched and got: ${out}`,
      );
      // A base ref that names nothing is not this tree's question, on its
      // own exit code, so a caller reading the code never takes it for a pass.
      const nowhere = kaal("seats", root, "--against", "no-such-ref");
      notUsage(said(nowhere));
      assert.equal(
        nowhere.status,
        2,
        `an unresolvable base answered ${nowhere.status}: ${said(nowhere)}`,
      );
    },
  );
});

test("3. a path its lane does not allow is a finding, and a lane that allows every path is not", () => {
  // A drawing on a build's branch. Another seat owns it, and the lane is what
  // refuses it.
  scratch(
    "build/alpha",
    {
      "bin/kaal.mjs": "// base\n",
      "architecture/alpha/drawing.md": "# base\n",
    },
    {
      "bin/kaal.mjs": "// changed\n",
      "architecture/alpha/drawing.md": "# changed\n",
    },
    (root) => {
      const r = kaal("seats", root, "--against", "main");
      const out = said(r);
      notUsage(out);
      assert.equal(r.status, 1, `a path outside the lane passed: ${out}`);
      assert.ok(
        out.includes("architecture/alpha/drawing.md"),
        `the path is not named: ${out}`,
      );
      assert.match(
        out,
        /build\/alpha|build\/\*/,
        `the lane is not named: ${out}`,
      );
    },
  );
  // A path no seat owns at all, which the first specification called free and
  // this one calls a finding unless it is shared. `deploy/` is owned by
  // nobody and is not in the shared list.
  scratch(
    "build/alpha",
    { "bin/kaal.mjs": "// base\n" },
    { "bin/kaal.mjs": "// changed\n", "deploy/notes.md": "unowned\n" },
    (root) => {
      const r = kaal("seats", root, "--against", "main");
      const out = said(r);
      notUsage(out);
      assert.equal(r.status, 1, `an unowned path was free: ${out}`);
      assert.ok(out.includes("deploy/notes.md"), `not named: ${out}`);
    },
  );
  // And the other way: a diff whose every path is the lane's seat's or
  // shared is clean, whatever else it carries. A retro is shared and every
  // seat writes one.
  scratch(
    "build/alpha",
    { "bin/kaal.mjs": "// base\n" },
    {
      "bin/kaal.mjs": "// changed\n",
      "retros/2026-01-01-code-first-use.md": "# Retrospective\n",
    },
    (root) => {
      const r = kaal("seats", root, "--against", "main");
      notUsage(said(r));
      assert.equal(
        r.status,
        0,
        `a lane's own path plus a shared one was refused: ${said(r)}`,
      );
    },
  );
});

test("4. a branch matching no lane is a finding naming the branch and the lanes", () => {
  scratch(
    "wip/whatever",
    { "bin/kaal.mjs": "// base\n" },
    { "bin/kaal.mjs": "// changed\n" },
    (root) => {
      const r = kaal("seats", root, "--against", "main");
      const out = said(r);
      notUsage(out);
      // The diff itself is one seat and would pass under any lane. What is
      // refused is the branch, so a guard that answered clean here would be
      // passing on a declaration nobody made.
      assert.equal(r.status, 1, `an unknown branch answered clean: ${out}`);
      assert.ok(
        out.includes("wip/whatever"),
        `the branch is not named: ${out}`,
      );
      const patterns = config().lanes ?? [];
      assert.ok(patterns.length, "no lanes declared to be listed");
      for (const l of patterns)
        assert.ok(
          out.includes(l.pattern),
          `the lane ${l.pattern} is not offered: ${out}`,
        );
    },
  );
});

test("5. a proof its seat did not write is a finding naming the file, unless a supersede is declared", () => {
  const base = {
    "bin/kaal.mjs": "// base\n",
    "requirements/alpha/requirement.md": requirement("alpha"),
    "requirements/alpha/acceptance.test.mjs": "// base\n",
    "requirements/alpha/fixtures/one/note.md": "base\n",
    "architecture/alpha/contracts.test.mjs": "// base\n",
  };
  for (const [what, change] of [
    [
      "an acceptance test",
      { "requirements/alpha/acceptance.test.mjs": "// edited\n" },
    ],
    [
      "a fixture of a requirement",
      { "requirements/alpha/fixtures/one/note.md": "edited\n" },
    ],
    [
      "a contract test",
      { "architecture/alpha/contracts.test.mjs": "// edited\n" },
    ],
  ]) {
    scratch(
      "build/alpha",
      base,
      { "bin/kaal.mjs": "// changed\n", ...change },
      (root) => {
        const r = kaal("seats", root, "--against", "main");
        const out = said(r);
        notUsage(out);
        assert.equal(
          r.status,
          1,
          `${what} was edited by another seat and passed: ${out}`,
        );
        // The path, looked for literally. Escaping one into a pattern is a
        // list of characters somebody has to keep complete, and mine was
        // missing the backslash, which is the one a path is most likely to
        // carry. Nothing here needs a pattern.
        assert.ok(
          out.includes(Object.keys(change)[0]),
          `${what}: the file is not named: ${out}`,
        );
      },
    );
  }
  // The escape, and it is a declaration rather than a flag: a requirement in
  // the same diff says which task's claim moved, where the trace wall reads
  // it. The lane is the analyst's, because moving a proof is analyst work and
  // the escape excuses the proof rule and never the lane.
  scratch(
    "requirement/beta",
    base,
    {
      "requirements/alpha/acceptance.test.mjs": "// edited\n",
      "requirements/beta/requirement.md": requirement(
        "beta",
        "1. It holds.",
        "- Supersedes: `alpha`, whose second criterion moved\n",
      ).replace("supersedes: nothing", "supersedes: alpha"),
    },
    (root) => {
      const r = kaal("seats", root, "--against", "main");
      notUsage(said(r));
      assert.equal(r.status, 0, `a declared supersede was refused: ${said(r)}`);
    },
  );
});

test("6. the board runs it, and its fix says to split the diff or rename the branch", () => {
  const gate = config().gates.find((g) => /seats/.test(g.command ?? ""));
  assert.ok(
    gate,
    `no gate runs the seats question: ${config().gates.map((g) => g.name)}`,
  );
  assert.match(
    gate.fix ?? "",
    /split/i,
    `the fix does not say to split: ${gate.fix}`,
  );
  assert.match(
    gate.fix ?? "",
    /rename/i,
    `the fix does not say to rename: ${gate.fix}`,
  );
  // And it is not a wall that widens the declaration to go green.
  assert.doesNotMatch(
    gate.fix ?? "",
    /add .*(seat|lane|glob|own|shared)/i,
    `the fix invites widening: ${gate.fix}`,
  );
});

test("7. AGENTS.md names the same seats and lanes as the config, and no lane carrying two", () => {
  const page = agents();
  const c = config();
  // Asserted rather than iterated: a missing declaration is criterion 1's
  // finding, and a test that throws on it is red for its own defect.
  assert.ok(
    Array.isArray(c.seats) && c.seats.length,
    "kaal.config.json declares no seats to compare against",
  );
  assert.ok(
    Array.isArray(c.lanes) && c.lanes.length,
    "kaal.config.json declares no lanes to compare against",
  );
  for (const s of c.seats)
    assert.match(
      page,
      new RegExp(`\\b${s.name}\\b`),
      `AGENTS.md does not name the seat ${s.name}`,
    );
  for (const l of c.lanes) {
    // The pattern's own prefix, because the page writes `requirement/<task>`
    // where the config writes `requirement/*`, and the part that has to agree
    // is the lane and not the placeholder.
    const prefix = l.pattern.split("/")[0];
    assert.ok(
      page.includes(prefix + "/"),
      `AGENTS.md does not name the lane ${l.pattern}`,
    );
  }
  // The page said a task's lane is "a requirement with its drawing and
  // build", which is three seats in one branch by definition.
  assert.doesNotMatch(
    page.replace(/\s+/g, " "),
    /a requirement with its drawing and build/i,
    "AGENTS.md still names a lane that carries three seats",
  );
});
