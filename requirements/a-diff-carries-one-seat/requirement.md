---
traces:
  supersedes: nothing
---

# Requirement: a-diff-carries-one-seat

_Ask, from Kai, after watching a build overwrite the analyst's own fixtures:
"which is why we need to introduce hard lanes like in khai. requirements /
architecture / test / code should not travel together. that's preventing
accidents like this as well as cheating. that's also one of the reason for my
tree concept and backward tracing only." Re-specified after the first drawing
was closed unbuilt: "branch scoped lanes, deny by default, no section
exemption"._

## Goal

Whoever reviews a pull request wants to know that the seat which wrote a
proof is not the seat that made it pass, and whoever builds wants to be
stopped before they edit a proof rather than told afterwards; they will know
it by the branch declaring the lane, the board refusing any path that lane
does not allow, and refusing a proof its seat did not write unless the change
is declared as a supersede.

## What the runs said

- The rule is written and nothing reads it. `AGENTS.md` says "One pull
  request, one lane", "A seat declares the paths it may change, the lane is
  read off the diff", and "never edit another seat's test to make it pass;
  hand it back to its owner". No seat declares any paths anywhere in this
  tree, no command reads a diff for a lane, and no wall runs one.
- The lane that page names for a task is every seat at once:
  `requirement/<task>` is defined there as "a requirement with its drawing
  and build", which is the analyst, the architect and the developer in one
  branch by definition.
- Sorting the last twenty commits on main by the seat directories they touch,
  twelve of the twenty touch more than one. Every build touches three or
  four. What is new since this was first specified is that specifying and
  drawing now cross too: `1f27988`, a specify, touches `requirements/` and
  `tests/`, and `b1f09ed`, a draw, touches `architecture/` and `tests/`.
- Those two crossings are a machine's and not a seat's. `kaal traces --write`
  calls `writeCounts`, which rewrites the suite count in `tests/plans/*.md`,
  so any diff that adds or removes a suite moves a file in the tester's
  directory without anybody deciding to. A guard that reads paths alone
  cannot tell that from a person editing the plan.
- The field the old drawing's exemption stood on is gone. `- Status:` was
  removed from every requirement page by `a-task-is-delivered-by-its-run`,
  and grepping `bin/` for `## Build` or `Handoff` finds one reader: the
  people line. Nothing in the tree now makes a build write on a requirement
  page, so nothing makes an exemption necessary.
- The sibling repository declares this as data, and the shape is two lists.
  `khai-guard.config.json` carries `branchScope` with a `shared` list every
  lane may touch and a `lanes` list of `{ pattern, layer, allow }`, plus a
  top level `exemptRenames`. Its board runs a branch check whose fix line
  tells the reader to ask the tool which lane the files belong to, then
  rename or split the branch. Deny by default is that config's whole shape:
  a lane allows, and what it does not allow is refused.
- `kaal class` already reads a diff rather than a tree: it takes
  `--against <ref>`, reports what moved, and answers that the question is not
  this tree's where no base ref resolves. A wall that reads a diff is not a
  new kind of thing here.
- The board is thirteen walls green today, and one of them, `coverage`,
  reports that the tester has no record for this task and the architect no
  drawing. Both are true and both are this task.

## Assumptions

- The lane comes from the branch and never from the diff. Reading the lane
  off the diff makes every diff its own lane by construction, which is the
  answer a guard exists to refuse: whatever you changed is what you meant to
  change. A branch name is chosen once, before the work, and it is the one
  declaration a person makes that the guard can hold them to.
- Deny by default, because allow by default is the vacuous pass wearing a
  config. The first specification said a path no seat owns is not a finding,
  which means every path nobody remembered to declare is free, and the tree
  grows paths faster than it grows declarations. A lane allows what it
  allows, everything else is refused, and the paths every lane may touch are
  a third list somebody had to write down on purpose.
- One lane per seat per task, so a lane never carries two. That means four
  task lanes where there was one: the analyst's, the architect's, the
  developer's and the tester's. The remaining lanes carry no seat at all:
  governance, a skill, an agent, an eval.
- No section exemption, because nothing needs one any more. The old drawing
  exempted a build's own requirement in its Handoff and its Build, and the
  reason was that the board refused an open task whose tests were all green,
  so a build that could not close its own page landed red by construction.
  That field is gone and delivery is computed from a run record. A build now
  touches no requirement page at all, and where a build's own record goes
  instead is an open question below and not this task's to answer.
- Superseding is legitimate and stays legitimate. What the ask calls cheating
  is not the change but the silence, so the escape is a declaration and never
  a flag: a diff that changes a proof it did not write names the task it
  supersedes, in a requirement in the same diff, where the trace wall already
  reads it.
- A guard that only reports is worth less than one that refuses, and a guard
  that refuses without an escape stops every build in the league. Both halves
  land together or neither does.
- The tree's own paths are the declaration. The seats, the lanes and the
  shared paths belong in the config the board already reads, not in a second
  list beside `AGENTS.md` that drifts from it.
- Nothing here changes what a person may do by hand. A person can rename a
  branch and split a diff; the guard says the diff does not fit its lane, and
  the split is the person's act.

## Constraints

- The exit vocabulary holds: 0 an answer, 1 findings, 2 the question is not
  this tree's. A tree with no base ref to read a diff against answers 2, the
  way `class` does.
- The guard reads the working tree, the branch and git, and nothing else. No
  network, no provider, no model.
- `AGENTS.md` and `CLAUDE.md` say what the config says; if the lanes they
  name are now wrong, this task corrects those pages rather than leaving two
  answers in the tree.
- The skill rules apply to any skill text this touches: MIT, the standard's
  shape, no vendor or product named, no dash, under five hundred lines.

## Acceptance criteria

1. `kaal.config.json` declares, once, `seats` as a name and the paths each
   owns, `lanes` as a branch pattern and the one seat it carries or none, and
   `shared` as the paths any lane may change; a path two seats own is a
   finding naming the path, and a lane naming two seats is a finding naming
   the lane.
2. The command reads the branch it is on and a diff against a base ref, and
   prints one line naming the lane the branch matched and one line beginning
   `seat ` for every seat the diff touches; where the base ref names no commit
   it answers that the question is not this tree's.
3. A changed path that is neither owned by the lane's seat nor listed in
   `shared` is a finding naming that path and that lane, whether or not some
   other seat owns it, and a diff every one of whose paths is allowed is not
   a finding whatever else it carries.
4. A branch whose name matches no lane is a finding naming the branch and
   every lane pattern it could have matched, and never an answer that the
   diff is clean.
5. A diff that changes an acceptance test, a fixture under `requirements/`,
   or a drawing's contract test is a finding naming the file, whatever else
   the diff touches, unless a requirement in the same diff declares a
   supersede of the task that owns it.
6. The board runs it, and the fix line says to split the diff or rename the
   branch, and never to widen the declaration.
7. `AGENTS.md` names the same seats and the same lane patterns as the config,
   and names no lane that carries more than one seat.

## Open questions

- Where does a build's own record go, now that it may not go on the
  requirement page? `a-build-says-what-it-proved` is specified and undrawn
  and its goal says "the handoff carrying the change class the tooling
  computed", which assumes a handoff a build may write. That task owns the
  answer; this one only takes the old place away.
- Is `tests/plans/*.md` shared, or does a count a machine writes stop being
  the tester's file? Every specify and every draw moves it today and nobody
  chose to. Listing it in `shared` is the small answer; moving the count out
  of the tester's directory is the honest one, and it is another task.
- Does the guard also create the branch, the way the sibling's does, so the
  lane is computed and never chosen? That is the half that helps a weaker
  model most, and it is a second command rather than a second criterion.
- Does a rename count as a crossing? Moving a unit case from `tests/` to
  `bin/lib/` deletes a tester path and adds a developer one, which is two
  lanes by the letter and one act by any reading. The sibling carries an
  `exemptRenames` flag for exactly this, and 21 unit suites are waiting on
  the answer.
- Should the guard refuse at the push hook, at the board, or both? The board
  is where every other wall lives; the hook is the only place that can stop a
  diff before it is public. The board runs in the hook, so the board may be
  both already.
- Is a retro a seat's? Every seat writes one under `retros/`, so it is in
  `shared` or it is nobody's, and either way it is worth saying once.

## Handoff

- Task: a-diff-carries-one-seat
- Criteria: 7; tests: 7 (equal)
- Red run: `node --test --test-timeout=60000 requirements/a-diff-carries-one-seat/acceptance.test.mjs`,
  all seven failing, and each on its own missing thing: one and seven on the
  config declaring no seats, lanes or shared paths, two to five on
  `kaal seats` not existing, six on no gate running it. Every call of the
  command is followed by a check that it is not the usage line, so no
  criterion is red for a missing command wearing another message
- Tests: `acceptance.test.mjs`, beside this file, with a scratch git
  repository per shape of diff, branched by name so the lane is read rather
  than inferred
- Seen red one at a time: each of the seven run alone as well as together,
  and each red on its own missing thing rather than on one shared
  precondition
- Stand-in green: all seven, on a throwaway `seats` command, a config
  carrying four seats, eight lanes and one shared path, a gate and a rewritten
  lane sentence in `AGENTS.md`, then discarded from file copies
- Found by the stand-in, which is why criterion 2 fixes a format: the test
  counted the seat lines by the seat's name, and the lane's own line names
  its seat too, so one seat read as two. A criterion that says one line per
  seat has to say what a seat's line looks like, and it now says the line
  begins `seat `
- Open questions: 6, listed above
- Blocked on: nothing to specify
- Unblocks: every future build, which is the point: this is the task that
  makes the accident that prompted it impossible rather than regrettable
- Amended, not superseded: this page's criteria moved after its first drawing
  was closed unbuilt, and no drawing pins them. What moved is three things.
  The lane now comes from the branch and not the diff, which criterion 2
  carries. A path no seat owns is now a finding rather than free, which
  criterion 3 carries and which is the old criterion 3 read the other way
  round. The exemption that let a build write its own requirement's Handoff
  and Build is gone with the field that forced it, and the old criterion 4 is
  now the branch that matches no lane, because a guard that says nothing
  about a branch it does not recognise is the vacuous pass this league spends
  its days refusing
- People: none
