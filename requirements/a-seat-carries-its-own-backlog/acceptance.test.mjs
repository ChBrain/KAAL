// Acceptance tests for requirement a-seat-carries-its-own-backlog. One per
// criterion. Surface only: `kaal backlog`, the packed tarball, and the two
// pages a reader is pointed at, on scratch trees where a declaration and six
// files have to be real.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
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
const put = (root, files) => {
  for (const [rel, text] of Object.entries(files)) {
    const p = join(root, ...rel.split("/"));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  }
};
const kaal = (...args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    encoding: "utf8",
    env: { ...process.env, KAAL_BRANCH: "", KAAL_BASE: "" },
  });

const SEATS = config().seats;
const NAMES = SEATS.map((s) => s.name);
/** The kinds a block may name, declared beside the seats and the lanes. */
const KINDS = config().blocks ?? [];
/** The tree a seat owns, read off its first glob, which is where its page goes. */
const treeOf = (seat) => String((seat.owns ?? [])[0]).split("/")[0];

/** A backlog page: a `blocks:` block in frontmatter, keyed `<seat>/<task>`. */
const page = (entries) =>
  `---\nblocks:\n${entries.map((e) => `  ${e}\n`).join("")}---\n\n# Backlog\n`;

/** A scratch tree carrying the real declaration and whatever else is named. */
const scratch = (files, fn) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-backlog-"));
  try {
    put(root, { "kaal.config.json": JSON.stringify(config(), null, 2) });
    // A page for every declared seat, so a command that read five of six
    // would be caught by the criterion about paths and not by an absence.
    for (const s of SEATS) put(root, { [`${treeOf(s)}/backlog.md`]: page([]) });
    put(root, files);
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};
/** Every file under a tree, with its bytes, for the criterion about writing. */
const snapshot = (root) => {
  const out = {};
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else out[p] = readFileSync(p, "utf8");
    }
  };
  walk(root);
  return out;
};

test("1. each seat's backlog is one page inside that seat's own tree", () => {
  assert.ok(SEATS.length, "no seats declared to read a page for");
  scratch({}, (root) => {
    const r = kaal("backlog", root);
    const out = said(r);
    notUsage(out);
    for (const s of SEATS) {
      const path = `${treeOf(s)}/backlog.md`;
      assert.ok(
        out.includes(path),
        `the answer does not name ${s.name}'s page ${path}: ${out}`,
      );
    }
    // And nothing outside them. A page named that no seat owns would be a
    // seventh declaration of where a backlog lives.
    const trees = SEATS.map(treeOf);
    for (const named of out.match(/[\w.-]+\/backlog\.md/g) ?? [])
      assert.ok(
        trees.includes(named.split("/")[0]),
        `the answer reads ${named}, which is no seat's tree: ${out}`,
      );
  });
});

test("2. an entry names the seat that owes it and a kind the declaration holds", () => {
  // The vocabulary is declared, because a kind that lives only in prose is a
  // list nothing can check. Asserted first: an empty one would make every
  // entry below a finding for the wrong reason.
  assert.ok(
    Array.isArray(KINDS) && KINDS.length,
    "kaal.config.json declares no block kinds to check an entry against",
  );
  const kind = KINDS[0];
  const stranger = "nobody";
  assert.ok(!NAMES.includes(stranger), `${stranger} is a declared seat`);
  scratch(
    { "architecture/backlog.md": page([`${stranger}/alpha: ${kind}`]) },
    (root) => {
      const r = kaal("backlog", root);
      const out = said(r);
      notUsage(out);
      assert.equal(r.status, 1, `a seat nobody declared was accepted: ${out}`);
      assert.ok(
        out.includes("architecture/backlog.md"),
        `the page is not named: ${out}`,
      );
      assert.ok(out.includes("alpha"), `the key is not named: ${out}`);
    },
  );
  // And a kind nobody declared, on a seat that is declared, so neither half
  // can pass for the other.
  const unknown = "the weather";
  assert.ok(!KINDS.includes(unknown), `${unknown} is a declared kind`);
  scratch(
    { "architecture/backlog.md": page([`analyst/alpha: ${unknown}`]) },
    (root) => {
      const r = kaal("backlog", root);
      const out = said(r);
      notUsage(out);
      assert.equal(r.status, 1, `a kind nobody declared was accepted: ${out}`);
      assert.ok(out.includes("alpha"), `the key is not named: ${out}`);
    },
  );
});

test("3. the answer is what is blocked, grouped by the seat that owes it, and what is clear", () => {
  scratch(
    {
      "architecture/backlog.md": page([`analyst/alpha: ${KINDS[0]}`]),
      "bin/backlog.md": page([
        `analyst/beta: ${KINDS[0]}`,
        `architect/beta: ${KINDS[0]}`,
      ]),
    },
    (root) => {
      const r = kaal("backlog", root);
      const out = said(r);
      notUsage(out);
      // Grouped, so the seat that owes the work is said once over the tasks
      // it owes and not only inside each line. What that line looks like is
      // not this criterion's business, so it is told by what it does not
      // carry: a heading names the seat and no task.
      const lines = out.split("\n");
      for (const n of ["analyst", "architect"])
        assert.ok(
          lines.some((l) => l.includes(n) && !/\b(alpha|beta)\b/.test(l)),
          `nothing groups the blocks by ${n}: ${out}`,
        );
      // A task blocked by two seats is named under each, or the second block
      // on one task would be lost.
      assert.ok(
        (out.match(/\bbeta\b/g) ?? []).length >= 2,
        `beta is blocked by two seats and named once: ${out}`,
      );
      assert.match(out, /\bclear\b/i, `the answer has no clear set: ${out}`);
    },
  );
});

test("4. a block whose need the tree already meets does not stand", () => {
  const blocked = {
    "architecture/backlog.md": page([`analyst/alpha: ${KINDS[0]}`]),
  };
  // The same page twice, and the only difference is the tree under it.
  scratch(blocked, (root) => {
    const out = said(kaal("backlog", root));
    notUsage(out);
    assert.match(
      out,
      /blocked[\s\S]*\balpha\b/i,
      `the block is not in the blocked set while its need is unmet: ${out}`,
    );
  });
  scratch(
    { ...blocked, "requirements/alpha/requirement.md": "# alpha\n" },
    (root) => {
      const before = readFileSync(
        join(root, "architecture", "backlog.md"),
        "utf8",
      );
      const out = said(kaal("backlog", root));
      notUsage(out);
      assert.doesNotMatch(
        out,
        /blocked[\s\S]*\balpha\b/,
        `a block whose need is met still stands: ${out}`,
      );
      assert.equal(
        readFileSync(join(root, "architecture", "backlog.md"), "utf8"),
        before,
        "the page was edited to clear the block",
      );
    },
  );
});

test("5. the command writes nothing", () => {
  scratch(
    {
      "architecture/backlog.md": page([`analyst/alpha: ${KINDS[0]}`]),
      "requirements/alpha/requirement.md": "# alpha\n",
    },
    (root) => {
      const before = snapshot(root);
      const r = kaal("backlog", root);
      const out = said(r);
      notUsage(out);
      // The witness that it did its work: it read the pages and answered
      // about them, so a command that wrote nothing by doing nothing would
      // not pass this.
      assert.ok(
        out.includes("architecture/backlog.md"),
        `it read nothing: ${out}`,
      );
      assert.deepEqual(snapshot(root), before, "a file under the tree changed");
    },
  );
});

test("6. AGENTS.md carries the table, a row per seat, no remedy column, and every declared kind", () => {
  const doc = readFileSync(join(ROOT, "AGENTS.md"), "utf8");
  const rows = doc.split("\n").filter((l) => /^\|/.test(l));
  assert.ok(rows.length, "AGENTS.md carries no table at all");
  // The header of the table this criterion is about, told from any other by
  // the two things it must say.
  const header = rows.find((l) => /exists/i.test(l) && /blocked/i.test(l));
  assert.ok(
    header,
    `no header says when work exists and when it is blocked: ${rows.join("\n")}`,
  );
  const columns = header
    .split("|")
    .map((c) => c.trim())
    .filter(Boolean);
  for (const word of ["fix", "remedy", "how"])
    assert.ok(
      !columns.some((c) => new RegExp(`\\b${word}\\b`, "i").test(c)),
      `the table carries a ${word} column: ${header}`,
    );
  for (const n of NAMES)
    assert.ok(
      rows.some((l) => new RegExp(`\\|\\s*${n}\\s*\\|`).test(l)),
      `the table has no row for ${n}`,
    );
  // The doctrine and the declaration say the same thing, or one is wrong.
  // In the page and not forced into a cell: which of the two columns a kind
  // belongs in is the table's business and not this criterion's.
  assert.ok(KINDS.length, "kaal.config.json declares no block kinds");
  for (const k of KINDS)
    assert.ok(doc.includes(k), `AGENTS.md does not name the kind ${k}`);
});

test("7. no backlog reaches a consumer", () => {
  const manifest = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  const files = manifest.files ?? [];
  assert.ok(files.length, "the manifest names no files to pack");
  // The positive half, because a tarball carrying no backlog while no
  // backlog exists proves nothing. The manifest already carries an exclusion
  // of exactly this shape for the test files.
  assert.ok(
    files.some((f) => /^!.*backlog\.md$/.test(String(f))),
    `the manifest does not exclude a backlog: ${JSON.stringify(files)}`,
  );
  const packed = spawnSync(
    "npm",
    ["pack", "--dry-run", "--json", "--ignore-scripts"],
    { cwd: ROOT, encoding: "utf8" },
  );
  assert.equal(packed.status, 0, `npm pack: ${said(packed)}`);
  const packedFiles = JSON.parse(packed.stdout)[0].files.map((f) => f.path);
  assert.ok(
    packedFiles.length > 1,
    `the tarball carries ${packedFiles.length} files`,
  );
  const shipped = packedFiles.filter((p) => /(^|\/)backlog\.md$/.test(p));
  assert.deepEqual(shipped, [], `the tarball carries a backlog: ${shipped}`);
});
