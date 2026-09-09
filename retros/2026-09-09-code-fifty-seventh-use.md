# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifty-seventh use of the code skill, on
`requirements/a-task-is-delivered-by-its-run` (seven criteria, five seams, a
field gone from 61 pages), 9 September 2026.
Place: this repository

## Liked

- Measuring the blast radius before touching anything meant no surprises in
  the middle. Five files read the field, two of them were supersedes, two
  were my own units, and the fifth was the module. Every one of those turned
  out to be exactly what the grep said it was.
- The board says why now. Two tasks reading not delivered, one because its
  record is stale and one because nobody has recorded it, are the same word
  and different work, and the reason sits on the line beside it.

## Learned

- The runner reports a file declaring no test at all as one passing test,
  named for the file. So a suite whose tests were all deleted reads as green,
  and the guard that was meant to catch this asked for `pass > 0` and got
  one. This league has hunted the vacuous pass all week and the runner itself
  was handing one out.
- I found it because a fixture would not behave. The fixture named
  `nothing-ran` reported one passing test, and the honest reading was that
  the fixture was wrong. It was not: the fixture was right about what it
  meant and the runner disagreed about what it counts. A fixture that
  contradicts the tool is a question about which of them is wrong, and I
  assumed the fixture twice before checking.
- The empty case is detectable and I nearly did not look. The passing line
  names the file rather than a test, which is a one line reading, and my
  first instinct was to change the fixture to use a skipped test instead.
  That would have made the fixture pass and left the hazard in the tree.
- An edit that slices a region out of a file takes the constant defined in
  it. Removing the status reader's unit removed a fixture path two later
  tests used, and the error said `P is not defined` rather than anything
  about what I had done. Cutting by index is cheap and cutting by meaning is
  what I wanted.
- A unit that needs a tree builds one. The last unit needed a drawing beside
  a requirement, and adding it to the analyst's fixture would have been the
  crossing the next task exists to refuse, so it builds its tree in a
  temporary directory instead. The seat rule changed how I wrote a test
  before the wall that enforces it exists.

## Lacked

- No word for the state this build leaves the tree in. Every task reads not
  delivered until a run is recorded, which is correct and is also a board
  that says nothing is delivered. It is one command away and the command
  belongs to another lane, and nothing in the league names that gap.
- Nothing about a fixture disagreeing with the tool. The skill says a fixture
  is made wrong by a rule it never met; it says nothing about a fixture that
  was right and a runtime that counts differently.

## Longed for

- A check that every acceptance suite declares at least one test. The wall
  catches it now as `nothing ran`, which is a verdict about delivery, and it
  is really a fact about the file.
- A way to cut a region out of a source file by what it means rather than by
  where it starts and ends. Twice today an edit took something it did not
  mean to take.

Feeds: code
Read: test
