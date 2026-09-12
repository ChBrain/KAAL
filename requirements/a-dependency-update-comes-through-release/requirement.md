---
traces:
  parent: a-diff-carries-one-seat@94929e3013fa24a1d998a05ed2e7026cc9181cc56083ae07fc2858daf937953a
  supersedes: nothing
---

# Requirement: a-dependency-update-comes-through-release

## Goal

A dependency update reaches `main` the way every seat's work does, so the
operator can promote without a pull request sitting open that nothing in the
league can merge.

## What the runs said

- One is open and it cannot be merged. Pull request 242, `Bump
actions/setup-python from 6 to 7`, opened by `dependabot[bot]` against `main`
  from `dependabot/github_actions/actions/setup-python-7`, one file changed,
  `mergeable_state: blocked`.
- The promotion refuses it and always will. `refusedHead("main", "dependabot/
github_actions/actions/setup-python-7", lanes)` answers `{"kind":"head",
"message":"main takes only release"}`. That branch is not `release` and never
  will be, so no amount of waiting changes the answer.
- It would be refused on `release` too, for a different reason.
  `refusedHead("release", <the same branch>, lanes)` answers `no lane holds
it`. Ten lanes are declared and none matches: the branch is four segments
  deep, `matches(branch, "dependabot/*")` is false because `*` is one segment,
  and `matches(branch, "dependabot/**")` is true.
- Nothing points Dependabot anywhere. `.github/dependabot.yml` declares two
  ecosystems, github-actions and npm, with a weekly schedule and a limit of
  three, and names no target branch, so it opens against the default, which is
  `main`.
- The rule it is breaking is written down. `CLAUDE.md` says to cut the branch
  from `release`, open the pull request against `release`, and never open one
  against `main`, because that one is the promotion and it is the operator's.

## Assumptions

- A dependency update is a lane's diff and not a promotion. It is a change to
  what this tree uses to deliver, arriving the way any change does, and the
  only thing unusual about it is that nobody in the league wrote it.
- The lane carries no seat. No seat owns a bump: `.github/**` sits in the
  governance lane's allowed paths and `package.json` beside it, and a lane for
  a machine that files a diff weekly is the same shape as the lanes for
  skills, agents and evals.
- What a dependency update may touch is small and knowable. Two ecosystems are
  declared, github-actions and npm, so the paths are the workflows, the
  manifest and the lockfile, and a diff reaching past them is not a bump.
- The pull request that is open now is not salvageable. Dependabot pins a pull
  request to the branch it opened against, so 242 is closed and reopened
  against the new target rather than retargeted.

## Constraints

- The promotion does not gain an exception. `a-promotion-names-what-it-
refuses` criterion 4 fixes that `main` takes only `release`, and a head let
  through beside it would be the first thing ever to reach `main` without
  passing the board, which is the one claim the promotion makes.
- The board judges a dependency update like any other lane's diff. No wall is
  skipped for it and none is added: a bump that could not pass the walls is a
  bump this tree cannot take, and that is the answer and not a problem.
- Deterministic and offline, like every wall.

## Acceptance criteria

1. A branch Dependabot opens is held by a lane, and that lane carries no seat.
   On such a branch the seat rule answers the lane it is in rather than that
   no lane holds it.
2. That lane allows what a dependency update touches and nothing else. A diff
   in it carrying a path outside those is a finding naming the path, in the
   words the seat rule already uses.
3. A whole dependency update passes in that lane: a workflow file, the
   manifest and the lockfile changed together are one lane's diff and no
   finding.
4. Dependabot opens against `release` and never against `main`, because the
   configuration names the target rather than leaving it to the default.
5. The promotion is unchanged. A head that is not `release` is refused into
   `main` in the words it already uses, and a branch Dependabot opens is one
   of those.

## Open questions

- Should the lane allow the lockfile when the tree does not hold one? There is
  no `package-lock.json` committed here today, and a lane that allows a path
  nothing writes is a declaration about a file that does not exist. Naming it
  now costs a line and saves a red wall the day `npm ci` needs one.
- Does a dependency update owe a retro? Every seat's use of a skill does, and
  no skill was used here: a machine filed it. The seatless lanes carry none
  today, which answers it by precedent rather than by anybody deciding.
- What happens when a bump turns a wall red? It is a block with an owner and
  the owner is not obvious: nobody in the league wrote the diff, and the seat
  whose wall went red did not cause it. This is the first work in the tree
  with no author, and the answer may be that the operator owns it.
- Should a lane with no author reach the shared paths? `retros/**` and the
  plan and suite pages are open to every lane by the seat rule itself, so a
  dependency update may write a retro or a test plan and nothing says a word.
  Nobody would, because nobody is there; the question is whether shared means
  shared to a machine as well, and answering it is a change to the seat rule
  rather than to this lane.
- Is the weekly schedule right once the promotion is real? Three open pull
  requests per ecosystem against `release` is three lanes' worth of board
  time a week, and a release cut monthly would rather take them in one.

## Handoff

- Task: a-dependency-update-comes-through-release
- Criteria: 5; tests: 5 (equal)
- Red run: `node --test --test-timeout=60000
requirements/a-dependency-update-comes-through-release/acceptance.test.mjs`,
  12 September 2026, 4 of 5 failing, and each of the four failing on its own
  as well
- Green before the build: criterion 5, and it is a guard rather than a
  criterion testing nothing. `main takes only release` is what
  `a-promotion-names-what-it-refuses` criterion 4 fixed, and this task exists
  to keep it true while the other four change the tree around it. It passes
  now and it must pass after, which is the whole of what it is for
- Stand-in green: all five, discarded from file copies. It found a criterion
  that was wrong rather than code that was. Criterion 2's first proof used
  `tests/plans/units.md` as a path a bump may not touch, and the seat rule let
  it through correctly: the plan and suite pages are shared, open to every
  lane, which is the fifth open question above and not a defect. Proved on
  seat-owned paths instead. Criteria 2 and 3 also read as held up by 1 until
  the stand-in stood, because a lane that does not exist refuses a branch
  before any path is judged
- Tests: `acceptance.test.mjs`, beside this file, on scratch repositories,
  because the seat rule reads a branch and a diff and both have to be real
- Open questions: 5, listed above
- Blocked on: nothing
- Unblocks: item 13 of `plan/0.0.2.md`, the cut, which the operator drives
  with no pull request open that the league cannot merge
- Supersedes: nothing. The promotion's claim is untouched and this task exists
  to keep it that way
- People: none
