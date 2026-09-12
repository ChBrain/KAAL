# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the eighty-fifth use of the analyse skill, putting a superseded task's
fourth case on fixed ground, 12 September 2026.
Place: this repository

## Liked

- The fixture it needed already existed. `open-red` has been sitting in this
  task's own fixtures directory since the task was written, and the case read
  the league's tree instead.
- It failed honestly. The assertion said `push-v1 has a record, so it is not
  the unfinished task this reads`, which named the whole problem in one line
  and cost nothing to diagnose.

## Learned

- This is the second test in one day resting on another task being unfinished,
  and the two failed in opposite directions. The unit in `tests/gates.test.mjs`
  went green and stopped proving anything; this one went red and said why. The
  difference is that this case guarded its premise and the unit did not, and a
  guarded premise turns a silent hole into a five minute fix.
- The skill's own rule already forbids it. "On fixed ground: a test reads a
  fixture root, never the league's own tree for a state that a rerun or a
  later change will move." An unfinished task is exactly such a state, and it
  moved the day two models passed a fixture.
- A task being superseded does not retire its proof. `status-v1`'s criteria
  moved to `a-task-is-delivered-by-its-run` and its suite still runs and still
  has to pass, which is the tree's design and is why a superseded task's case
  can still break a release.

## Lacked

- Any way to find the rest of them. Two were found by being tripped over, and
  nothing reads a test for a path into the league's own tree that names a
  state rather than a shape.

## Longed for

- A rule with a wall under it. "On fixed ground" is prose in a skill, and the
  two cases that broke it today were both written after it was.

Feeds: analyse
Read: test
