// Acceptance tests for requirement a-diff-carries-one-seat. One per
// criterion. Surface only: `kaal seats`, the board's config, `AGENTS.md`, and
// scratch git repositories built here, because a fixture that is a git
// repository cannot be committed inside one.
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
 * A scratch repository: `base` committed, then `change` written over it and
 * left in the working tree, which is the state a person is in when they are
 * about to push. The caller removes it.
 */
function repo(base, change) {
  const root = mkdtempSync(join(tmpdir(), "kaal-seats-"));
  git(root, "init", "--quiet", "-b", "main");
  git(root, "config", "user.email", "fixture@example.invalid");
  git(root, "config", "user.name", "fixture");
  put(root, { "kaal.config.json": JSON.stringify(config(), null, 2), ...base });
  git(root, "add", "-A");
  git(root, "commit", "--quiet", "-m", "base");
  put(root, change);
  return root;
}
const scratch = (base, change, fn) => {
  const root = repo(base, change);
  try {
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};
// A requirement page with the parts the seats question reads.
const requirement = (
  name,
  criteria = "1. It holds.",
  handoff = "- Status: open",
) =>
  `---\ntraces:\n  supersedes: nothing\n---\n\n# Requirement: ${name}\n\n` +
  `## Acceptance criteria\n\n${criteria}\n\n## Handoff\n\n- Task: ${name}\n${handoff}\n- People: none\n`;

test("1. each seat's paths are declared once in the config, and a path owned by two is a finding", () => {
  const seats = config().seats;
  assert.ok(Array.isArray(seats), "kaal.config.json declares no seats");
  assert.ok(seats.length >= 4, `only ${seats.length} seats declared`);
  for (const s of seats) {
    assert.ok(s.name, `a seat has no name: ${JSON.stringify(s)}`);
    assert.ok(Array.isArray(s.owns) && s.owns.length, `${s.name} owns nothing`);
  }
  const owned = seats.flatMap((s) => s.owns);
  assert.equal(
    new Set(owned).size,
    owned.length,
    `a glob is owned twice: ${owned.filter((g, i) => owned.indexOf(g) !== i)}`,
  );
  // And the tool says so rather than trusting the page: two seats claiming
  // one glob is the config being wrong, which is a finding and not a crash.
  const twice = {
    ...config(),
    seats: [
      { name: "analyst", owns: ["requirements/**"] },
      { name: "architect", owns: ["requirements/**"] },
    ],
  };
  scratch({ "a.md": "one" }, {}, (root) => {
    writeFileSync(
      join(root, "kaal.config.json"),
      JSON.stringify(twice, null, 2),
    );
    const r = kaal("seats", root, "--against", "main");
    notUsage(said(r));
    assert.equal(r.status, 1, `two seats owning one glob passed: ${said(r)}`);
    assert.match(
      said(r),
      /requirements\/\*\*/,
      `the glob is not named: ${said(r)}`,
    );
  });
});

test("2. it reads a diff against a base ref, names the seats it touches, and refuses a ref it cannot resolve", () => {
  scratch(
    { "bin/kaal.mjs": "// base\n" },
    { "bin/kaal.mjs": "// changed\n", "tests/a.test.mjs": "// new\n" },
    (root) => {
      const r = kaal("seats", root, "--against", "main");
      const out = said(r);
      notUsage(out);
      // One line per seat, so a reader counts lines rather than parsing prose.
      const lines = out
        .split("\n")
        .filter((l) => /\b(developer|tester)\b/.test(l));
      assert.equal(lines.length, 2, `expected a line per seat and got: ${out}`);
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

test("3. a diff touching two seats is a finding naming both, and one path for each", () => {
  scratch(
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
      assert.equal(r.status, 1, `a diff across two seats passed: ${out}`);
      assert.match(out, /\bdeveloper\b/, `the developer is not named: ${out}`);
      assert.match(out, /\barchitect\b/, `the architect is not named: ${out}`);
      assert.match(
        out,
        /bin\/kaal\.mjs/,
        `no path is named for the developer: ${out}`,
      );
      assert.match(
        out,
        /architecture\/alpha\/drawing\.md/,
        `no path is named for the architect: ${out}`,
      );
    },
  );
  // One seat is not a finding, whatever else the diff carries: a path no
  // seat owns is nobody's crossing.
  scratch(
    { "bin/kaal.mjs": "// base\n" },
    {
      "bin/kaal.mjs": "// changed\n",
      "README.md": "unowned\n",
      "retros/x.md": "unowned\n",
    },
    (root) => {
      const r = kaal("seats", root, "--against", "main");
      notUsage(said(r));
      assert.equal(
        r.status,
        0,
        `one seat plus unowned paths was refused: ${said(r)}`,
      );
    },
  );
});

test("4. a build may close the requirement it builds, and may not move its criteria", () => {
  const base = {
    "bin/kaal.mjs": "// base\n",
    "requirements/alpha/requirement.md": requirement("alpha"),
  };
  scratch(
    base,
    {
      "bin/kaal.mjs": "// changed\n",
      // The Handoff moved and the criteria did not: this is a build closing
      // its own task, which every build in this league does.
      "requirements/alpha/requirement.md": requirement(
        "alpha",
        "1. It holds.",
        "- Status: closed",
      ),
    },
    (root) => {
      const r = kaal("seats", root, "--against", "main");
      notUsage(said(r));
      assert.equal(
        r.status,
        0,
        `a build closing its own requirement was refused: ${said(r)}`,
      );
    },
  );
  scratch(
    base,
    {
      "bin/kaal.mjs": "// changed\n",
      // The criteria moved: that is the analyst's, and moving it beside the
      // code that answers it is the thing this task exists to refuse.
      "requirements/alpha/requirement.md": requirement(
        "alpha",
        "1. It holds differently.",
      ),
    },
    (root) => {
      const r = kaal("seats", root, "--against", "main");
      const out = said(r);
      assert.equal(
        r.status,
        1,
        `a build moving its own criteria passed: ${out}`,
      );
      assert.match(
        out,
        /Acceptance criteria/i,
        `the section is not named: ${out}`,
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
    scratch(base, { "bin/kaal.mjs": "// changed\n", ...change }, (root) => {
      const r = kaal("seats", root, "--against", "main");
      const out = said(r);
      notUsage(out);
      assert.equal(
        r.status,
        1,
        `${what} was edited by another seat and passed: ${out}`,
      );
      assert.match(
        out,
        new RegExp(Object.keys(change)[0].replace(/[.*/]/g, "\\$&")),
        `${what}: the file is not named: ${out}`,
      );
    });
  }
  // The escape, and it is a declaration rather than a flag: a requirement in
  // the same diff says which task's claim moved, where the trace wall reads it.
  scratch(
    base,
    {
      "bin/kaal.mjs": "// changed\n",
      "requirements/alpha/acceptance.test.mjs": "// edited\n",
      "requirements/beta/requirement.md":
        `---\ntraces:\n  supersedes: alpha\n---\n\n# Requirement: beta\n\n` +
        `## Acceptance criteria\n\n1. It holds.\n\n## Handoff\n\n- Task: beta\n- Status: closed\n` +
        `- Supersedes: \`alpha\`, whose second criterion moved\n- People: none\n`,
    },
    (root) => {
      const r = kaal("seats", root, "--against", "main");
      notUsage(said(r));
      assert.equal(r.status, 0, `a declared supersede was refused: ${said(r)}`);
    },
  );
});

test("6. the board runs it, and its fix says to split the diff", () => {
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
  // And it is not a wall that widens the declaration to go green.
  assert.doesNotMatch(
    gate.fix ?? "",
    /add .*(seat|glob|own)/i,
    `the fix invites widening: ${gate.fix}`,
  );
});

test("7. AGENTS.md names the same seats and no lane that carries more than one", () => {
  const page = agents();
  const seats = config().seats;
  // Asserted rather than iterated: a missing declaration is criterion 1's
  // finding, and a test that throws on it is red for its own defect.
  assert.ok(
    Array.isArray(seats),
    "kaal.config.json declares no seats to compare against",
  );
  for (const s of seats)
    assert.match(
      page,
      new RegExp(`\\b${s.name}\\b`),
      `AGENTS.md does not name the seat ${s.name}`,
    );
  // The page said a task's lane is "a requirement with its drawing and
  // build", which is three seats in one branch by definition.
  assert.doesNotMatch(
    page.replace(/\s+/g, " "),
    /a requirement with its drawing and build/i,
    "AGENTS.md still names a lane that carries three seats",
  );
});
