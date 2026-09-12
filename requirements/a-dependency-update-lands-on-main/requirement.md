---
traces:
  parent: a-diff-carries-one-seat@94929e3013fa24a1d998a05ed2e7026cc9181cc56083ae07fc2858daf937953a
  supersedes: nothing
---

# Requirement: a-dependency-update-lands-on-main

## Goal

A dependency update reaches the branch a consumer installs without waiting
for a release, and reaches the branch the next release is built on without
anyone remembering to carry it.

## What the runs said

- One is open and it cannot be merged. Pull request 242, `Bump
actions/setup-python from 6 to 7`, opened by `dependabot[bot]` against
  `main` from `dependabot/github_actions/actions/setup-python-7`, one file
  changed, `mergeable_state: blocked`.
- The promotion refuses the first leg. `refusedHead("main", "dependabot/
npm_and_yarn/x-1", lanes)` answers `main takes only release`.
- The seat rule refuses the second leg, and the promotion does not.
  `matches("main", p)` is false for all ten declared lanes, so a pull request
  whose head is `main` reads as a branch no lane holds. `promotion.yml` is
  `on: pull_request: branches: [main]`, so it never runs on a pull request
  into `release`: `refusedHead("release", "main", lanes)` would answer
  `release takes a lane and not a target`, and nothing asks it.
- No lane holds a branch Dependabot opens either. The branch is four segments
  deep, `matches(branch, "dependabot/*")` is false because `*` is one
  segment, and `matches(branch, "dependabot/**")` is true.
- The board runs on both legs whatever they target. `ci.yml` is `on:
pull_request:` with no base filter, so every wall runs on a dependency
  update and on a sync, and the seat rule is among them.
- Nothing points Dependabot anywhere. `.github/dependabot.yml` declares two
  ecosystems, github-actions and npm, weekly, limit three, and names no
  target branch, so it opens against the default, which is `main`.
- A bump changes nothing a consumer installs. `package.json` carries `files:
["bin", "skills", "agents", "!**/*.test.mjs"]`, so a workflow is never
  published; what a dependency update changes is what this tree uses to
  deliver and not what it delivers.
- A pull request opened with the run's own token starts no workflow. The
  evals workflow says so where it needs one:
  `[ -n "${{ secrets.EVALS_TOKEN }}" ] || echo "::warning::no EVALS_TOKEN;
the commit below will not start the walls, push once by hand"`.

## Assumptions

- A dependency update is a hotfix and takes the hotfix road. The asker's
  shape is `dependabot -> main -> release`, which is the road a fix for the
  branch a consumer installs already takes, and a bump that waited for a
  release would leave that branch on an old action for as long as a release
  takes.
- The sync is a pull request and not a rebase. `release` is shared and
  carries work nobody has promoted, so rewriting its history breaks every
  checkout of it; `main` is merged into `release` and never rebased onto it.
- The engine says what may ride and the workflow says who. `kaal` reads a
  tree and a branch and cannot know who opened a pull request, and asking it
  to would tie this engine to one provider. So the paths are the engine's
  rule and the author is the workflow's, and neither is the whole answer.
- The lane carries no seat. No seat writes a bump: `.github/**` and
  `package.json` sit in the governance lane's allowed paths, and a lane for
  a machine that files a diff weekly is the same shape as the lanes for
  skills, agents and evals.
- The pull request open now is not salvageable. Dependabot pins a pull
  request to the branch it opened against, so 242 is closed and reopened
  rather than retargeted.

## Constraints

- The promotion's claim narrows and does not disappear. `a-promotion-names-
what-it-refuses` criterion 4 fixes that `main` takes only `release`; what
  this task adds is one named kind beside it, and anything that is not
  `release` and not that kind is refused in the words it already uses.
- The board judges both legs like any other diff. No wall is skipped for a
  bump or for a sync and none is added.
- Deterministic and offline, like every wall. What the workflow checks about
  an author is the workflow's and never the engine's.

## Acceptance criteria

1. A branch Dependabot opens is held by a lane, and that lane carries no
   seat. On such a branch the seat rule answers the lane it is in rather than
   that no lane holds it.
2. That lane allows what a dependency update touches and nothing else. A diff
   in it carrying a path outside those is a finding naming the path, in the
   words the seat rule already uses.
3. A whole dependency update passes in that lane: a workflow file, the
   manifest and the lockfile changed together are one lane's diff and no
   finding.
4. The promotion admits a dependency update into `main` and nothing else new.
   A head that is neither `release` nor a branch Dependabot opens is refused
   in the words it already uses. What such a branch may carry is criterion 2
   and not this one: the promotion runs the board and the board holds the
   seat rule, so saying it twice would be one claim wearing two numbers.
5. A pull request from `main` into `release` is the sync: the seat rule
   answers that it is the sync rather than that no lane holds it, and says
   which it is rather than naming a seat.
6. Dependabot opens against `main`, because the configuration names the
   target rather than leaving it to a default that may change.

## Open questions

- What opens the sync? Nothing does today, so after a bump lands on `main`
  the two branches drift until a person notices. A workflow can open it, and
  a pull request opened with the run's own token starts no workflow, so it
  needs a credential that is not that token, which the evals workflow already
  says in its own words. The credential is the asker's and the wall for the
  drift is the operator's.
- Who may ride this road? The engine cannot tell a machine's diff from a
  person's: a branch named `dependabot/x` that a person pushed, carrying only
  a workflow file, is admitted by every rule here. The check that closes it
  reads the pull request's author and belongs in the workflow, which is where
  this tree's provider-shaped rules already live.
- Should a lane with no author reach the shared paths? `retros/**` and the
  plan and suite pages are open to every lane by the seat rule itself, so a
  dependency update may write a retro or a test plan and nothing says a word.
- Does a dependency update owe a retro? Every seat's use of a skill does, and
  no skill was used: a machine filed it. The seatless lanes carry none, which
  answers it by precedent rather than by anybody deciding.
- Is the weekly schedule right once the promotion is real? Three open pull
  requests per ecosystem is three lanes' worth of board time a week, and each
  one now carries a sync behind it.

## Handoff

- Task: a-dependency-update-lands-on-main
- Criteria: 6; tests: 6 (equal)
- Red run: `node --test --test-timeout=60000
requirements/a-dependency-update-lands-on-main/acceptance.test.mjs`, 12
  September 2026, all 6 failing, and each one failing on its own as well
- Stand-in green: all six, discarded from file copies. It found three things
  the architect will meet. `promote` carries a matcher of its own, splitting
  a pattern on `*` and joining with `[^/]*`, so nothing it reads can cross a
  slash and a four-segment branch matches no pattern at all; the seat rule
  exports one that knows `**`, and two matchers where one is weaker is the
  thing to resolve rather than to copy. The sync is read as a diff between
  two targets, so a tree where the other target names no commit answers that
  before any lane is asked. And criterion 4 first claimed the paths as well
  as the head, which is criterion 2 wearing a second number: the promotion
  runs the board and the board holds the seat rule
- Tests: `acceptance.test.mjs`, beside this file, on scratch repositories,
  because the seat rule reads a branch and a diff and both have to be real
- Open questions: 5, listed above
- Blocked on: `a-wall-that-does-not-apply-reports`. The sync leg is a target
  opening into a target, which is as little a lane's diff as the promotion
  is, so it answers the same exit code the board today reads as a failure
- Unblocks: item 13 of `plan/0.0.2.md`, the cut, which the operator drives
  with no pull request open that the league cannot merge
- Supersedes: nothing. `a-promotion-names-what-it-refuses` criterion 4 keeps
  its words for every head but one, and the one is named rather than excused
- People: none
