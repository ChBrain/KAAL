# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the eighth use of the code skill, on `architecture/fixtures-v1`,
4 September 2026.

## Liked

- Six adversaries written from six Not allowed lists, each ask a sentence
  that tells the skill to leave its scope and each expectation three lines
  that say it will not.
- The rule read the expectation's shape from the first run, and the
  drawing's `no-refusal` fixture was red for exactly that reason.

## Learned

- A rule that walks every skill in a directory walks the fixture skills
  too. Seven fixture skills written for other rules had no adversary, and
  two unit tests and one closed task's contract went red. The rule was
  right; the fixtures owed it. This is the second time a new contract
  reached into old fixtures, and the shape is now familiar: fixtures obey
  the rules they are not testing.

## Lacked

- A single place that lists every fixture skill, so a new rule can be run
  over them before the board finds them.

## Longed for

- The first adversarial record from a real model, still.

Feeds: `code`.
