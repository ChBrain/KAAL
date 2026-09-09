---
traces:
  supersedes: nothing
---

# Requirement: a-diff-carries-one-seat

_Ask, from Kai, after watching a build overwrite the analyst's own fixtures:
"which is why we need to introduce hard lanes like in khai. requirements /
architecture / test / code should not travel together. that's preventing
accidents like this as well as cheating. that's also one of the reason for my
tree concept and backward tracing only."_

## Goal

Whoever reviews a pull request wants to know that the seat which wrote a
proof is not the seat that made it pass, and whoever builds wants to be
stopped before they edit a proof rather than told afterwards; they will know
it by the board naming the seats a diff touches, refusing a diff that touches
more than one, and refusing a diff that changes a proof its seat did not
write unless the change is declared as a supersede.

## What the runs said

- The rule is already written and nothing reads it. `AGENTS.md` says "One
  pull request, one lane", "A seat declares the paths it may change, the lane
  is read off the diff", and "never edit another seat's test to make it pass;
  hand it back to its owner". No seat declares any paths anywhere in this
  tree, no command reads a diff for a lane, and no wall runs one.
- The lane the same page names for a task is every seat at once:
  `requirement/<task>` is defined there as "a requirement with its drawing
  and build", which is the analyst, the architect and the developer in one
  branch by definition.
- Sorting the last twenty commits on main by the seat directories they touch,
  every `Specify` and every `Draw` commit touches one seat and every `Build`
  commit touches three or four. Six builds in that span, six crossings, and
  the pattern has no exception.
- In this session alone, a build overwrote three of the analyst's fixture
  roots with a different grammar before reading them, and nothing in the tree
  said a word. The same session's builds superseded five claims across four
  closed tasks, every one of them legitimate and every one of them recorded
  only because the person doing it chose to record it.
- The sibling repository's guard does this in two pieces. Its
  `khai-guard.config.json` carries a `branchScope` with one lane per branch
  pattern, an `allow` list of globs per lane, and a `shared` list every lane
  may touch; and `khai-guard branch <topic>` reads the working tree, resolves
  the lane from the diff and creates the branch, so the lane is computed and
  never chosen. Beside it a separate gate refuses a diff that carries source
  and test together, with the fix "split into separate PRs, tests first,
  source second".
- The tester's own directory is mostly somebody else's implementation.
  `tests/` holds 21 unit suites and, since the test tree landed, a strategy
  and three plans. Seventeen of the 21 are named for a module directly beside
  them: `tests/rules.test.mjs` for `bin/lib/rules.mjs`, and so on for
  sixteen more. Four name no single module: `assess`, `witness`, `kaal` and
  `judged`. One unit suite already lives beside its code, under
  `skills/analyse/scripts/`.
- `kaal class` already reads a diff rather than a tree: it takes
  `--against <ref>`, reports what moved, and answers that the question is not
  this tree's where no base ref resolves. A wall that reads a diff is not a
  new kind of thing here.

## Assumptions

- The seats are four and a case belongs to whoever delivers the thing it
  tests, which the asker settled while this was being written: "the tester
  defines the strategy and governs (read) the test plans, but analyst,
  architect and coder do have their own test cases, close to what they
  deliver ... test/ contains the test plans which POINT at the test cases,
  but do not implement them there". So the analyst owns `requirements/`,
  which is a requirement and its acceptance cases; the architect owns
  `architecture/`, a drawing and its contract cases; the developer owns the
  code and its unit cases beside it; and the tester owns `tests/`, which is
  the strategy and the plans and nothing that runs.
- That makes a build one seat, which is what makes this guard liveable. A
  build lands code and the unit cases of that code, both the developer's,
  and closes its own requirement's Handoff. Nothing else about it crosses.
  The crossings that remain are the ones that should be refused: a build
  that amends the drawing is handing work back to the architect and should
  say so in a second diff.
- Everything else in the tree is owned by no seat and is not a crossing:
  `retros/`, `kaal/`, `skills/`, `SURFACE.md`, `AGENTS.md`, the workflows and
  the config.
- A build must be able to close the requirement it builds. The board already
  refuses an open task whose tests are all green, so a build that could not
  write its own Handoff would land red by construction. The Handoff and the
  Build sections of the requirement a diff is building are therefore not the
  analyst's seat; the Acceptance criteria of the same page are.
- Superseding is legitimate and stays legitimate. Five claims moved in this
  session and every one was correct. What the ask calls cheating is not the
  change but the silence, so the escape is a declaration and never a flag: a
  diff that changes a proof it did not write names the task it supersedes, in
  a requirement in the same diff, where the trace wall already reads it.
- A guard that only reports is worth less than one that refuses, but a guard
  that refuses without an escape stops every build in the league. Both halves
  land together or neither does.
- The tree's own paths are the declaration. A seat's paths belong in the
  config the board already reads, not in a second list beside `AGENTS.md`
  that drifts from it.
- Nothing here changes what a person may do by hand. A person can rename a
  branch and split a diff; the guard says the diff is two, and the split is
  the person's act.

## Constraints

- The exit vocabulary holds: 0 an answer, 1 findings, 2 the question is not
  this tree's. A tree with no base ref to read a diff against answers 2, the
  way `class` does.
- The guard reads the working tree and git, and nothing else. No network, no
  provider, no model.
- `AGENTS.md` keeps saying what it says today; if the lane it names for a
  task is now wrong, this task corrects that page rather than leaving two
  answers in the tree.
- The skill rules apply to any skill text this touches: MIT, the standard's
  shape, no vendor or product named, no dash, under five hundred lines.

## Acceptance criteria

1. Each seat's paths are declared once, in `kaal.config.json`, as a name and
   the globs it owns; a path owned by no seat is not a finding and a path
   owned by two is.
2. The command reads a diff against a base ref and names the seats it
   touches, one line per seat, and answers that the question is not this
   tree's where the base ref does not resolve.
3. A diff touching two seats is a finding naming both seats and, for each,
   one path that put it there.
4. A diff that changes the requirement it builds is not a crossing where it
   changes the Handoff or the Build section, and is a crossing where it
   changes the Acceptance criteria.
5. A diff that changes an acceptance test, a fixture under `requirements/`,
   or a drawing's contract test is a finding naming the file, whatever else
   the diff touches, unless a requirement in the same diff declares a
   supersede of the task that owns it.
6. The board runs it, and the fix line says to split the diff rather than to
   widen the declaration.
7. `AGENTS.md` names the same seats and the same paths as the config, and
   does not name a lane that carries more than one seat.

## Open questions

- Does the guard also create the branch, the way the sibling's does, so the
  lane is computed and never chosen? That is the half that helps a weaker
  model most, and it is a second command rather than a second criterion.
- Answered while this was written, and the answer is neither of the two this
  question offered: a case belongs to the seat that delivers what it tests,
  and `tests/` holds plans that point rather than cases that run. The
  assumption above carries it. What it leaves behind is a task and not a
  question: 21 unit suites sit in the tester's directory today and belong
  beside the code, and moving them is the developer's diff while the plan
  that points at them is the tester's.
- Does a rename count as a crossing? Moving a unit case from `tests/` to
  `bin/lib/` deletes a tester path and adds a developer one, which is two
  seats by the letter and one act by any reading. The sibling repository's
  guard carries an `exemptRenames` flag for exactly this.
- Should the guard refuse at the push hook, at the board, or both? The board
  is where every other wall lives; the hook is the only place that can stop a
  diff before it is public.
- Is a retro a seat's? Every build writes one under `retros/`, and if that
  is nobody's the file is free, which is right, but it is worth saying so.
- The ask names backward tracing as part of the same idea. This task does not
  touch the trace direction, which already runs one way. Is there a second
  task there, or is the tracing already what the ask wanted?

## Handoff

- Task: a-diff-carries-one-seat
- Criteria: 7; tests: 7 (equal)
- Red run: `node --test requirements/a-diff-carries-one-seat/acceptance.test.mjs`,
  all seven failing, and each on its own missing thing: one and seven on the
  config declaring no seats, two to five on `kaal seats` not existing, six on
  no gate running it. Every call of the command is followed by a check that
  it is not the usage line, so no criterion is red for a missing command
  wearing another message
- Tests: `acceptance.test.mjs`, beside this file, with fixture roots holding
  a scratch git repository per shape of diff
- Open questions: 5, listed above
- Blocked on: nothing to specify. The second open question changes how many
  pull requests a build becomes, and the drawing can hold it
- Unblocks: every future build, which is the point: this is the task that
  makes the accident that prompted it impossible rather than regrettable
- Supersedes: nothing yet. Criterion 7 may move what `AGENTS.md` says about
  the `requirement/<task>` lane, which is a page and not a task's claim
- People: none
