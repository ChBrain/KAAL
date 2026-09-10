// Contract tests for drawing an-install-carries-the-method. One per seam,
// numbered to match. Every fixture is a scratch directory built here: a
// package as a consumer receives it, and a destination as a consumer names
// it, because all three seams are about two trees that are not this one.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  existsSync,
  rmSync,
} from "node:fs";
import { join, dirname, sep } from "node:path";
import { tmpdir } from "node:os";

// Imported inside each seam: a namespace import at the top saves a missing
// export and not a module that fails to load, and one absent file would share
// its red across all three.
const need = async (name) => {
  const mod = await import("../../bin/lib/assemble.mjs");
  assert.ok(mod[name], `no ${name} export from assemble.mjs`);
  return mod[name];
};

const put = (root, files) => {
  for (const [rel, text] of Object.entries(files)) {
    const p = join(root, ...rel.split("/"));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  }
};
const scratch = (files, fn) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-assemble-c-"));
  try {
    put(root, files);
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};
/** A package as a consumer receives it: the tool, two skills, an agent. */
const PACKAGE = {
  "package.json": '{ "name": "@chbrain/kaal" }\n',
  "bin/kaal.mjs": "// the tool\n",
  "skills/analyse/SKILL.md": "---\nname: analyse\n---\n\nThe analyst's.\n",
  "skills/analyse/references/shape.md": "A reference.\n",
  "skills/analyse/scripts/run.mjs": "// a script\n",
  "skills/architect/SKILL.md": "---\nname: architect\n---\n\nThe drawing.\n",
  "agents/kaal/AGENT.md": "---\nname: kaal\n---\n\nThe persona.\n",
};

test("1. the members: every skill the package carries, narrowed where a consumer named some, a finding for a name that is not there, and no question at all where a root holds no skills", async () => {
  const skillsIn = await need("skillsIn");
  scratch(PACKAGE, (root) => {
    // Naming nothing is the league and never nothing: a consumer who said
    // nothing asked for the method, which is the whole of what this package
    // owes them.
    const all = skillsIn(root);
    assert.ok(all.skills, `no members came back: ${JSON.stringify(all)}`);
    assert.deepEqual(
      all.skills.map((s) => s.name).sort(),
      ["analyse", "architect"],
      `it carried: ${JSON.stringify(all.skills)}`,
    );
    for (const s of all.skills)
      assert.ok(
        existsSync(join(s.dir, "SKILL.md")),
        `${s.name} points at a directory with no SKILL.md: ${s.dir}`,
      );
    assert.ok(
      !all.findings?.length,
      `a sound package found something: ${JSON.stringify(all.findings)}`,
    );
    // Narrowed, because take less is available and assemble more is not
    // required.
    const one = skillsIn(root, ["analyse"]);
    assert.deepEqual(
      (one.skills ?? []).map((s) => s.name),
      ["analyse"],
      `narrowing carried: ${JSON.stringify(one.skills)}`,
    );
    // A name the package does not carry. The finding names the name and
    // where it looked, because a reader with neither has to guess which of
    // the two is wrong.
    const missing = skillsIn(root, ["nope"]);
    assert.equal(
      (missing.findings ?? []).length,
      1,
      `expected one finding: ${JSON.stringify(missing.findings)}`,
    );
    assert.ok(
      missing.findings[0].includes("nope"),
      `the name is not in the finding: ${missing.findings[0]}`,
    );
    assert.ok(
      /skills/.test(missing.findings[0]),
      `where it looked is not in the finding: ${missing.findings[0]}`,
    );
    assert.ok(
      !missing.notApplicable,
      "a package that ships skills refused the question",
    );
    // One good name and one bad is still a finding, and never a quiet
    // partial answer: a consumer who asked for two and got one has been told
    // nothing about the one they did not get.
    const mixed = skillsIn(root, ["analyse", "nope"]);
    assert.equal(
      (mixed.findings ?? []).length,
      1,
      `expected one finding: ${JSON.stringify(mixed.findings)}`,
    );
  });
  // A root with no skills at all is a consumer who ran this in their own
  // project rather than in the package. Telling them a skill is missing
  // sends them looking for a file; this is a different mistake.
  scratch({ "package.json": "{}\n", "src/index.js": "\n" }, (root) => {
    const away = skillsIn(root);
    assert.ok(
      away.notApplicable,
      `a tree with no skills did not refuse: ${JSON.stringify(away)}`,
    );
    assert.ok(!away.skills, "it refused and answered at the same time");
    assert.ok(
      !away.findings?.length,
      `it refused and found something too: ${JSON.stringify(away.findings)}`,
    );
  });
});

test("2. the landing: one directory under the destination the consumer named, and a finding for any name that would leave it", async () => {
  const landingAt = await need("landingAt");
  const dest = join("home", "kai", "runtime", "skills");
  const ok = landingAt(dest, "analyse");
  assert.ok(ok.path, `no landing came back: ${JSON.stringify(ok)}`);
  assert.equal(
    ok.path,
    join(dest, "analyse"),
    `the landing is not the name under the destination: ${ok.path}`,
  );
  assert.ok(
    !ok.findings?.length,
    `an ordinary name found something: ${JSON.stringify(ok.findings)}`,
  );
  // Every way a name could reach outside what the consumer named. A package
  // is a guest in a consumer's tree, and a guest writes where it was told.
  for (const bad of [
    "..",
    "../evil",
    "a/b",
    "a\\b",
    "/absolute",
    ".",
    "",
    "sub/../../out",
  ]) {
    const r = landingAt(dest, bad);
    assert.equal(
      (r.findings ?? []).length,
      1,
      `${JSON.stringify(bad)}: expected one finding, got ${JSON.stringify(r.findings)}`,
    );
    assert.ok(
      !r.path,
      `${JSON.stringify(bad)}: it found something and answered anyway: ${r.path}`,
    );
  }
  // And the guarantee stated as itself: whatever comes back is under the
  // destination and exactly one segment deeper.
  for (const name of ["analyse", "architect", "a-long-skill-name"]) {
    const p = landingAt(dest, name).path;
    assert.equal(p.startsWith(dest + sep), true, `${p} is not under ${dest}`);
    assert.equal(
      p.slice(dest.length + 1).includes(sep),
      false,
      `${p} is more than one directory below ${dest}`,
    );
  }
});

test("3. the copy: every path it wrote, byte for byte what the source held, and nothing outside the landing", async () => {
  const copyInto = await need("copyInto");
  scratch(PACKAGE, (from) => {
    scratch({ "already/here.md": "not yours\n" }, (parent) => {
      const to = join(parent, "analyse");
      const wrote = copyInto(join(from, "skills", "analyse"), to);
      assert.ok(Array.isArray(wrote), `copyInto gave ${typeof wrote}`);
      // Relative to the landing, so a caller can print them without printing
      // a temporary directory's name.
      assert.deepEqual(
        [...wrote].map((p) => String(p).split(sep).join("/")).sort(),
        ["SKILL.md", "references/shape.md", "scripts/run.mjs"],
        `it reported: ${JSON.stringify(wrote)}`,
      );
      // Byte for byte. A copy that reformats is a copy that has changed the
      // thing a consumer is meant to be able to compare with the league's.
      for (const rel of ["SKILL.md", "references/shape.md"])
        assert.equal(
          readFileSync(join(to, ...rel.split("/")), "utf8"),
          readFileSync(
            join(from, "skills", "analyse", ...rel.split("/")),
            "utf8",
          ),
          `${rel} did not arrive whole`,
        );
      // Nothing outside the landing, said two ways: what was already in the
      // destination's parent is untouched, and nothing new is beside it.
      assert.equal(
        readFileSync(join(parent, "already", "here.md"), "utf8"),
        "not yours\n",
        "the copy wrote over something the consumer already had",
      );
      assert.deepEqual(
        readdirSync(parent).sort(),
        ["already", "analyse"],
        `it wrote beside the landing: ${readdirSync(parent)}`,
      );
      // And it never reaches back into the source.
      assert.equal(
        readdirSync(join(from, "skills")).sort().join(","),
        "analyse,architect",
        "the copy changed the package it read from",
      );
    });
  });
});
