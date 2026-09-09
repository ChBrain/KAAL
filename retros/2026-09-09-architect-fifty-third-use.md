# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifty-third use of the architect skill, on
`requirements/a-seat-claims-what-it-covers` (five seams, the four rows),
9 September 2026.
Place: this repository

## Liked

- The runs found a defect in my own acceptance test before a line was built.
  Criterion 6 asks the config for a per gate count pattern and the board
  reads no such thing: it matches one shape, `# pass N`, and calls it passing
  tests. The drawing could say what the criterion needs instead of the build
  discovering it.
- The seats as a table paid immediately. The ask says operations has nothing
  to count yet, and a row is a line rather than a design, which is the same
  shape the trace wall's kinds table has now paid for three times.

## Learned

- A contract test caught a number I had not thought about. It expected 66 for
  two of three and the stand-in rounded to 67, and the right answer is that
  the share truncates. Rounding prints 100 per cent while something is
  missing: 199 of 200 reads as done. That is the one number a coverage report
  must never be able to say, and no criterion mentions it. The drawing fixes
  it now.
- Two isolations reddened nothing, and both for the same reason: the
  fixtures beside the requirement cannot tell a reading from a guess. There
  the drawing directories and the declared answers are the same set, and a
  record is either fresh or absent. A row counting directories and a row
  ignoring freshness both answer correctly on that tree. The contract builds
  the distinguishing cases itself.
- That is the third drawing running where an isolation that answered nothing
  was the most useful thing in the run. The rule I keep rediscovering is that
  a fixture proving a rule and a fixture proving the rule is _read_ are
  different fixtures, and the second is the one nobody builds by default.
- A wall that cannot fail is a report, and a board that only speaks when
  refused cannot carry one. Deciding that took longer than writing it, and
  the alternative I nearly took was worse: printing `# pass N` from a
  coverage command would have put a number on the board under the wrong
  word, which is the quiet lie this league spends its days refusing.

## Lacked

- Nothing about a criterion whose test asks for a mechanism the tree does not
  have. Criterion 6 is right about what it wants and its test asks for a
  config field nothing reads, and the honest place to say so is the drawing,
  which has no section for it and used the Handoff again.
- No rule that a contract test builds its own distinguishing case. Three
  drawings running, three times an isolation answered nothing because a
  fixture could not separate two readings, and each time I found it by
  running rather than by asking.

## Longed for

- An isolation per line of Fixed and free, computed. Five fixed behaviours,
  five breaks, and the two that taught me something were the ones I had to
  add after the first pass answered nothing.
- Somewhere in a drawing for what the runs found wrong with the requirement.
  Twice today that has gone into the Handoff under a label I invented.

Feeds: architect
Read: test
