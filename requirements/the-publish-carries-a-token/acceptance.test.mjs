// Acceptance tests for requirement the-publish-carries-a-token. One per
// criterion. Surface only: the release workflow and the manifest as text, and
// a sweep of the tree. Nothing here publishes, and nothing reaches a network:
// a test that published to prove a publish works has published.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, globSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WORKFLOW = join(ROOT, ".github", "workflows", "release.yml");
const flow = () => {
  assert.ok(existsSync(WORKFLOW), "there is no release workflow");
  return readFileSync(WORKFLOW, "utf8");
};
const manifest = () =>
  JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
// A registry named on a `registry-url:` line, whatever quoting it carries.
const signedInTo = (text) =>
  text.match(/^\s*registry-url:\s*["']?(\S+?)["']?\s*$/m)?.[1] ?? null;
// npm treats a registry with and without its trailing slash as one place, and
// a comparison that did not would fail on a difference nobody can see.
const SECRET = new RegExp("\\b(gh[pousr]|github" + "_pat)_[A-Za-z0-9_]{22,}");
const same = (a, b) =>
  String(a).replace(/\/+$/, "") === String(b).replace(/\/+$/, "");

test("1. the run names the registry it signs in to, so the token it holds reaches npm", () => {
  const w = flow();
  // The token is already there and has nowhere to go without this: it is the
  // file setup-node writes for a named registry that npm reads, and naming
  // no registry writes no file.
  assert.match(
    w,
    /NODE_AUTH_TOKEN:\s*\$\{\{\s*secrets\./,
    "the publish step is given no token",
  );
  const named = signedInTo(w);
  assert.ok(
    named,
    "the run sets node up without naming a registry, so it tags and cannot publish",
  );
  assert.match(named, /^https:\/\//, `the registry is not a url: ${named}`);
});

test("2. the registry it signs in to is the registry the package publishes to", () => {
  const named = signedInTo(flow());
  const publishesTo = manifest().publishConfig?.registry;
  assert.ok(publishesTo, "package.json declares no registry to publish to");
  assert.ok(named, "the run names no registry to sign in to");
  assert.ok(
    same(named, publishesTo),
    `the run signs in to ${named} and the package publishes to ${publishesTo}`,
  );
});

test("3. no file in this tree carries a token or an authentication line for one", () => {
  const files = globSync("**/*", {
    cwd: ROOT,
    nodir: true,
    exclude: (p) => /(^|[\\/])(\.git|node_modules)([\\/]|$)/.test(p),
  });
  // The file npm reads for a registry's credentials, anywhere in the tree.
  // Read as a filename rather than as a line of text: the first version of
  // this test swept every file for an auth line and matched the sentence in
  // this comment describing one, which is prose answering a question about
  // configuration.
  const configs = files.filter((rel) => /(^|[\\/])\.npmrc$/.test(rel));
  assert.deepEqual(
    configs,
    [],
    `these are npm credential files and the run writes its own: ${configs.join(", ")}`,
  );
  // And a token itself, wherever it landed. A token that reached a commit is
  // a token to revoke whatever a later commit says.
  const carriers = files.filter((rel) => {
    let text;
    try {
      text = readFileSync(join(ROOT, rel), "utf8");
    } catch {
      return false;
    }
    return SECRET.test(text);
  });
  assert.deepEqual(
    carriers,
    [],
    `these files carry what looks like a token: ${carriers.join(", ")}`,
  );
});
