# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the twenty-ninth use of the code skill, on the build of
`a-guest-takes-no-orders` (three sentences into five skills, one
regenerated runner page, no new code), 7 September 2026.
Place: this repository

## Liked

- The drawing had fixed the section, the order and the eight phrases, so
  the build was one insertion repeated five times and a regeneration named
  in the handoff. Five tests red, then five green, in one pass.
- The order the drawing argued about held without any extra care: inserting
  at the end of the section puts the new sentences after the old ones by
  construction, which is why the contract could test it cheaply.

## Learned

- Three text builds in a row now, and the pattern is stable: no unit
  layer, the contract and acceptance tests are the whole proof, and the
  only real risk is a phrase that drifts from what a test reads. Writing
  the phrases into the drawing's Fixed section is what makes that risk
  small.

## Lacked

- The skill still reads as though every build has source. Its second step
  is to write the unit test first, and for the third time there is nothing
  for a unit test to hold. I closed the task on two layers of proof again
  and said so again.
- Nothing tells a developer how to verify a text change beyond the tests:
  no way to read the section as a model would receive it, other than
  running the runner and reading the page by eye, which I did and which is
  not recorded anywhere.

## Longed for

- A line in the skill acknowledging a build with no source, so closing on
  two layers is a named case rather than a thing I explain each time.

Feeds: code
