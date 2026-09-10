# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the seventieth use of the analyse skill, moving
`a-pin-says-who-cleared-it`'s fixtures off the pin and into the block its
drawing chose, 10 September 2026.
Place: this repository

## Liked

- The collision surfaced before a line of the build was written, from reading
  the acceptance test beside the drawing rather than from a red suite. Two
  merged artefacts disagreed about where a state is written and nothing in
  this tree would have said so until the build could satisfy neither.
- The fixture now learns both shas from the tool. It pins the text as it will
  stand, reads that sha back off the pin, pins the text as it stood, and moves
  it forward again. Before this the clearance cases carried no sha at all, so
  they proved that a well formed review raises no finding and never that a
  review clears anything.

## Learned

- The analyst fixed a format the criteria never named. Criterion 1 says a pin
  carries a state and says nothing about where the state is written; the
  fixture appended it to the pin, which is a decision about the shape of a
  trace value, and the shape of a trace value is the architect's. Same defect
  as the one found an hour ago in `a-trace-pins-what-it-read`, in the other
  direction: a test claiming more than its criterion does.
- And this one could not have been avoided by writing a better test. A
  surface test for a feature whose surface is a file format has to write that
  format, and the format is decided in the drawing, which comes after. So
  either the criterion names the format, the way
  `a-trace-pins-what-it-read` names `<name>@<sha>`, or the fixture is written
  against a format that does not exist yet and moves when the drawing lands.
  There is no third option and this league has never said which it takes.
- The drawing's reason for the block is the one that decides it: the trace
  value is comma separated, a reason wants commas, and two pins in this tree
  are lists of four. The superseded task's own constraint says its trace
  shape does not move, and an inline state moves it. So the test was wrong on
  the merits and not only on the seat.

## Lacked

- Nothing pairs an acceptance test against the drawing that answers it. The
  drawings wall counts seams against contract tests and criteria against the
  strategy table, and no wall reads a fixture beside the structure it is
  supposed to be exercising.
- No place to write down that a criterion deliberately leaves a shape open.
  Criterion 1 leaves it open by accident and reads the same as one that fixed
  it, and the fixture is where the difference showed up.

## Longed for

- A rule about which artefact fixes a format, written once. Three PRs today
  have turned on the same question of who may decide a shape, and each time
  the answer was read off the ladder rather than off anything a wall holds.

Feeds: analyse
Read: architect
