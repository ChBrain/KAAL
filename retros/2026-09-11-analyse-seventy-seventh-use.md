# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the seventy-seventh use of the analyse skill, amending
`a-suite-names-its-cases` after the asker gave the cardinality,
`Plan n:m Suite n:m Case` with nothing mutually exclusive in it, 11 September 2026. Amended within the hour of the first landing.
Place: this repository

## Liked

- The amendment shrank the answer rather than growing it. The asker's guess
  that the test graph might need its own field turned out to need two rows in
  a table that already holds four, because only `parent:` is single valued and
  `principles:` has always been a comma list resolving to many files. The
  grammar was already a graph and nobody had noticed.
- Naming the edges as traces rather than prose pays twice. A case carries a
  pin, and a pin that goes stale when the case moves is `review-needed` on the
  suite, which is the retest signal the next task was going to have to invent.

## Learned

- My tests fixed a shape no criterion states, and the asker's question is what
  exposed it. The criteria said a suite names its cases by path and said
  nothing about where; the tests read them out of backticks in prose. That is
  the trap this skill warns about in its own words, and reading the warning
  did not stop me writing it.
- A test can pass on a message about something else entirely. Criterion 2's
  test asserted `/case/i` on the finding, and today a tree carrying a `cases:`
  field answers `cases: no such kind; the table holds requirement, supersedes,
parent, principles`. The word was there, the criterion was not, and it read
  green for one run before the fixture was inspected by hand.
- The tell both times was the same: an assertion loose enough to be satisfied
  by the tree's vocabulary rather than by the tree's behaviour. `re-runs`
  contains `runs`; `no such kind` about `cases` contains `case`.

## Lacked

- Nothing in the skill says to name the form as well as the content when a
  criterion is about an artefact a person writes. Where a reference lives,
  frontmatter or prose, is at the surface and is exactly the kind of thing a
  test will settle by default if the criterion does not.
- No rule against an assertion that a wall's own vocabulary can satisfy. Both
  of today's wrong reasons were a regular expression short enough to match a
  sentence about something else.

## Longed for

- A criterion that has been amended after its first landing to say so on its
  own page. This task was stated and amended an hour later, both by the same
  seat, and only the git history says there were two readings.

Feeds: analyse
Read: test
