# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the thirty-fifth use of the architect skill, on
`architecture/a-change-declares-its-class` (three seams over a command
that reads history), 7 September 2026.
Place: this repository

## Liked

- Deciding that a base which cannot be resolved is not the question
  either, rather than a fault. The workflows fetch one commit, so
  `origin/main` is absent in this repository's own CI, and a wall that
  goes red there would be deleted within a week rather than fixed. Saying
  where the wall bites, and where it is quiet, is better than pretending
  it bites everywhere.
- The contract holds the case that is common and easy to get wrong: a
  change touching only the league's own requirements and retros names none
  of the three artefacts. Most changes here are that change.

## Learned

- The stand-in was the only way to find that adding the wall to the board
  breaks a closed unit test that names the guarded list exactly. The
  drawing had predicted the table grows; it had not predicted the count in
  the test, and no amount of reading would have caught it because the test
  asserts a length rather than a member.
- Writing the wall into the surface page means this change moves the
  surface, which the command itself reports on its first run. The tool
  describing its own arrival is a small thing and it is also the proof
  that the report works.

## Lacked

- Nothing in the skill covers a seam whose far side is a runner, a hook
  and a workflow that behave differently from one another. The wall means
  three things depending on where it runs, and the drawing had to say so
  in a decision rather than in the seam, which is where a reader will
  look.
- No guidance on drawing a command that spawns another program. The
  boundary wall guards two trees and says nothing about the rest, so
  whether `bin/lib/class.mjs` may spawn git was mine to decide from
  precedent rather than from a rule.

## Longed for

- A place in a drawing to say where a wall bites and where it is quiet,
  since a wall that is silent in CI and loud at push time is two different
  promises and the template has one word for both.

Feeds: architect
