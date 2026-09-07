# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the thirtieth use of the code skill, on the build of
`nothing-passes-vacuously` (four table entries, three branches taking a
root, three superseded unit tests), 7 September 2026.
Place: this repository

## Liked

- The drawing had predicted which closed unit tests would move and named
  all three. All three moved, nothing else did, and the amendments were
  mechanical because the reason for each was already written down.
- Checking the four commands on a bare temporary directory at the end, by
  hand, and reading the four lines a caller would actually see. The tests
  say the same thing; the lines are what a person gets.

## Learned

- A closed test caught the design nearly breaking a claim by accident.
  `applies-here` fixed that two commands must not give the same reason, and
  the drawing had `retros` and `runner` sharing a rule, so they did. The
  unit test failed on a count, which is exactly what a closed test is for:
  holding a promise the new work did not think about.
- The sharper rule was also the truer one. The runner reads a fixture, not
  a skill, so a tree with skills and no fixture has nothing for it to keep
  current, which the requirement's own open question had already said. The
  fix came out better than the drawing, which is not the usual direction.

## Lacked

- The skill says nothing about a build that improves on its drawing. This
  repository has now done it twice, both times by amending the drawing with
  a note saying what the build found and why, and both times I decided the
  shape of that note myself.
- Nothing distinguishes a drawing amended because it was wrong from one
  amended because the build learned something. The second is healthy and
  reads exactly like the first.

## Longed for

- A named move for it, so a developer who sharpens a drawing writes it in a
  known place and a reader can tell that from a developer who wandered.

Feeds: code
