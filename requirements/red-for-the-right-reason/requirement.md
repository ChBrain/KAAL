# Requirement: red-for-the-right-reason

_Written in analyse mode, in an analyst run over twelve unconsumed retros
of the analyse skill. Six of them record "Lacked: nothing new"; their
Longed for items are carried below as open questions. The two that carry
this task's Lacked items are the twenty-ninth and the thirtieth. The other
half of the stack is `what-a-closed-task-fixes`, filed beside this._

## Goal

Whoever reads a handoff wants its red run to be evidence and not a plan;
and whoever writes a criterion about something that must not happen wants
to know that a test which passes because nothing ran at all has proved
nothing. They will know when the skill says both, in the place a writer
reads before the handoff is written.

## Assumptions

- The defect is real and was seen twice in one day, in two seats. Two of
  four acceptance tests passed against a command that did not exist,
  because an unknown command exits 1, writes nothing to any tree, and
  prints usage: a criterion about an effect not happening was satisfied by
  nothing happening. In the developer's seat the same day, a test of an
  ordering passed against a walker with its sort removed, because the tree
  the test built came back from the filesystem already sorted.
- The skill already says every test is seen red before it is trusted
  green. It says nothing about the reason for the colour, and the reason
  is the whole content of the rule.
- The cure is cheap and mechanical: tie the test to a run that happened,
  and where the criterion is about absence, show the thing could have
  happened. It takes a minute and it found two real holes.
- A test green before the build is not always a defect. It is legitimate
  when it guards a reader or a rule that must not change, and it is a
  defect when it passes because the subject does not exist yet. The
  handoff is where a reader is told which.
- These criteria are text in `skills/analyse/SKILL.md`. Nothing in `bin/`
  reads them; the ladder's rung for them is the skill, not a script.

## Constraints

- The skill stays under its line budget and the standard's shape; no
  vendor, no dash (rules).
- The analyse skill's text moves, so its fixture's `RUNNER.md` goes stale
  and is regenerated in the same change (the runners wall).
- The retros named below are moved, not deleted: `retros/archive/` keeps
  them, so the stack holds only what the next run will read.

## Acceptance criteria

1. The analyse skill says that a criterion whose subject is something not
   happening needs a test that proves the thing could have happened, and
   says why: a proof that passes because nothing ran is a coincidence.
2. The skill says the handoff's red run is written from the run and never
   from the plan, and that a test green before the build is named in the
   handoff with the reason it is green.
3. These six retros are under `retros/archive/` and none remains in
   `retros/`: `2026-09-06-analyse-twenty-second-use.md`,
   `2026-09-06-analyse-twenty-third-use.md`,
   `2026-09-06-analyse-twenty-fourth-use.md`,
   `2026-09-06-analyse-twenty-fifth-use.md`,
   `2026-09-06-analyse-twenty-ninth-use.md`,
   `2026-09-06-analyse-thirtieth-use.md`.

## Open questions

- The thirtieth use asked for guidance on a conditional criterion, one
  required only when the subject carries something. It is a real gap and
  it is not this task: the difficulty there was deciding which reader can
  see the condition, which is nearer design than analysis.
- Should `kaal fixtures` know a tree when it sees one, so a fixture that
  ships data rather than text is listed as a shape (thirtieth)?
- Should the stack's own run be a script: the filenames, the archive move,
  the count restart (twenty-second)?
- Should a node rule tell a part from the outside world, so the diagram
  wall can grow the way three seats asked (twenty-third)?
- Should a fixture be a git repository, so a resolved path is proven on
  fixed ground rather than on the league's own tree (twenty-fifth)?

## Handoff

- Task: red-for-the-right-reason
- Criteria: 3; tests: 3 (equal)
- Red run: `node --test --test-timeout=60000 requirements/red-for-the-right-reason/acceptance.test.mjs`;
  all three red
- Tests: `acceptance.test.mjs`, beside this file
- Open questions: 5, listed above
- Status: closed
- Blocked on: nothing
- Supersedes: nothing
