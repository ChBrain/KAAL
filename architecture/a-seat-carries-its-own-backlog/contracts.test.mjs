// Contract tests for drawing a-seat-carries-its-own-backlog. One per seam,
// numbered to match. Seams 1 to 3 drive the module, because the declaration
// and the tree are the inputs and a repository would only be a way of
// writing them down; seam 4 drives the command, because where a set is
// printed and whether a byte changed are not things a function can be asked.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
// Imported inside each seam: a namespace import at the top saves a missing
// export, not a module that fails to load, and one absent file would share
// its red across all four.
const need = async (name) => {
  const mod = await import("../../bin/lib/backlog.mjs");
  assert.ok(mod[name], `no ${name} export from backlog.mjs`);
  return mod[name];
};
const said = (r) =>
  `${r.error ? `${r.error.message}: ` : ""}${r.stdout ?? ""}${r.stderr ?? ""}`;
const put = (root, files) => {
  for (const [rel, text] of Object.entries(files)) {
    const p = join(root, ...rel.split("/"));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  }
};

/** A declaration of the shape the seat rule answers, with kinds beside it. */
const DECLARED = {
  seats: [
    { name: "analyst", owns: ["requirements/**"] },
    { name: "architect", owns: ["architecture/**"] },
    { name: "developer", owns: ["bin/**", "SURFACE.md"] },
  ],
  lanes: [{ pattern: "requirement/*", seat: "analyst", allows: [] }],
  shared: [],
  blocks: ["no requirement", "no drawing"],
};
const page = (entries) =>
  `---\nblocks:\n${entries.map((e) => `  ${e}\n`).join("")}---\n\n# Backlog\n`;

/** A scratch tree carrying a declaration and whatever pages are named. */
const tree = (declared, files, fn) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-bl-c-"));
  try {
    put(root, { "kaal.config.json": JSON.stringify(declared, null, 2) });
    put(root, files);
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};
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

test("1. one page per declared seat, at the tree that seat owns", async () => {
  const pages = await need("pages");
  tree(DECLARED, {}, (root) => {
    const got = pages(root);
    assert.equal(
      got.length,
      DECLARED.seats.length,
      `expected a page per seat: ${JSON.stringify(got)}`,
    );
    for (const s of DECLARED.seats) {
      const mine = got.find((g) => g.seat === s.name);
      assert.ok(mine, `no page for ${s.name}: ${JSON.stringify(got)}`);
      const tree0 = s.owns[0].split("/")[0];
      assert.equal(
        String(mine.path).replaceAll("\\", "/"),
        `${tree0}/backlog.md`,
        `${s.name}'s page is not in the tree it owns`,
      );
    }
    // Read off the declaration and not written down: a seat added to the
    // declaration has a page without anybody saying where.
    const more = pages;
    const extra = {
      ...DECLARED,
      seats: [...DECLARED.seats, { name: "tester", owns: ["tests/**"] }],
    };
    tree(extra, {}, (other) => {
      const grown = more(other);
      assert.equal(grown.length, 4, JSON.stringify(grown));
      assert.ok(
        grown.some(
          (g) => g.seat === "tester" && String(g.path).includes("tests/"),
        ),
        `a declared seat got no page: ${JSON.stringify(grown)}`,
      );
    });
  });
});

test("2. an entry is the key split at the slash, and a stranger is a finding", async () => {
  const entries = await need("entries");
  const good = entries(page(["architect/alpha: no requirement"]));
  assert.equal(good.entries?.length ?? good.length, 1, JSON.stringify(good));
  const one = (good.entries ?? good)[0];
  assert.equal(one.seat, "architect", JSON.stringify(one));
  assert.equal(one.task, "alpha", JSON.stringify(one));
  assert.equal(one.kind, "no requirement", JSON.stringify(one));
  // A key with no slash cannot say who owes what, and losing it silently is
  // the failure the requirement measured.
  const flat = entries(page(["alpha: no requirement"]));
  assert.ok(
    (flat.findings ?? []).length,
    `a key with no slash was taken: ${JSON.stringify(flat)}`,
  );
  // Two blocks on one task, which a map keyed by the task alone could not
  // hold at all.
  const both = entries(
    page(["analyst/beta: no requirement", "architect/beta: no drawing"]),
  );
  assert.equal((both.entries ?? both).length, 2, JSON.stringify(both));
});

test("3. a block stands until the tree meets it, and an unresolvable kind is a finding", async () => {
  const stands = await need("stands");
  const entry = { seat: "analyst", task: "alpha", kind: "no requirement" };
  tree(DECLARED, {}, (root) => {
    assert.equal(
      stands(root, entry),
      true,
      "a block with nothing to meet it did not stand",
    );
  });
  tree(
    DECLARED,
    { "requirements/alpha/requirement.md": "# alpha\n" },
    (root) => {
      assert.equal(
        stands(root, entry),
        false,
        "a block whose need is met still stands",
      );
    },
  );
  // A kind nobody can resolve could never clear, so it is said rather than
  // carried: this is the half that keeps a declared vocabulary honest.
  const resolves = await need("resolves");
  assert.equal(
    resolves("no requirement"),
    true,
    "a kind the tree answers does not resolve",
  );
  assert.equal(
    resolves("the weather"),
    false,
    "a kind nothing answers resolves",
  );
});

test("4. the board says what cleared, then what stands, and writes nothing", () => {
  const kaal = (root, ...args) =>
    spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
      encoding: "utf8",
      env: { ...process.env, KAAL_BRANCH: "", KAAL_BASE: "" },
    });
  tree(
    DECLARED,
    {
      "architecture/backlog.md": page([
        "analyst/alpha: no requirement",
        "analyst/beta: no requirement",
      ]),
      "bin/backlog.md": page(["architect/beta: no drawing"]),
      "requirements/alpha/requirement.md": "# alpha\n",
    },
    (root) => {
      const before = snapshot(root);
      const r = kaal(root, "backlog", root);
      const out = said(r);
      assert.doesNotMatch(out, /^usage: kaal/m, `no such command: ${out}`);
      // Alpha cleared, beta stands twice under two seats.
      assert.match(
        out,
        /\balpha\b/,
        `the cleared block is not reported: ${out}`,
      );
      assert.ok(
        (out.match(/\bbeta\b/g) ?? []).length >= 2,
        `beta stands under two seats and is named once: ${out}`,
      );
      // Cleared before standing, which the requirement's own proof of
      // criterion 4 fixes: no "blocked" may precede a task that cleared.
      assert.ok(
        out.indexOf("alpha") <
          (out.search(/blocked/i) === -1 ? Infinity : out.search(/blocked/i)),
        `a cleared block is reported after the standing set: ${out}`,
      );
      assert.deepEqual(snapshot(root), before, "a file under the tree changed");
    },
  );
});
