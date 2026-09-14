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
- On post-#315 rebased head `5ec2d0c200bcf4921537b02099d022fb35d35921`,
  the focused current-tree run fails all 13 cases on the absent
  `verify-controls` surface; selecting criteria 1 through 13 one at a time
  yields 13 runs with exactly one test and one failure each. The disposable
  semantic stand-in passes all 13 together.
- The reconciled acceptance suite retains PR #315's current inventory and
  reviewed pins, adds this open requirement's case, and hashes to
  `d7fc6a4d306a99b97abeba00fc0977ed04b5b85e04e8d48e3cba6a955f74cc96`.
  Both acceptance and regression plans point to that exact composite page.

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
- The durable procedure declares only the `git-tag` and `github-packages`
  target kinds and maps every control to the kinds its authority supports. It
  carries no release version, candidate or exact target identity. A release
  verification input supplies those identities and derives every applicable
  control and target relation; an inapplicable relation is an error rather
  than extra assurance.
- Verification has two explicit phases. Before dispatch, package visibility is
  not yet observable because the first publish has not happened; the phase is
  truthfully incomplete and cannot claim compliance from prospective evidence.
  After first publish, the operator inspects visibility and may complete the
  record only from an observation made after that boundary.
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
   the observation. `missing-repeat-rule.json` exits 1 naming the missing
   condition. In `candidate-changed.json`, only the release version and
   candidate change: the procedure remains `procedure-4`, while the prior
   observation is stale. `stale-procedure.json` separately exits 1 naming an
   actual move from `procedure-3` to `procedure-4`.
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
9. `pre-dispatch.json` exits 0 saying the phase is pre-dispatch, package
   visibility is not yet observable, the verification is incomplete, and no
   observed compliant visibility exists. `prospective-package-visibility.json`
   exits 1 because an expected future public state cannot impersonate an
   observation before first publish. `complete-current.json` exits 0 only in
   the post-publish phase, with package visibility observed after first publish
   and the verification complete, current and compliant.
   `incomplete-verification.json`, with no publishing authentication result,
   exits 1 naming the incomplete state and omitted control.
10. `human-confirmed.json` exits 0 and says the inaccessible-to-operator fact
    is a human attestation, was not independently observed by the operator,
    and remains separate from the human's authorization decision.
    `operator-authorized.json` exits 1 because an operator observation cannot
    supply human authorization.
11. `complete-procedure.json` exits 0 naming the `git-tag` and
    `github-packages` target kinds and saying exact identities come from a
    release-verification input; it names neither 0.0.2 target.
    `complete-current.json` supplies exactly `git-tag:v0.0.2` and
    `github-packages:@chbrain/kaal@0.0.2`. `missing-tag-target.json` and
    `missing-package-target.json` each exit 1 naming the absent release target
    and incomplete result.
12. The complete procedure maps the registry control to the
    `github-packages` kind and tag authentication to the `git-tag` kind.
    `wrong-target-applicability.json` exits 1 because release input assigns the
    registry control to `git-tag:v0.0.2`, naming the control, target and wrong
    target kind. Extra inapplicable relations do not count toward completeness.
13. `complete-current.json` exits 0 saying the release input derived and
    accounted for all 39 applicable relations from the procedure's kind map
    and its two exact targets. `missing-applicable-relation.json` exits 1
    naming the unaccounted secret-scanning relation for `git-tag:v0.0.2`.

## Open questions

- Does the durable procedure extend the portable `operate` skill, or does the
  operator tree hold a repository-specific companion that the skill invokes?
- Which external surfaces expose stable revisions today? The requirement
  permits them but refuses to pretend every settings page has one.

## Handoff

- Task: an-operator-verifies-controls-outside-the-tree
- Status: open
- Criteria: 13; tests: 13 (equal)
- Red run: `node --test --test-timeout=60000
requirements/an-operator-verifies-controls-outside-the-tree/acceptance.test.mjs`,
  14 September 2026 at post-#315 rebased head
  `5ec2d0c200bcf4921537b02099d022fb35d35921`;
  all 13 fail on the absent `verify-controls` decision, the intended missing
  behavior rather than a provider or network
- Tests: `requirements/an-operator-verifies-controls-outside-the-tree/acceptance.test.mjs`
- Fixtures: the thirty normalized provider-neutral semantic documents under
  `requirements/an-operator-verifies-controls-outside-the-tree/fixtures/`;
  they choose no provider payload, production serialization or final path
- Stand-in green: all thirteen pass together on a disposable semantic judge;
  the stand-in remains outside the pull request
- Individual red: criteria 1 through 13 were each selected alone against the
  current tree; every run had exactly one test, zero passes and one failure.
  The earlier isolated-fault proof also remains unchanged because the test and
  fixtures are unchanged by the rebase
- Open questions: 2, listed above
- Blocked on: nothing
- Unblocks: `a-release-records-its-external-control-verification`, the second
  independently testable need counted from the ask. Its proof is not carried
  here because the lane check makes another task's proof a second pull request
- Supersedes: nothing. `public-v1` remains the source list of external
  settings; this task makes the inspection repeatable without claiming the
  tree observes them
- People: none. Authority roles in fixtures are synthetic roles, not people
