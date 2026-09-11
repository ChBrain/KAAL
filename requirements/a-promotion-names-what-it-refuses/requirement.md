---
traces:
  parent: a-task-is-delivered-by-its-run@6c0a9097801da0ddca38f3a29e4ae5a9a596c665e2ed2025d49a6de9a5e11439
  supersedes: nothing
---

# Requirement: a-promotion-names-what-it-refuses

## Goal

A seat can leave a target red where the seat that must fix it can see it, and
a consumer never installs from a target that was left that way, because one
command says whether this tree may reach the target it is asked about and
names everything it refuses.

## What the runs said

- There is one target. `git branch -r` answers `origin/main` and the lane
  branches open against it, so the licence a red test already has and the
  branch a consumer installs from are the same place.
- The four verdicts already compute the two gates. `kaal runs` answers one of
  `delivered`, `not delivered`, `regressed` and `nothing ran` per task, and
  only the last two fail a wall today. The word a promotion must refuse is
  therefore a word the tree already says, and no new judgement is needed to
  read it.
- A red board can stand on `main` and nothing says so afterwards. The
  `runs` report and the `acceptance` wall disagreed about `push-v1` for as
  long as the report invented its counts, and `the-test-tree-is-written-down`
  carried a contract suite red for three days while the board read
  `not delivered`, which is an answer. Both were merged and both were on the
  branch a consumer installs from.
- A red wall has nowhere to stand for one merge. Adding
  `bin/lib/runs.test.mjs` answers `suites: suite: bin/lib/runs.test.mjs: no
suite names it` and the line that would name it is in the tester's tree, so
  the file and its naming are two lanes. The guard refuses them together, the
  board refuses either alone, and there are twenty-one more of these in the
  next item.
- The rule this task states is enforced today in the one direction it is not
  meant to hold. `.githooks/pre-push` runs `npm test`, which is `node
bin/kaal.mjs gates`, on the working tree whatever ref is being pushed, so a
  wall standing red on a lane branch cannot be pushed at all. Measured by
  adding `bin/lib/runs.test.mjs` with no line naming it: the board answers
  `suites: suite: bin/lib/runs.test.mjs: no suite names it` and the push is
  refused. The seat that can fix it never gets to put it where anyone can see
  it.
- The board is fourteen walls and every one is offline. `node bin/kaal.mjs
gates` runs with no network and reads only the tree, so a gate reading the
  branch a pull request is opened against needs nothing this tree does not
  already have.

## Assumptions

- The target is named and never inferred. A promotion is asked about a target,
  because a command that guessed from the checkout would answer differently on
  a developer's machine and in CI, and the answer a gate publishes on must be
  the same answer everywhere.
- Two targets and no more: `release` and `main`. A third would be a fourth
  rung on a ladder that has no evidence for one yet, and the asker named two.
- `not delivered` is the word this whole shape exists to place. It is the
  tester's licence, it is correct, and it is the one verdict that may stand
  below the promotion and never above it. The asker's words: the tester may
  turn a target red and CI may not.
- The board reports and the promotion refuses. That is the shape the asker's
  rule takes once a red wall is allowed to stand somewhere: a wall's colour is
  a fact about the tree and the same fact either way, and what changes between
  the two targets is whether the fact stops a merge. A board that refused
  everywhere would be the strict gate applied to every rung, which is what it
  is today.
- A red wall is placed the same way as a red verdict, and that is the asker's
  widening rather than this task's invention. What may stand on `release` is
  work in progress with an owner who can see it; what may reach `main` is
  neither red nor waiting.
- The promotion is the operator's act and the lane work is everyone else's.
  A seat cuts its branch from `release` and opens into `release`; the operator
  opens `release` into `main`. The asker's words, and it is why the strict
  gate has an owner rather than only a condition.
- Whoever fixes a red wall on `release` is not decided here. It is a block
  with an owner, the promotion is what refuses to forget it, and who picks it
  up is the manager's and belongs with the seats' own plans.
- The head branch is readable where the question is asked. In a gate it is the
  pull request the environment names; on a desk there is usually no pull
  request at all, and that is not a failure, it is a question this tree is not
  being asked. The flags exist so a test can drive the command without
  inventing an environment.
- A gate that says nothing where there is nothing to judge is a gate the board
  can carry. Exit 2 already means this in every other command here, and it is
  what lets the head rule be a wall today rather than a workflow condition
  nobody can run locally.

## Constraints

- A promotion is not a lane's diff and cannot be judged as one. It carries
  every seat's work by design, and the seat rule reads a lane off the branch
  name, which `release` is not. From the ask: the operator moves release to
  main, so the promotion has an owner and the rule that gives a diff one seat
  is the wrong question to ask of it.
- Deterministic and offline, like every other wall. From the ask: the ladder
  ends at a wall, and a wall that asks a service a question is a wall that
  answers differently on a Sunday.
- No new judgement about a suite. The four verdicts are computed in one place
  and this task reads them; a second opinion about whether a task is done
  would be a second place to be wrong.
- Nothing here is a setting. What must be a setting is named as a setting and
  left to the human, because a check that claims to enforce what a ruleset
  enforces is a check that lies the day the ruleset is changed.
- A refusal names what it refuses and never what to do about it. From the
  league's own rule: the blocked seat says where, the owning seat says what.

## Acceptance criteria

1. `kaal promote --into <target> --from <head>` answers about a tree and says
   which target it judged, on a line reading `promote: into <target>`,
   whatever else it says. Where the flags are absent it reads the pull request
   the environment names, so the same question is asked the same way on a desk
   and in a gate. A target that is neither `release` nor `main` is usage: the
   command names the two it knows and exits 1 without judging the tree.
2. Reaching `release` refuses a claim that was true and is not. A task whose
   verdict is `regressed` or `nothing ran` is a finding reading
   `<task>: verdict: <word>`, and the command exits 1. A task whose verdict is
   `delivered` or `not delivered` is no finding here.
3. Reaching `main` refuses those two and `not delivered` as well, in the same
   words, so a reader tells the tester's licence from a claim that broke
   without opening a second page.
4. Reaching `main` from a head that is not `release` is a finding reading
   `<head>: head: <message>`, and it stands where every verdict is clean.
   Reaching `release` from a head that no lane in `kaal.config.json` holds is
   a finding in the same shape.
5. Reaching `main` is refused while any wall on the board is red, and each red
   wall is a finding reading `<wall>: wall: <message>`. Reaching `release` is
   not refused for a red wall, and the answer says how many are red either
   way, so it is never silent about them.
6. Every finding a promotion makes is said before the command exits, and the
   last line counts them: `promote: into <target>: <n> finding(s)`, or a
   sentence saying nothing refuses it where there are none. A promotion that
   refuses for four reasons names four, because a gate that stops at the first
   turns one merge into four.
7. Where there is no promotion to judge, the question is not this tree's. With
   no flags and no pull request in the environment the command says so and
   exits 2, which is the answer a board is allowed to carry: a wall holding
   this is silent on a desk and judges in a gate.
8. A promotion is not a lane's diff. `kaal seats` on a branch of `release`,
   which is the branch it is given rather than one it guesses, answers that
   this is a promotion and exits 2, rather than reporting that the branch
   matches no lane, and it says the promotion is the operator's. Every other
   branch is judged as it is today.
9. `kaal gates` judges by the target the tree opens into, so the rule holds at
   the desk as well as at the gate. Where that target is `release`, a red wall
   is reported and the command exits 0, and how many walls are red is on the
   answer; where it is `main`, a red wall fails as it does today. This is the
   command the pre-push hook runs, so a seat can put a red wall where the seat
   that can fix it sees it, which is the whole of what `release` is for.

## Open questions

- Is `promote` the right word at the surface, or is this a flag on `runs`?
  The command answers about a tree and a target and writes nothing, which is
  what `runs` does, and the asker named neither.
- Does the head branch belong on the command line or in the environment? CI
  has it in both, a desk has it in neither reliably, and a flag is the only
  one of the two a test can drive.
- What happens to `release` between promotions: is it reset from `main` after
  each one, or does it carry on? The answer changes whether a refused
  promotion leaves a branch somebody must clean up.
- Should a promotion into `release` say what it would refuse at `main`, so a
  seat sees the strict gate before it is standing in front of it?
- `main` can move without `release`, by a hotfix, and nothing in the tree
  reads the pair or says which way the sync goes. The asker's shape is a pull
  request from `main` into `release` where they are out of step. That is a
  second task and not this one: this one judges a promotion that is being
  asked for, and that one notices two targets that have drifted with nobody
  asking anything. Named here so it is written down somewhere: `a-target-that-
moved-alone-says-so`.

## Handoff

- Task: a-promotion-names-what-it-refuses
- Criteria: 9; tests: 9 (equal)
- Red run: `node --test requirements/a-promotion-names-what-it-refuses/acceptance.test.mjs`
- Tests: `acceptance.test.mjs`, beside this file, on scratch trees, because a
  promotion is asked about a tree and this tree is the one that would answer
  about itself
- Open questions: 4, listed above
- Amended after the drawing, which named this gap and refused to widen its
  seams to cover it: a drawing that writes its own criteria is the architect
  taking the analyst's seat. The drawing gains a seam for criterion 9 and that
  is the architect's next diff
- Built in the order the asker asked for, and criterion 4's first half is
  first: a wall refusing a pull request into `main` from anything but
  `release`. It needs criteria 1, 4, 7 and 8 and none of the others, it is the
  whole of the protection that cannot be a setting, and it stands whatever the
  verdicts say. This task then sits `not delivered` until the other four
  criteria are green, which is the licence it is about, standing below the
  promotion it defines
- Blocked on: Kai, for four rows in a ruleset that no wall can read: a pull
  request required on `release` and on `main` with no direct push, force push
  and deletion blocked on both, the checks marked required, and `release`
  itself cut from `main`. None of the four blocks this requirement, its
  drawing or its build; all four block the first promotion
- Carries a governance diff that lands the same day the branch exists: a lane
  branch is cut from `release` and no longer from `main`, which is a sentence
  in `AGENTS.md` and in `CLAUDE.md`. Written a day late, the next branch comes
  off the wrong base and the first merge is a conflict nobody caused
- Unblocks: moving the twenty-one units beside the modules they import, which
  has no order that is not red on one target; and the release itself, which is
  the first promotion this rule judges
- Supersedes: nothing
- People: none
