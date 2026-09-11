---
traces:
  supersedes: the-engine-installs-by-name@7f42be034c0b78b7ebce3c72260082bbb12c3c7040a116a2359a5b22c55d62f7
reviews:
  supersedes/the-engine-installs-by-name: reviewed-no-impact@7f42be034c0b78b7ebce3c72260082bbb12c3c7040a116a2359a5b22c55d62f7 by analyst: this supersedes that task's third criterion, the one about publishing, and what moved is its second, the one about what the package carries
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
- The asker's other repositories answer the token question and answer it in
  two parts. `khai`'s release workflow sets node up with
  `registry-url: "https://npm.pkg.github.com"` and `scope: "@chbrain"`, and
  publishes with `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`, which is the
  built in token and is what this workflow already passes. Its `RELEASE_TOKEN`
  is a personal access token used for the git side and not for npm: its own
  comment says GitHub suppresses workflow runs on commits a `GITHUB_TOKEN`
  authored, so a bot made version pull request would never fire CI. This tree
  pushes a tag and no workflow triggers on one, so it needs the registry lines
  and not the personal token.
- The criterion that should have caught this is green.
  `the-engine-installs-by-name`'s third says "The release workflow publishes
  the version it tagged, after the tag, and the publish step runs only if the
  branch check, the board and `kaal release` have all passed". Its test reads
  the order of the steps and never asks whether the publish step could do
  anything. The criterion says publishes and the test says after.

## Assumptions

- The fix is two lines in the workflow and the value of this task is the
  claims around them, not the lines. `actions/setup-node` writes the file npm
  reads when it is given a `registry-url`, and a `scope` writes the mapping
  that sends a scoped name to that registry rather than to the default one.
  Both are what the asker's other repositories carry, and consistency with
  them is worth more here than any argument for a different shape.
- The personal access token those repositories hold is for the git side and
  not for npm. This release pushes a tag and nothing in this tree triggers on
  a tag, so the built in token is enough and a second secret would be one
  more thing to expire. That changes the day a tag is meant to start a run.
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

1. The release run names the registry it signs in to and the scope it
   publishes under, so the token it already holds reaches npm; a run that
   sets node up without naming a registry is a release that tags and cannot
   publish.
2. The registry the run signs in to is the registry `package.json` publishes
   to, read from both and compared, so neither can drift from the other.
3. No file in this tree carries a registry token or an authentication line
   for one; the run's token comes from the workflow's own secret and nowhere
   else.

## Open questions

- Should the run prove it can publish before it tags, rather than after?
  Today a failed publish leaves a tag with no package behind it, which
  `the-engine-installs-by-name` left open and this task does not close.
- Does this tree ever want the asker's `RELEASE_TOKEN` as well? It would be
  needed the day a pushed tag is meant to start a workflow of its own, which
  a token authored by the built in secret will not do. Nothing here needs it
  and the answer belongs on the day something does.
- Is `--dry-run` worth a step of its own before the tag? It would have caught
  this defect and it costs one command, and it is also a thing that can pass
  and then fail on the real call.

## Handoff

- Task: the-publish-carries-a-token
- Criteria: 3; tests: 3 (equal)
- Red run: `node --test requirements/the-publish-carries-a-token/acceptance.test.mjs`,
  two failing and the third green as a guard
- Tests: `acceptance.test.mjs`, beside this file; the workflow and the
  manifest are read as text, and the tree is swept for a token
- Open questions: 2, listed above
- Blocked on: nothing
- Unblocks: 0.0.2, which is the first publish under the scoped name and would
  have failed at its last step without this
- Supersedes: `the-engine-installs-by-name`, whose third criterion says the
  workflow publishes and whose test read only where the publish step sits. It
  is widened here to ask whether the run names a registry at all, which is
  the part its own word `publishes` already promised. This task owns the
  claim in full; that one keeps its order claim and gains the capability it
  was always asserting. Its third contract test is superseded too, for a
  different reason found by the hook: it read the workflow as text, so a
  comment naming a command counted as the command
- People: none

## Build

- Built: all three criteria, on
  `requirement/the-publish-carries-a-token-build`
- Landed: two lines in `.github/workflows/release.yml`, a `registry-url` and
  a `scope` on the node setup, with the reason above them
- Proved: four isolations, each on its own. The run naming no registry
  reddens criteria 1 and 2 together, which is the criteria telling the truth:
  with no registry named there is nothing for the second to compare. Naming
  no scope reddens 1, naming a different registry reddens 2, and a committed
  credentials file reddens 3
- Found by the push hook, and it is the same defect twice in one build:
  `the-engine-installs-by-name`'s third contract test searches the whole
  workflow text for `npm publish`, and the comment I wrote above the node
  setup explains what that command needs. The explanation sat before the tag,
  so the test read a publish happening before a tag. It reads the steps now,
  with comments stripped, which is what `the-release-runs-on-a-key`'s
  acceptance test already does and says why. Proved by moving the publish
  step above the tag for real and watching the same criterion redden
- Found while building, and it is the worst kind: criterion 3 could not see
  the file it forbids. It swept `globSync("**/*")`, which never matches a
  name beginning with a dot, and every file that criterion is about begins
  with one. A committed `.npmrc` carrying a token sat in the tree and the
  test stayed green. It sweeps `**/.*` as well now, and both halves were
  proved by putting the forbidden thing in the tree and watching it redden
- Not needed and recorded: the asker's other repositories hold a
  `RELEASE_TOKEN`, a personal access token for the git side, because GitHub
  suppresses workflow runs on commits a `GITHUB_TOKEN` authored. This tree
  pushes a tag and nothing here triggers on a tag, so the built in token is
  enough. The day a tag is meant to start a run, that changes
- Class: nothing a consumer notices moved (`kaal class . --against origin/main`,
  run last, after the final edit). The workflow is not one of the three
