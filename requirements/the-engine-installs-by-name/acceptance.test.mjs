// Acceptance tests for requirement the-engine-installs-by-name. One per
// criterion. Surface only: the manifest, what `npm pack` says the package
// carries, the release workflow's text, the permissions blocks of every
// workflow, the operate skill's text and the surface page.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const W = join(ROOT, ".github", "workflows");
const fold = (s) => s.replace(/\s+/g, " ");
const manifest = () =>
  JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const release = () => readFileSync(join(W, "release.yml"), "utf8");
const operate = () =>
  readFileSync(join(ROOT, "skills", "operate", "SKILL.md"), "utf8");
const paras = (heading, re) => {
  const m = operate().match(
    new RegExp(
      `^## ${heading}[^\\n]*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`,
      "m",
    ),
  );
  assert.ok(m, `the operate skill has no section ${heading}`);
  return m[1]
    .split(/\n\s*\n/)
    .map(fold)
    .filter((x) => re.test(x))
    .join(" ");
};

test("1. the package has a name a consumer can ask for, and a registry of its own", () => {
  const p = manifest();
  assert.match(p.name, /^@[a-z0-9-]+\/kaal$/, `the name is ${p.name}`);
  assert.notEqual(p.private, true, "the package is still private");
  // A registry the manifest declares, so a publish cannot resolve one from
  // whatever the machine running it happens to hold.
  assert.ok(p.publishConfig, "the manifest declares no publishConfig");
  assert.match(
    String(p.publishConfig.registry ?? ""),
    /^https:\/\/\S+$/,
    `no registry is declared: ${JSON.stringify(p.publishConfig)}`,
  );
});

test("2. what the package carries is unchanged", () => {
  const r = spawnSync("npm", ["pack", "--dry-run", "--json"], {
    cwd: ROOT,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  assert.equal(r.status, 0, `npm pack refused: ${r.stderr}`);
  const files = JSON.parse(r.stdout)[0].files.map((f) => f.path);
  assert.ok(files.length, "the package carries nothing");
  assert.ok(
    files.some((f) => f.startsWith("bin/")),
    `the tool is not in the package: ${files.join(", ")}`,
  );
  // The six the offline install refuses, each on its own: an alternation
  // passes on a package that carries five of them.
  for (const d of [
    "requirements/",
    "architecture/",
    "retros/",
    "evals/",
    "skills/",
    "tests/",
  ])
    assert.ok(
      !files.some((f) => f.startsWith(d)),
      `the package carries ${d}: ${files.filter((f) => f.startsWith(d)).join(", ")}`,
    );
});

test("3. the run publishes what it tagged, after it tagged it", () => {
  const lines = release()
    .split("\n")
    .map((l) => (/^\s*#/.test(l) ? "" : l));
  const at = (re) => lines.findIndex((l) => l && re.test(l));
  const branch = lines.findIndex(
    (l) => l && /^\s*if:/.test(l) && /default_branch|refs\/heads\/main/.test(l),
  );
  const board = at(/npm test/);
  const refusal = at(/kaal\.mjs release|kaal release/);
  const tag = at(/git tag|refs\/tags\//);
  const publish = at(/npm publish/);
  for (const [name, i] of [
    ["the branch check", branch],
    ["the board", board],
    ["the refusal", refusal],
    ["the tag", tag],
    ["the publish", publish],
  ])
    assert.ok(i > -1, `${name} is not in the workflow`);
  assert.deepEqual(
    [branch, board, refusal, tag, publish].slice().sort((a, b) => a - b),
    [branch, board, refusal, tag, publish],
    `out of order: ${[branch, board, refusal, tag, publish].join(", ")}`,
  );
  // The manifest decides which version ships, and `kaal release` above has
  // already refused unless the manifest carries the one being released. So
  // the publish passes no version of its own: a second source for it is a
  // second chance to disagree. Read the step's own lines, because a window
  // around it catches the tag step, which names the version four times.
  const rest = lines.slice(publish);
  const end = rest.findIndex((l, i) => i > 0 && /^ {6}- /.test(l));
  const step = rest.slice(0, end === -1 ? rest.length : end).join(" ");
  assert.match(step, /npm publish/, `no publish in the step: ${step}`);
  assert.doesNotMatch(
    step,
    /--tag |inputs\.version/,
    `the publish names a version of its own: ${step}`,
  );
  // And that the step could publish at all, which this criterion says and
  // this test did not ask for four hours: the order of the steps was proved
  // and the capability was not. setup-node writes the credentials file npm
  // reads only when it is given a registry to name, so a run without one
  // tags and then answers that it requires a login.
  // `the-publish-carries-a-token` owns the claim in full; this asks the part
  // its own word `publishes` already promised.
  assert.match(
    release(),
    /^\s*registry-url:/m,
    "the run sets node up naming no registry, so the publish cannot sign in",
  );
});

test("4. every write in every workflow says what it is for", () => {
  const files = readdirSync(W).filter((f) => /\.ya?ml$/.test(f));
  assert.ok(files.length >= 3, `found ${files.length} workflows`);
  let writes = 0;
  for (const f of files) {
    const t = readFileSync(join(W, f), "utf8");
    assert.match(t, /^permissions:/m, `${f}: no permissions block`);
    // Every write in the file, not only the top level one: codeql declares
    // `security-events: write` on its job, which a top level read misses,
    // and a write is a write wherever it is granted.
    for (const [line, , rest] of t.matchAll(
      /^\s*([a-z-]+):\s*write\b(.*)$/gm,
    )) {
      writes += 1;
      assert.match(
        rest,
        /#\s*\S/,
        `${f}: ${line.trim()} does not say what the write is for`,
      );
    }
  }
  assert.ok(writes > 0, "no workflow writes anything, so nothing was checked");
});

test("5. the operate skill knows what an uploaded artefact costs it", () => {
  const said = paras("3\\. Write the proof", /\bref\b|upload|built/i);
  assert.ok(said, "the proof's rules never mention what the artefact is");
  // The rule keeps its case and gains its complement.
  assert.match(said, /refus/i, `the refusals case is gone: ${said}`);
  assert.match(
    said,
    /upload|built|publish/i,
    `the other case is not named: ${said}`,
  );
  const other = said
    .split(/(?<=\.)\s+/)
    .filter((s) => /upload|built|publish/i.test(s))
    .join(" ");
  assert.match(
    other,
    /tests? of its own|owes tests|deploy tests/i,
    `what it owes is not said: ${other}`,
  );
});

test("6. the release record has a place for the visibility and who set it", () => {
  const tpl = readFileSync(
    join(ROOT, "skills", "operate", "references", "release.md"),
    "utf8",
  );
  assert.match(tpl, /visibilit/i, "the record has no place for visibility");
  const line = tpl.match(/^.*visibilit.*$/im)[0];
  assert.match(line, /who|by |person|set/i, `nobody is named: ${line}`);
});

test("7. the surface says both install paths, and which one to take", () => {
  const s = fold(readFileSync(join(ROOT, "SURFACE.md"), "utf8"));
  assert.match(s, /@[a-z0-9-]+\/kaal/, "the surface does not name the package");
  assert.match(
    s,
    /git URL|git url|from the repository/i,
    "the offline path is gone",
  );
  const both = s
    .split(/(?<=\.)\s+/)
    .filter((x) => /@[a-z0-9-]+\/kaal/.test(x) || /git URL/i.test(x))
    .join(" ");
  assert.match(
    both,
    /registry|offline|no registry/i,
    `which path to take is not said: ${both}`,
  );
});
