---
traces:
  supersedes: the-engine-installs-by-name@bc49d25cc15c4fe432c5bba699a17667b7d39b91c89741955cd304c354894f92
---

# Requirement: the-publish-carries-a-token

_Ask, from Kai: "lets target 0.0.2". Checking what stands between this tree
and that version turned up a release run that cannot publish. The defect is
mine, shipped four hours ago in `the-engine-installs-by-name`, and it would
have failed on Kai's own release run at the last step, after the tag._

## Goal

Whoever dispatches a release wants the run that tags to also publish, and
wants to find out that it cannot before it has tagged rather than after; they
will know it by the run naming the registry it signs in to, by that registry
being the one the package publishes to, and by no token living in this tree.

## What the runs said

- npm says it in one line. `npm publish --dry-run` on this tree answers
  `This command requires you to be logged in to https://npm.pkg.github.com`
  and then reports the tarball it would have sent, 28 files.
- The registry refuses an unauthenticated caller.
  `npm view @chbrain/khai-foyer --registry=https://npm.pkg.github.com`
  answers `401 Unauthorized ... authentication token not provided`. The same
  call for `@chbrain/kaal` answers `404 ... does not exist under owner
"chbrain"`, so 0.0.2 would be the first publish under this name.
- Nothing in this tree tells npm where a token goes. There is no `.npmrc`,
  and `.github/workflows/release.yml` sets node up with a version and a cache
  and no `registry-url`. `package.json` carries
  `publishConfig.registry: https://npm.pkg.github.com`, which says where a
  publish goes and nothing about how it signs in.
- The publish step already has the token and nowhere to put it: it runs with
  `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` and the job holds
  `packages: write # the package it publishes, and nothing else`. The token
  is in the environment and npm never looks for it, because the file that
  would point npm at it is never written.
- The criterion that should have caught this is green.
  `the-engine-installs-by-name`'s third says "The release workflow publishes
  the version it tagged, after the tag, and the publish step runs only if the
  branch check, the board and `kaal release` have all passed". Its test reads
  the order of the steps and never asks whether the publish step could do
  anything. The criterion says publishes and the test says after.

## Assumptions

- The fix is one line in the workflow and the value of this task is the three
  claims around it, not the line. `actions/setup-node` writes the file npm
  reads when it is given a `registry-url`, and that is the whole mechanism.
- No token belongs in this tree, in any form. The run's token is the
  workflow's own and lives for the length of one job. An `.npmrc` carrying a
  literal token is the fix a hurried reader would reach for and it is the one
  outcome worse than the current defect, so a criterion forbids it.
- Two places name the registry and they must be the same place's answer. The
  workflow says where to sign in and the package says where to publish, and a
  release that signed in to one registry and published to another would be a
  release nobody could explain.
- This is checked by reading files and never by publishing. A test that
  publishes to prove a publish works has published, and there is no undo.

## Constraints

- The release run keeps the order `the-engine-installs-by-name` fixed: the
  branch check, the board, `kaal release`, the tag, then the publish. This
  task adds nothing to that order and changes nothing in it.
- The exit vocabulary holds, and nothing here reaches the network.
- `security-v1` still holds: every write in every block says what it is for.
- No new wall. These are three readings of two files and they belong in an
  acceptance test.

## Acceptance criteria

1. The release run names the registry it signs in to, so the token it already
   holds reaches npm; a run that sets node up without naming one is a
   release that tags and cannot publish.
2. The registry the run signs in to is the registry `package.json` publishes
   to, read from both and compared, so neither can drift from the other.
3. No file in this tree carries a registry token or an authentication line
   for one; the run's token comes from the workflow's own secret and nowhere
   else.

## Open questions

- Should the run prove it can publish before it tags, rather than after?
  Today a failed publish leaves a tag with no package behind it, which
  `the-engine-installs-by-name` left open and this task does not close.
- Is `--dry-run` worth a step of its own before the tag? It would have caught
  this defect and it costs one command, and it is also a thing that can pass
  and then fail on the real call.

## Handoff

- Task: the-publish-carries-a-token
- Criteria: 3; tests: 3 (equal)
- Red run: `node --test requirements/the-publish-carries-a-token/acceptance.test.mjs`,
  all three failing
- Tests: `acceptance.test.mjs`, beside this file; the workflow and the
  manifest are read as text, and the tree is swept for a token
- Open questions: 2, listed above
- Status: open
- Blocked on: nothing
- Unblocks: 0.0.2, which is the first publish under the scoped name and would
  fail at its last step without this
- Supersedes: `the-engine-installs-by-name`, whose third criterion says the
  workflow publishes and whose test reads only where the publish step sits.
  It is widened here to ask whether the run could publish at all, which is
  the same defect this league keeps finding one function at a time: the rule
  is right, the reading never reaches it, and green means held and never
  asked in the same word
- People: none
