// Contract tests for drawing a-diff-carries-one-seat. One per seam, numbered
// to match. Each drives the seam's own function on a scratch git repository,
// because a fixture that is a repository cannot be committed inside one, and
// knows nothing of what is behind the function it calls.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  readFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
// Imported inside each seam: a namespace import at the top saves a missing
// export, not a module that fails to load, and one absent file would share
// its red across all five.
const need = async (name) => {
  const mod = await import("../../bin/lib/seats.mjs");
  assert.ok(mod[name], `no ${name} export from seats.mjs`);
  return mod[name];
};
const git = (cwd, ...args) => {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(r.status, 0, `git ${args.join(" ")}: ${r.stdout}${r.stderr}`);
  return r;
};
const put = (root, files) => {
  for (const [rel, text] of Object.entries(files)) {
    const p = join(root, ...rel.split("/"));
    // A null is a removal, which is how a rename is written here: the path it
    // left and the path it arrived at, because that is what the diff says.
    if (text === null) {
      rmSync(p, { force: true });
      continue;
    }
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  }
};
const SEATS = [
  { name: "analyst", owns: ["requirements/**"] },
  { name: "architect", owns: ["architecture/**"] },
  { name: "tester", owns: ["tests/**"] },
  { name: "developer", owns: ["bin/**"] },
];
const config = (seats = SEATS) => JSON.stringify({ seats, gates: [] }, null, 2);
/** `base` committed, then `change` written over it and left in the tree. */
function repo(base, change = {}, seats = SEATS) {
  const root = mkdtempSync(join(tmpdir(), "kaal-seat-"));
  git(root, "init", "--quiet", "-b", "main");
  git(root, "config", "user.email", "fixture@example.invalid");
  git(root, "config", "user.name", "fixture");
  put(root, { "kaal.config.json": config(seats), ...base });
  git(root, "add", "-A");
  git(root, "commit", "--quiet", "-m", "base");
  put(root, change);
  return root;
}
const scratch = async (base, change, fn, seats = SEATS) => {
  const root = repo(base, change, seats);
  try {
    return await fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};
const requirement = (name, criteria, handoff) =>
  `---\ntraces:\n  supersedes: nothing\n---\n\n# Requirement: ${name}\n\n` +
  `## Acceptance criteria\n\n${criteria}\n\n## Handoff\n\n- Task: ${name}\n${handoff}\n`;
const says = (findings) =>
  findings.map((f) => `${f.artefact ?? ""}: ${f.message ?? f}`).join(" | ");
// The same, narrowed to one kind. Seam 5 asks whether a proof was named as a
// proof, and a crossing finding names the same path for a different reason:
// reading them together let seam 5 pass on seam 3's answer, and the break
// that should have reddened it reddened nothing.
const saysOf = (findings, kind) =>
  says(findings.filter((f) => f.kind === kind));

test("1. the seats table: one seat per glob, and a glob two seats claim is a finding", async () => {
  const readSeats = await need("readSeats");
  const seatOf = await need("seatOf");
  await scratch({ "a.md": "one" }, {}, (root) => {
    const { seats, findings } = readSeats(root);
    assert.deepEqual(
      seats.map((s) => s.name),
      ["analyst", "architect", "tester", "developer"],
      "the declaration was not read back",
    );
    assert.deepEqual(
      findings,
      [],
      `a sound declaration was a finding: ${says(findings)}`,
    );
    // A path no seat claims answers no seat, which is an answer.
    assert.equal(seatOf("README.md", seats), null);
    assert.equal(seatOf("bin/lib/x.mjs", seats), "developer");
    assert.equal(seatOf("requirements/a/requirement.md", seats), "analyst");
  });
  // And two seats claiming one glob is the config being wrong, named by glob.
  const twice = [
    { name: "analyst", owns: ["requirements/**"] },
    { name: "architect", owns: ["requirements/**"] },
  ];
  await scratch(
    { "a.md": "one" },
    {},
    (root) => {
      const { findings } = readSeats(root);
      assert.ok(findings.length, "a glob owned twice was not a finding");
      assert.match(
        says(findings),
        /requirements\/\*\*/,
        `the glob is not named: ${says(findings)}`,
      );
    },
    twice,
  );
});

test("2. the diff: the paths that differ, and nothing at all for a ref that names no commit", async () => {
  const paths = await need("paths");
  await scratch(
    { "bin/kaal.mjs": "// base\n" },
    { "bin/kaal.mjs": "// changed\n", "tests/a.test.mjs": "// new\n" },
    (root) => {
      const got = paths(root, "main");
      assert.ok(Array.isArray(got), `a readable base answered ${got}`);
      assert.deepEqual(
        [...got].sort(),
        ["bin/kaal.mjs", "tests/a.test.mjs"],
        `the diff read ${got}`,
      );
      // Not an empty list: an empty diff and an unreadable base are different
      // answers, and a caller that cannot tell them apart calls a broken ref
      // a clean tree.
      assert.equal(
        paths(root, "no-such-ref"),
        null,
        "a base that names no commit answered a list",
      );
    },
  );
});

test("3. the crossing: one seat is silent, two are a finding naming each seat and a path", async () => {
  const checkSeats = await need("checkSeats");
  await scratch(
    {
      "bin/kaal.mjs": "// base\n",
      "architecture/alpha/drawing.md": "# base\n",
    },
    {
      "bin/kaal.mjs": "// changed\n",
      "architecture/alpha/drawing.md": "# changed\n",
    },
    (root) => {
      const out = says(checkSeats(root, "main"));
      assert.match(out, /\bdeveloper\b/, `the developer is not named: ${out}`);
      assert.match(out, /\barchitect\b/, `the architect is not named: ${out}`);
      assert.ok(
        out.includes("bin/kaal.mjs"),
        `no path for the developer: ${out}`,
      );
      assert.ok(
        out.includes("architecture/alpha/drawing.md"),
        `no path for the architect: ${out}`,
      );
    },
  );
  await scratch(
    { "bin/kaal.mjs": "// base\n" },
    {
      "bin/kaal.mjs": "// changed\n",
      "README.md": "unowned\n",
      "retros/x.md": "unowned\n",
    },
    (root) => {
      const findings = checkSeats(root, "main");
      assert.deepEqual(
        findings,
        [],
        `one seat and unowned paths was a finding: ${says(findings)}`,
      );
    },
  );
  // A rename is one act and belongs where it lands. The diff reports it as a
  // path gone from the tester and a path arrived at the developer, and this
  // is the very move the seat rule exists to cause.
  await scratch(
    { "tests/a.test.mjs": "// a case\n" },
    { "tests/a.test.mjs": null, "bin/lib/a.test.mjs": "// a case\n" },
    (root) => {
      const findings = checkSeats(root, "main");
      assert.deepEqual(
        findings,
        [],
        `a case moved beside its code was a crossing: ${says(findings)}`,
      );
    },
  );
});

test("4. the section: a Handoff that moved and criteria that did not are different answers", async () => {
  const sectionsChanged = await need("sectionsChanged");
  const path = "requirements/alpha/requirement.md";
  const base = {
    [path]: requirement("alpha", "1. It holds.", "- Status: open"),
  };
  await scratch(
    base,
    { [path]: requirement("alpha", "1. It holds.", "- Status: closed") },
    (root) => {
      const moved = sectionsChanged(root, "main", path);
      assert.ok(
        moved.includes("Handoff"),
        `the Handoff is not named: ${moved}`,
      );
      assert.ok(
        !moved.includes("Acceptance criteria"),
        `the criteria are named and did not move: ${moved}`,
      );
    },
  );
  await scratch(
    base,
    {
      [path]: requirement(
        "alpha",
        "1. It holds differently.",
        "- Status: open",
      ),
    },
    (root) => {
      const moved = sectionsChanged(root, "main", path);
      assert.ok(
        moved.includes("Acceptance criteria"),
        `the criteria moved and are not named: ${moved}`,
      );
    },
  );
});

test("5. the proof: changed by another seat is a finding naming the file, unless a supersede says so", async () => {
  const checkSeats = await need("checkSeats");
  const base = {
    "bin/kaal.mjs": "// base\n",
    "requirements/alpha/requirement.md": requirement(
      "alpha",
      "1. It holds.",
      "- Status: closed",
    ),
    "requirements/alpha/acceptance.test.mjs": "// base\n",
    "requirements/alpha/fixtures/one/note.md": "base\n",
    "architecture/alpha/contracts.test.mjs": "// base\n",
  };
  for (const proof of [
    "requirements/alpha/acceptance.test.mjs",
    "requirements/alpha/fixtures/one/note.md",
    "architecture/alpha/contracts.test.mjs",
  ]) {
    await scratch(
      base,
      { "bin/kaal.mjs": "// changed\n", [proof]: "// edited\n" },
      (root) => {
        const out = saysOf(checkSeats(root, "main"), "proof");
        assert.ok(
          out.includes(proof),
          `the proof is not named as a proof: ${out}`,
        );
      },
    );
  }
  // The escape: a requirement in the same diff naming the task whose proof
  // moved, in its trace and in its prose, which is what the trace wall reads.
  await scratch(
    base,
    {
      // One seat, because the escape is about the proof rule and a diff that
      // also crosses seats is still a crossing. Superseding another task's
      // proof is the analyst's act and belongs in the analyst's diff.
      "requirements/alpha/acceptance.test.mjs": "// edited\n",
      "requirements/beta/requirement.md":
        `---\ntraces:\n  supersedes: alpha\n---\n\n# Requirement: beta\n\n` +
        `## Acceptance criteria\n\n1. It holds.\n\n## Handoff\n\n- Task: beta\n` +
        `- Status: closed\n- Supersedes: \`alpha\`, whose first criterion moved\n`,
    },
    (root) => {
      const out = saysOf(checkSeats(root, "main"), "proof");
      assert.ok(
        !out.includes("requirements/alpha/acceptance.test.mjs"),
        `a declared supersede was still a proof finding: ${out}`,
      );
    },
  );
});
