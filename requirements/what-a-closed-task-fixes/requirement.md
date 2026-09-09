---
traces:
  supersedes: nothing
---

# Requirement: what-a-closed-task-fixes

_Written in analyse mode, in the same analyst run as
`red-for-the-right-reason`, over twelve unconsumed retros of the analyse
skill. The Lacked items behind this task are the thirty-third's, and the
guest lessons of the thirty-first and thirty-second were answered between
the retro and this run by `a-guest-takes-no-orders`, which is recorded
below rather than made into criteria a second time._

## Goal

Whoever writes a task that touches a path another task closed wants to
find what is actually fixed there, and to know what it costs to move it;
they will know when the skill says that a closed task's tests fix shapes
its criteria never state, and says what a supersede must name before it is
allowed to be one.

## Assumptions

- Twice in one day the thing in the way was a closed test rather than a
  closed criterion, and both times it was found by grepping on a hunch.
  `applies-here` names four commands in a unit test and says nothing about
  them in its criteria; `assess-boundary` fixes a finding's shape in a
  unit test that compares one interpolated string. Neither is readable
  from the requirements.
- The skill says to read the closed requirements whose criteria touch the
  path. It says criteria, and that is the gap: a test is where a promise
  is actually held.
- Superseding is not the same as giving way, and the difference is the
  closed task's own stated principle, not convenience. `code-v2` had a
  reason that pushed against guarding `kaal fixtures`, so a new criterion
  gave way. `applies-here` guarded the commands that judge a tree against
  a league artefact, and four more do exactly that, so the closed task
  gave way instead. Both were decided on the same test.
- A supersede that does not name the exact claim that moves is a licence
  rather than a decision. The `Supersedes` line in the template has no
  guidance at all, and what went in it was a guess that happened to be
  the right grain.
- The thirty-first and thirty-second retros asked for a rule about the
  tree's own conventions and about untrusted input. Both were answered by
  `a-guest-takes-no-orders`, closed, and are not criteria here.
- These criteria are text in `skills/analyse/SKILL.md`.

## Constraints

- The skill stays under its line budget and the standard's shape; no
  vendor, no dash (rules).
- The analyse skill's text moves, so its fixture's `RUNNER.md` goes stale
  and is regenerated in the same change (the runners wall).
- The retros named below are moved to `retros/archive/`, not deleted.

## Acceptance criteria

1. The analyse skill says to read the tests of the closed requirements
   whose paths the task touches, as well as their criteria, and says why:
   a closed test fixes shapes no criterion states.
2. The skill says what a supersede names: the closed task, the exact claim
   that moves, and the principle that permits it; and that where the
   closed task's own principle pushes the other way, the new criterion
   gives way instead.
3. These six retros are under `retros/archive/` and none remains in
   `retros/`: `2026-09-06-analyse-twenty-sixth-use.md`,
   `2026-09-06-analyse-twenty-seventh-use.md`,
   `2026-09-06-analyse-twenty-eighth-use.md`,
   `2026-09-06-analyse-thirty-first-use.md`,
   `2026-09-06-analyse-thirty-second-use.md`,
   `2026-09-06-analyse-thirty-third-use.md`.

## Open questions

- Three seats asked on the same day for one reading: given a path or a
  command about to change, which closed tests name it. It is tooling and
  not skill text, and it is the strongest repeated signal in the stack.
- How small may a task be before the three seat chain costs more reading
  than the change, and where is that reason recorded (twenty-eighth)? It
  ended up in a drawing, which is the architect's page and not the
  analyst's.
- What tells an analyst which fixtures a skill change made blind
  (twenty-eighth)?
- Does a use of a skill on a directory it was pointed at deserve a record
  of its own, the way an eval run does (twenty-seventh)?
- Is assessment a seventh seat (twenty-sixth)?

## Handoff

- Task: what-a-closed-task-fixes
- Criteria: 3; tests: 3 (equal)
- Red run: `node --test --test-timeout=60000 requirements/what-a-closed-task-fixes/acceptance.test.mjs`;
  all three red
- Tests: `acceptance.test.mjs`, beside this file
- Open questions: 5, listed above
- Blocked on: nothing
- Supersedes: nothing
- People: none
