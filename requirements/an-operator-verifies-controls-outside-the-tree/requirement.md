---
traces:
  parent: public-v1@cb937d83ee8e6b3341a7f447c4a5dea4e36c26ba144d192a01fc6e1ba830a269
  supersedes: nothing
---

# Requirement: an-operator-verifies-controls-outside-the-tree

_Ask, from Kai: make the external controls needed by 0.0.2 repeatably
inspectable without treating a conversational report as proof. Counted as two
requirements. This one is the durable procedure. The observation made for one
release is the independently failing second task,
`a-release-records-its-external-control-verification`, which this task
unblocks._

## Goal

An operator preparing a release wants one durable procedure for controls the
tree cannot inspect, so another maintainer can tell what to examine, where and
how to examine it, what state is expected, whose authority each act needs, and
when the examination must be repeated.

## What the runs said

- `sed -n '320,370p' plan/0.0.2.md` names registry scope, publishing
  authentication, merge protections and the list from `public-v1` as item 9;
  it assigns gathering to the operator and the answers to Kai, and says the
  item unblocks the release.
- The same plan makes item 9 and item 12 different work. Item 9 reads the
  external controls; item 12 creates `deploy/releases/0.0.2.md` only after the
  version. A reusable procedure can change without a release, while one
  release's observation cannot exist before its candidate and target do.
- `rg` over `deploy/`, `skills/operate/` and the traced requirements finds no
  external-control procedure. `deploy/releases/0.0.1.md` records a key,
  visibility and a permission failure, but no repeatable inspection of the
  settings on which that release depended.
- `public-v1` leaves required checks, secret scanning, push protection,
  Dependabot security settings and optional bot review to the human. Its
  drawing also says the Windows job is separate so an existing required check
  keeps its name.
- `a-promotion-names-what-it-refuses` leaves pull-request requirements,
  direct and force push protection, deletion protection and required checks
  to the human. `the-publish-carries-a-token` fixes registry and scope
  agreement in the tree while forbidding a token there. `release.yml` still
  depends on external package visibility, scope and workflow authentication.
- `an-open-finding-blocks-every-target` distinguishes absent, unavailable,
  unauthorized, incomplete, stale and open evidence from a completed clean
  analysis. Its current CodeQL workflow is producer-specific and analyzes
  `main`; this procedure must not convert that producer's words into the
  vocabulary every external control must use.
- `sha256sum` over the five requirement pages referenced by
  `fixtures/complete-procedure.json` matches all five recorded whole-file
  hashes after rebasing onto the merge of pull request 310. The references
  resolve to the repository authority for promotion rules, public security
  settings, package identity and visibility, publish authentication, and the
  manually dispatched release.
- `jq` counts 22 controls in the complete procedure and 39 distinct
  applicable control and target relations in `complete-current.json`.
- On rebased head `a73ad8c176bc632837900db29bbc92575e8a7df5`, the
  focused current-tree run fails all 13 cases on the absent `verify-controls`
  surface; selecting criteria 1 through 13 one at a time yields 13 runs with
  exactly one test and one failure each. The disposable semantic stand-in
  passes all 13 together.

## Assumptions

- The existing `operate` method is the nearest durable operating procedure,
  but this requirement does not decide whether the new procedure extends that
  skill or is a separate operator artefact.
- A control has a repository-local identity even where its provider exposes
  no stable revision. The local identity lets releases refer to the same
  question; it does not pretend the external state has a revision.
- Current means examined for the exact candidate and target at the procedure's
  stated release moment, using the current procedure and current repository
  authority. Elapsed-time limits are not assumed. A provider state with no
  stable revision is bound by its inspection location, observed time and
  truthful statement that no revision was available.
- The normalized acceptance fixtures describe meanings, not a provider
  payload, final serialisation or repository path.

## Constraints

- A class is an organizing label and never the completeness unit. The
  inventory names each repository-declared control separately: five `release`
  rules, five `main` rules, CodeQL setup mode, secret scanning, push
  protection, Dependabot alerts, Dependabot security updates, the optional bot
  review decision, manual release dispatch, tag authentication, registry,
  package scope, package visibility and package authentication.
- Every expected state names a repository path, its current whole-file hash,
  and the section and claim that authorize the expectation. A remembered
  conversation, a stale hash or an unresolved path is not authority and makes
  the procedure incomplete.
- Each control says where and how it is inspected, its expected state, and
  which authority may observe, confirm, authorize and change it. Human-only
  access stays human authority; the operator may record the human's statement
  but may not restate it as an operator observation.
- `compliant`, `noncompliant`, `inaccessible` and `unknown` are different
  observation states. Inaccessible and unknown never mean clean. A procedure
  also says what makes evidence incomplete or stale and when to repeat it.
- The procedure binds an observation to the repository, package, release
  candidate, target, control and observation time. It records an external
  revision only where the source exposes one, and otherwise records that no
  stable revision was available. It does not invent hashes, versions or
  timestamps for external state.
- Safe evidence is metadata needed to repeat or audit the inspection: control
  identity, inspection location, status, actor authority, time, and a stable
  source revision when one exists. Secrets, token values, recovery codes,
  credentials and values derived from them never enter the procedure,
  fixtures or release evidence.
- For 0.0.2 the complete target set is the git tag `v0.0.2` and npm package
  `@chbrain/kaal` version `0.0.2` on GitHub Packages. Every applicable control
  and target pair is accounted for; a control attached to a target its
  authority does not support is an error rather than extra assurance.
- The current manually dispatched release workflow remains the operating
  model. One human `workflow_dispatch` authorizes the workflow-scoped built-in
  token for the tag and package permissions it needs. Nothing here introduces
  Changesets or a long-lived release personal access token.
- `kaal verify-controls <fixture>` is the deterministic conformance surface
  used by this proof. It consumes normalized offline evidence and chooses no
  provider adapter, final artifact path, workflow, wall or release action;
  those are decisions for the drawing.

## Acceptance criteria

1. `kaal verify-controls fixtures/complete-procedure.json` exits 0 and names
   all 22 controls individually: pull request, direct push, force push,
   deletion and required `walls` check controls separately for `release` and
   `main`; CodeQL advanced setup, secret scanning, push protection, Dependabot
   alerts, Dependabot security updates and the optional bot review decision;
   manual release dispatch and tag workflow authentication; and GitHub
   Packages registry, package scope, public visibility and package workflow
   authentication. `missing-control.json` exits 1 naming the omitted
   Dependabot security updates control, and
   `missing-release-ruleset-control.json` exits 1 naming the omitted release
   deletion control. Omission within a class is incomplete.
2. The complete procedure exits 0 saying every expected state resolved to
   current repository authority, and names the five requirement paths it
   resolved. `remembered-authority.json`, `stale-authority.json` and
   `unresolved-authority.json` each exit 1 and respectively name conversation
   memory as no authority, the stale `public-v1` reference, or the unresolved
   path.
3. On `fixtures/missing-inspection.json` the command exits 1 and names the
   control and each missing meaning: inspection location, repeatable method,
   expected state, and the authorities permitted to observe, confirm,
   authorize and change it.
4. The complete procedure declares `compliant`, `noncompliant`,
   `inaccessible` and `unknown` as distinct states and says only compliant is
   clean. On `fixtures/collapsed-states.json`, where inaccessible and unknown
   are treated as compliant, the command exits 1 and names both collapsed
   states. The `noncompliant.json`, `inaccessible.json` and `unknown.json`
   observations each exit 1 and name their distinct blocking state and
   control.
5. The complete procedure requires every observation to bind repository,
   package, release candidate, target, control and observed time. It permits a
   source revision only when exposed and otherwise requires an explicit
   unavailable answer. On `fixtures/invented-revision.json` the command exits
   1 and says that a revision was asserted without source evidence. A complete
   current observation names the exact repository, package, version, full
   candidate identity, target and observation time; `wrong-candidate.json`
   exits 1 and names the mismatch.
6. The complete procedure states when evidence is current and when the
   operator repeats it: a changed candidate, target, procedure or repository
   authority makes the old observation stale, and authorization cannot precede
   the observation. On
   `fixtures/missing-repeat-rule.json` the command exits 1 and names the
   missing repeat condition. `complete-current.json` is current under those
   rules, while `stale-procedure.json` exits 1 and names both the observed and
   current procedure revisions.
7. The complete procedure distinguishes the safe metadata an observation may
   retain from secret material it must never retain. On
   `fixtures/unsafe-evidence-policy.json`, which permits a token fingerprint,
   the command exits 1 and names secret-derived material as forbidden.
   `safe-auth-metadata.json` accepts an authentication mode and secret
   reference name without secret material; `secret-material.json` carries
   only a semantic declaration that forbidden token value and fingerprint
   fields were present, never their values, and exits 1 naming both classes.
   The complete answer also names manual `workflow_dispatch`, the
   workflow-scoped built-in token and the prohibition on a long-lived release
   PAT.
8. The complete procedure exits 0 as durable guidance while saying no
   release-specific observation was evaluated. On
   `fixtures/record-without-procedure.json`, a release result claiming a
   procedure the fixture does not carry exits 1 and says the procedure is
   absent. A reusable procedure without one release's result and an orphaned
   release result are observably different states.
9. `complete-current.json` exits 0 and says the verification is complete,
   current and compliant. `incomplete-verification.json`, with no publishing
   authentication result, exits 1 and names both the incomplete state and the
   omitted control.
10. `human-confirmed.json` exits 0 and says the inaccessible-to-operator fact
    is a human attestation, was not independently observed by the operator,
    and remains separate from the human's authorization decision.
    `operator-authorized.json` exits 1 because an operator observation cannot
    supply human authorization.
11. The complete procedure exits 0 naming exactly `git-tag:v0.0.2` and
    `github-packages:@chbrain/kaal@0.0.2` as the intended targets.
    In release-verification inputs, `missing-tag-target.json` and
    `missing-package-target.json` each exit 1, name the absent target, and say
    the result is incomplete.
12. `wrong-target-applicability.json` exits 1 because it assigns the GitHub
    Packages registry control to the git tag, and names the control, tag and
    unsupported relation. Additional inapplicable checks do not count toward
    completeness.
13. The complete current verification exits 0 saying all 39 applicable
    control and target relations are accounted for.
    `missing-applicable-relation.json` exits 1 naming the unaccounted secret
    scanning relation for `git-tag:v0.0.2`.

## Open questions

- Does the durable procedure extend the portable `operate` skill, or does the
  operator tree hold a repository-specific companion that the skill invokes?
- At what named release moment is an observation current: before the release
  record merges, immediately before dispatch, or both?
- Which external surfaces expose stable revisions today? The requirement
  permits them but refuses to pretend every settings page has one.

## Handoff

- Task: an-operator-verifies-controls-outside-the-tree
- Status: open
- Criteria: 13; tests: 13 (equal)
- Red run: `node --test --test-timeout=60000
requirements/an-operator-verifies-controls-outside-the-tree/acceptance.test.mjs`,
  14 September 2026 at rebased head `a73ad8c176bc632837900db29bbc92575e8a7df5`;
  all 13 fail on the absent `verify-controls` decision, the intended missing
  behavior rather than a provider or network
- Tests: `requirements/an-operator-verifies-controls-outside-the-tree/acceptance.test.mjs`
- Fixtures: the twenty-seven normalized provider-neutral semantic documents under
  `requirements/an-operator-verifies-controls-outside-the-tree/fixtures/`;
  they choose no provider payload, production serialization or final path
- Stand-in green: all thirteen pass together on a disposable semantic judge;
  the stand-in remains outside the pull request
- Individual red: criteria 1 through 13 were each selected alone against the
  current tree; every run had exactly one test, zero passes and one failure.
  The earlier isolated-fault proof also remains unchanged because the test and
  fixtures are unchanged by the rebase
- Open questions: 3, listed above
- Blocked on: nothing
- Unblocks: `a-release-records-its-external-control-verification`, the second
  independently testable need counted from the ask. Its proof is not carried
  here because the lane check makes another task's proof a second pull request
- Supersedes: nothing. `public-v1` remains the source list of external
  settings; this task makes the inspection repeatable without claiming the
  tree observes them
- People: none. Authority roles in fixtures are synthetic roles, not people
