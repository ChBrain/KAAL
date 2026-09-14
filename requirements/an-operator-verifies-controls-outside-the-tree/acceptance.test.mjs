// Acceptance tests for an-operator-verifies-controls-outside-the-tree. One
// per criterion. Surface only: a deterministic decision over normalized,
// provider-neutral procedure evidence. The fixture vocabulary is not a
// provider payload, production serialization or final repository path.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const LEAGUE = join(HERE, "..", "..");
const TOOL =
  process.env.KAAL_ACCEPTANCE_TOOL || join(LEAGUE, "bin", "kaal.mjs");
const fixture = (name) => join(HERE, "fixtures", name);
const run = (name) =>
  spawnSync(process.execPath, [TOOL, "verify-controls", fixture(name)], {
    cwd: LEAGUE,
    encoding: "utf8",
  });
const said = (r) =>
  `${r.error ? `${r.error.message}: ` : ""}${r.stdout ?? ""}${r.stderr ?? ""}`;
const notUsage = (r, name) =>
  assert.doesNotMatch(
    said(r),
    /^usage: kaal/m,
    `${name}: verify-controls is not implemented: ${said(r)}`,
  );
const green = (name) => {
  const r = run(name);
  notUsage(r, name);
  assert.equal(r.status, 0, `${name}: ${said(r)}`);
  return said(r);
};
const red = (name) => {
  const r = run(name);
  notUsage(r, name);
  assert.equal(r.status, 1, `${name}: ${said(r)}`);
  assert.notEqual(said(r).trim(), "", `${name}: no finding`);
  return said(r);
};

test("1. the procedure inventories every repository-declared external control", () => {
  const ok = green("complete-procedure.json");
  for (const control of [
    "release-pull-request-required",
    "release-direct-push-blocked",
    "release-force-push-blocked",
    "release-deletion-blocked",
    "release-required-check-walls",
    "main-pull-request-required",
    "main-direct-push-blocked",
    "main-force-push-blocked",
    "main-deletion-blocked",
    "main-required-check-walls",
    "codeql-advanced-setup",
    "secret-scanning",
    "push-protection",
    "dependabot-alerts",
    "dependabot-security-updates",
    "code-review-bot-decision",
    "manual-release-dispatch",
    "tag-workflow-authentication",
    "github-packages-registry",
    "package-scope",
    "package-visibility",
    "package-workflow-authentication",
  ])
    assert.match(ok, new RegExp(control, "i"));
  assert.match(red("missing-control.json"), /dependabot-security-updates/i);
  assert.match(
    red("missing-release-ruleset-control.json"),
    /release-deletion-blocked/i,
  );
});

test("2. expected state resolves to current repository authority", () => {
  const ok = green("complete-procedure.json");
  assert.match(ok, /authority.*current.*resolved/i);
  for (const path of [
    "requirements/public-v1/requirement.md",
    "requirements/a-promotion-names-what-it-refuses/requirement.md",
    "requirements/the-engine-installs-by-name/requirement.md",
    "requirements/the-publish-carries-a-token/requirement.md",
    "requirements/the-release-runs-on-a-key/requirement.md",
  ])
    assert.match(ok, new RegExp(path.replaceAll("/", "\\/"), "i"));
  assert.match(red("remembered-authority.json"), /memory|conversation/i);
  assert.match(red("remembered-authority.json"), /not.*authority/i);
  assert.match(
    red("stale-authority.json"),
    /stale.*public-v1|public-v1.*stale/i,
  );
  assert.match(
    red("unresolved-authority.json"),
    /unresolved|does not resolve/i,
  );
});

test("3. every control says how to inspect it and whose act each step is", () => {
  const out = red("missing-inspection.json");
  assert.match(out, /release-required-check-walls/i);
  for (const words of [
    /location/i,
    /method|steps/i,
    /expected/i,
    /observe/i,
    /confirm/i,
    /authorize/i,
    /change/i,
  ])
    assert.match(out, words);
});

test("4. inaccessible and unknown never collapse into clean", () => {
  const ok = green("complete-procedure.json");
  for (const state of ["compliant", "noncompliant", "inaccessible", "unknown"])
    assert.match(ok, new RegExp(state, "i"));
  const out = red("collapsed-states.json");
  assert.match(out, /inaccessible/i);
  assert.match(out, /unknown/i);
  assert.match(out, /clean|compliant/i);
  assert.match(red("noncompliant.json"), /required checks.*noncompliant/i);
  assert.match(
    red("inaccessible.json"),
    /publishing authentication.*inaccessible/i,
  );
  assert.match(red("unknown.json"), /secret scanning.*unknown/i);
});

test("5. observations bind their subject without inventing a source revision", () => {
  const ok = green("complete-procedure.json");
  for (const binding of [
    "repository",
    "package",
    "candidate",
    "target",
    "control",
    "observedAt",
  ])
    assert.match(ok, new RegExp(binding, "i"));
  const out = red("invented-revision.json");
  assert.match(out, /revision/i);
  assert.match(out, /not exposed|unavailable|invented/i);
  const bound = green("complete-current.json");
  for (const value of [
    "repo:ChBrain/KAAL",
    "package:@chbrain/kaal",
    "0.0.2",
    "candidate:2222222222222222222222222222222222222222",
    "git-tag:v0.0.2",
    "github-packages:@chbrain/kaal@0.0.2",
    "2026-09-14T10:05:00Z",
  ])
    assert.match(bound, new RegExp(value.replaceAll(".", "\\."), "i"));
  assert.match(red("wrong-candidate.json"), /candidate.*mismatch/i);
});

test("6. the procedure says when current evidence must be repeated", () => {
  const ok = green("complete-procedure.json");
  for (const changed of ["candidate", "target", "procedure", "authority"])
    assert.match(ok, new RegExp(changed, "i"));
  assert.match(ok, /authorization/i);
  const out = red("missing-repeat-rule.json");
  assert.match(out, /target/i);
  assert.match(out, /repeat|stale|current/i);
  assert.match(green("complete-current.json"), /current/i);
  const stale = red("stale-procedure.json");
  assert.match(stale, /stale/i);
  assert.match(stale, /procedure-2/i);
  assert.match(stale, /procedure-3/i);
});

test("7. safe metadata is separated from secret material and long-lived credentials", () => {
  const ok = green("complete-procedure.json");
  assert.match(ok, /safe metadata/i);
  assert.match(ok, /secret/i);
  assert.match(ok, /workflow_dispatch|manual dispatch/i);
  assert.match(ok, /GITHUB_TOKEN|workflow token/i);
  assert.match(ok, /no long-lived.*PAT|long-lived.*forbidden/i);
  const out = red("unsafe-evidence-policy.json");
  assert.match(out, /fingerprint|derived/i);
  assert.match(out, /secret|token/i);
  const safe = green("safe-auth-metadata.json");
  assert.match(safe, /workflow token/i);
  assert.match(safe, /secret reference/i);
  const material = red("secret-material.json");
  assert.match(material, /token value/i);
  assert.match(material, /fingerprint|derived/i);
});

test("8. a reusable procedure and an orphaned release result are different states", () => {
  const procedure = green("complete-procedure.json");
  assert.match(procedure, /no release observation|procedure only/i);
  const orphaned = red("record-without-procedure.json");
  assert.match(orphaned, /procedure/i);
  assert.match(orphaned, /absent|missing/i);
  assert.notEqual(procedure.trim(), orphaned.trim());
});

test("9. complete current verification differs from an incomplete result", () => {
  const complete = green("complete-current.json");
  for (const state of [/complete/i, /current/i, /compliant/i])
    assert.match(complete, state);
  const incomplete = red("incomplete-verification.json");
  assert.match(incomplete, /incomplete/i);
  assert.match(incomplete, /publishing authentication/i);
});

test("10. human confirmation is recordable without becoming operator authorization", () => {
  const confirmed = green("human-confirmed.json");
  assert.match(confirmed, /human attestation|human confirmation/i);
  assert.match(confirmed, /operator did not observe independently/i);
  assert.match(confirmed, /authorization.*separate|separate.*authorization/i);
  const overreach = red("operator-authorized.json");
  assert.match(overreach, /operator observation.*not authorization/i);
  assert.match(overreach, /human authority/i);
});

test("11. completeness requires both exact 0.0.2 release targets", () => {
  const ok = green("complete-procedure.json");
  assert.match(ok, /git-tag:v0\.0\.2/i);
  assert.match(ok, /github-packages:@chbrain\/kaal@0\.0\.2/i);
  const noTag = red("missing-tag-target.json");
  assert.match(noTag, /git-tag:v0\.0\.2/i);
  assert.match(noTag, /missing|incomplete/i);
  const noPackage = red("missing-package-target.json");
  assert.match(noPackage, /github-packages:@chbrain\/kaal@0\.0\.2/i);
  assert.match(noPackage, /missing|incomplete/i);
});

test("12. a control applies only to the release targets its authority supports", () => {
  const out = red("wrong-target-applicability.json");
  assert.match(out, /github-packages-registry/i);
  assert.match(out, /git-tag:v0\.0\.2/i);
  assert.match(out, /not applicable|wrong target/i);
});

test("13. every applicable control and target relation is accounted for", () => {
  const complete = green("complete-current.json");
  assert.match(complete, /39 of 39|39\/39/i);
  assert.match(complete, /applicable relations.*accounted|complete coverage/i);
  const missing = red("missing-applicable-relation.json");
  assert.match(missing, /secret-scanning/i);
  assert.match(missing, /git-tag:v0\.0\.2/i);
  assert.match(missing, /missing|unaccounted/i);
});
