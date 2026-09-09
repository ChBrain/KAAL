# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the forty-ninth use of the architect skill, on
`architecture/a-trace-pins-what-it-read` (four seams: the value split, the
region hashed, the disagreement reported, the pin written), 9 September 2026.
Place: this repository

## Liked

- Seam 2 is driven differentially and never recomputes what the module
  computes. The test edits outside the pinned region and asserts the sha did
  not move, then edits inside and asserts it did. That is the 45 in 47 the
  requirement measured, written as a test rather than as a number in prose,
  and a test written in the same terms as the code could never have said it.
- The first drawing in the league to use `Weighed against:`, four decisions,
  each naming `the-two-goods`. The line the previous task added had nothing
  to cite it until now, and writing four of them showed the shape holds: the
  principle is what the record is read against, not a label on it.

## Learned

- An isolation that reddens nothing is a gap in the fixtures, not a passing
  grade. Letting the writer stamp a pin on a name that does not resolve
  broke no test, because no fixture in the set had an unresolvable name in a
  tree the writer runs on. The drawing had fixed the behaviour in Fixed and
  free and nothing drove it. A fifth fixture closed it and the isolation now
  reddens seam 4.
- That is the second time this pattern has appeared in three drawings: the
  `none` case in `an-architect-names-its-principles` and this one. Both were
  a behaviour the drawing named and no fixture exercised, and both were
  found by breaking the code rather than by reading the tests.
- The test itself can be red for its own defect. Seam 4 failed on
  `assert.match(now, SHA.source.slice(1, -1))`, a string where a RegExp was
  wanted, which reads as a failing seam and is a failing test. Worth
  checking the message before the module: this one said what it was.
- A closed contract that reads a table's keys and not its values is what let
  a row become a pair without a supersede. That was luck rather than design,
  and the drawing says so: had the contract read the values, this task would
  have been a supersede before it started.

## Lacked

- Nothing in the skill about a fixture set owing a case per line of Fixed
  and free. Every fixed behaviour is a promise and a promise with no fixture
  is a sentence; the isolations find these and only if the isolation happens
  to be chosen.
- No word for a drawing that must not answer its requirement's open
  question. The requirement asked whether a stale pin gates or reports, and
  its own criterion 2 test already asserts the exit code, so the answer was
  written before the question. The drawing had to say that in a decision
  rather than in a place meant for it.

## Longed for

- An isolation list written from Fixed and free rather than from what I
  happen to think of. Four fixed behaviours, four breaks, and the one I did
  not think of is the one that found the gap.

Feeds: architect
Read: test
