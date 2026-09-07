# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the twenty-ninth use of the architect skill, on
`architecture/nothing-passes-vacuously` (three seams over a table that
grows from four entries to eight), 7 September 2026.
Place: this repository

## Liked

- Deciding that the applicability entry for the boundary asks that wall's
  own list of places rather than naming a directory. That list grew from
  one to two four hours ago; a copy in the table would have been wrong for
  those four hours and nobody would have seen it, because a table that
  names too little refuses silently on exit 2.
- Drawing the contract over all eight commands rather than the four that
  are new. The promise worth holding is that the table grew and did not
  move, and only the whole list can say that.

## Learned

- A contract test may not run the board. `kaal gates` on the league runs
  the contracts wall, which runs the file that called it, and the run
  times out after sixty seconds rather than failing with anything a reader
  could use. The repository already knew this and has a marker for it,
  `KAAL_GATES`, used by five closed tests; I had not met it, and I found
  the rule by watching a timeout.
- The stand-in earned its place twice over. It proved the design works and
  it showed exactly which closed unit tests move, including one I had not
  predicted: the sweep that hands every entry a foreign path expects the
  runner to refuse it, and under this design the runner is asked about the
  working directory and its argument is a skill.

## Lacked

- Nothing in the skill warns that a contract driving the repository's own
  tool can drive the whole board. The rule is real, it is enforced by
  nothing, and it costs a minute of timeout to rediscover.
- The analyst's acceptance test carried the same defect, so I found a
  defect in another seat's work while standing in mine. The skill says to
  hand a criterion back to the analyst and says nothing about handing back
  a test that cannot pass for a reason unrelated to its criterion.

## Longed for

- A note in the skill, or better a helper the tests share, that says the
  board may not be driven from inside a test and how to write the case
  instead.

Feeds: architect
