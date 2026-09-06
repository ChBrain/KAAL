# Requirement: asks-when-not-told

_Written in analyse mode. Ask, from Kai: "how can we test external work
mode?", and on the answer, "go" on a list whose first item was this. The
`json-flag` fixture's ask names no place, so under `where-a-skill-acts`
every model running it should now ask which of the two places it is in
before it begins. Its checklist has no item for that, so a rerun would
pass while the behaviour we just shipped went unjudged. This is the
cheapest test of external mode there is: it needs no tree, no new
machinery, and the fixture already exists._

## Goal

Whoever reads a `json-flag` record wants to know whether the model asked
where it was acting, not only whether its requirement was any good; they
will know when the fixture's checklist carries that as an item the reader
marks met or not met, in the same shape as the rest.

## Assumptions

- The checklist is faithful to the skill rather than lenient with it. The
  skill says a model not told asks before it begins, so the item says
  asks, and a model that silently assumes the repository is marked not
  met. If models assume rather than ask across records, that is a finding
  for the analyst, which is what a record is for.
- The `json-flag` ask stays an ask that names no place. It is what makes
  this fixture the not-told case, and nothing in this task touches it.
- The fourteen other fixtures do not gain the item here. Whether every
  checklist should judge place is a real question, and it is a sweep with
  a rule behind it, not a line in one file.
- Records already written for this fixture are stale, because the analyse
  skill moved in `where-a-skill-acts`. This task makes them stale a second
  time, by `expect_sha`, at no extra cost.

## Constraints

- The reading prompt is generated from `expect.md`, so the fixture's
  `RUNNER.md` goes stale and is regenerated in the same change (the
  runners wall).
- No change to `ask.md`, to any other fixture, or to any skill's text.

## Acceptance criteria

1. `skills/analyse/fixtures/json-flag/expect.md` carries a checklist item,
   in the same bullet shape as the rest, saying that because the ask names
   no place the output asks which of the two places the skill is acting in
   before it begins, and does not silently assume one.

## Open questions

- Should every fixture's `expect.md` judge the place question, told or not
  told, as a rule `kaal check` reads the way it reads the adversarial
  fixture rule? Fifteen fixtures, one line each, and a wall that catches
  the sixteenth.
- Does an ask that names a place need a fixture of its own here, or does
  `pointed-elsewhere` cover it when it arrives?
- A model may say plainly that it is acting in the repository rather than
  asking. The checklist calls that not met. Is that the right reading, or
  is a stated assumption the asker can deny as good as a question?

## Handoff

- Task: asks-when-not-told
- Criteria: 1; tests: 1 (equal)
- Red run: `node --test --test-timeout=60000 requirements/asks-when-not-told/acceptance.test.mjs`;
  red; seen green on a stand-in line in the checklist, then discarded
- Tests: `acceptance.test.mjs`, beside this file
- Open questions: 3, listed above
- Status: closed
- Blocked on: nothing
- Supersedes: nothing
