// Contract tests for the-engine-is-installable. One per seam. Each drives the
// manifest on one side and reads the other; none of them runs npm, which is
// the acceptance layer's job.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const manifest = () =>
  JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
// npm reads `bin` as a map of names to paths, or as one bare string meaning
// the package's own name. Both are the same promise, so both are read here.
const commands = (m) =>
  typeof m.bin === "string" ? { [m.name]: m.bin } : (m.bin ?? {});

test("1. a version a reader can judge", () => {
  const version = manifest().version;
  assert.ok(version, "the manifest carries no version");
  const places = String(version).split(".");
  assert.equal(places.length, 3, `${version} is not three places`);
  for (const p of places)
    assert.match(
      p,
      /^(0|[1-9][0-9]*)$/,
      `${version} has a place that is not a number`,
    );
  assert.equal(places[0], "0", `major place is ${places[0]}`);
  assert.equal(places[1], "0", `minor place is ${places[1]}`);
});

test("2. what ships is what files names", () => {
  const m = manifest();
  const files = m.files ?? [];
  assert.ok(files.length > 0, "the manifest names nothing to ship");
  for (const f of files)
    assert.ok(existsSync(join(ROOT, f)), `files names ${f}, which is not here`);
  const named = Object.entries(commands(m));
  assert.ok(named.length > 0, "the manifest offers no command");
  for (const [name, path] of named) {
    assert.ok(
      existsSync(join(ROOT, path)),
      `${name} points at ${path}, which is not here`,
    );
    // The classic way to ship a broken package: an entry point outside what
    // `files` carries. npm links it all the same and the link dangles.
    const shipped = files.some(
      (f) => path === f || path.startsWith(`${f.replace(/\/$/, "")}/`),
    );
    assert.ok(shipped, `${name} points at ${path}, which files does not ship`);
  }
});

test("3. the command a consumer runs", () => {
  const m = manifest();
  const named = Object.entries(commands(m));
  assert.ok(named.length > 0, "the manifest offers no command");
  const elsewhere = mkdtempSync(join(tmpdir(), "kaal-elsewhere-"));
  try {
    for (const [name, path] of named) {
      const file = join(ROOT, path);
      assert.ok(
        existsSync(file),
        `${name} points at ${path}, which is not here`,
      );
      const first = readFileSync(file, "utf8").split("\n")[0];
      assert.match(
        first,
        /^#!/,
        `${path} has no shebang, so it is not a program`,
      );
      // Run from a directory that is not this tree: a consumer's tree is
      // never this one, and a tool that needs its own root is not installable.
      const run = spawnSync(process.execPath, [file], {
        cwd: elsewhere,
        encoding: "utf8",
      });
      assert.equal(
        run.status,
        1,
        `${name} exited ${run.status}: ${run.stdout}${run.stderr}`,
      );
      assert.match(run.stderr, /^usage: kaal /, `${name} said: ${run.stderr}`);
    }
  } finally {
    rmSync(elsewhere, { recursive: true, force: true });
  }
});
