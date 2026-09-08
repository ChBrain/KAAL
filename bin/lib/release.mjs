// Whether this tree may be released as a version: the two facts a release
// rests on, checked before anything is tagged. It refuses and never
// releases. The tag is the workflow's to make, from the commit the run was
// started on, and the token is the workflow's to hold.
//
// The v0.0.1 record argued that a deploy script for an artefact that is a
// git ref would be a wrapper around one command, and its tests would test
// the wrapper. That is right, and it is why this is not that script. What
// is worth testing about such a release is what it refuses.
import { readFileSync, existsSync } from "node:fs";
import { join, posix } from "node:path";

/**
 * Where a release's plan lives, relative to the root. Always with forward
 * slashes: this is a line a person reads and types, and the requirement
 * fixes it as `deploy/releases/<version>.md`, so joining it with the host's
 * separator made the finding say something different on Windows and the
 * acceptance test refused it there. Node opens a forward slash path on
 * every platform, so the reading below is unaffected.
 */
export const recordPath = (version) =>
  posix.join("deploy", "releases", `${version}.md`);

/**
 * @param {string} root @param {string} version
 * @returns {{ ok: boolean, lines: string[] }} the answer or the findings
 */
export function checkRelease(root, version) {
  const findings = [];
  // The version the tree carries, read from the tree rather than taken on
  // the caller's word: a release named for a version the tree does not
  // carry is a mislabelled artefact, whatever the caller meant.
  const carried = JSON.parse(
    readFileSync(join(root, "package.json"), "utf8"),
  ).version;
  if (carried !== version)
    findings.push(
      `release: asked for ${version}, and this tree carries ${carried}`,
    );
  // The plan, because a release plan written after the release is a report
  // and a missing record means there was no plan.
  const record = recordPath(version);
  if (!existsSync(join(root, record)))
    findings.push(`release: no plan at ${record}`);
  return findings.length
    ? { ok: false, lines: findings }
    : { ok: true, lines: [`release: ${version}, planned in ${record}`] };
}
