# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the thirty-sixth use of the architect skill, on
`architecture/the-engine-is-installable` (three seams, the manifest and its
three readers), 7 September 2026.
Place: this repository

## Liked

- The requirement handed me an open question and the constraints answered
  it. Whether `prepare` should be guarded looked like Kai's call until I
  read how npm actually behaves: it installs a package's dev dependencies
  because a `prepare` exists, before running it, so no guard on what the
  command does removes the cost. The door closed on a fact rather than on
  a preference, and the decision record says which fact.
- Three seams, and each one is red for its own field. The manifest is one
  file, so the temptation was one seam and three assertions; splitting by
  reader gave three promises that fail apart, which the isolation run
  showed.

## Learned

- A seam can be between a file and a tool nobody in this tree wrote. Seam
  2 is the manifest's promise to npm's packer, and its test keeps that
  promise without running npm at all: every path a field names exists, and
  the entry point is inside what ships. That is the classic broken package
  and it is decidable by reading, which made it a contract rather than an
  acceptance test.
- A criterion can have no seam below it. Criterion 4 is about what appears
  in a consumer's tree after an install, and nothing below the acceptance
  layer can see that. The strategy table has a column for why, and using it
  to say "no contract here, and this is the reason" was better than
  inventing a seam to fill the row.

## Lacked

- The skill says a drawing fixes what the developer may not change, and
  says nothing about a build with no unit layer. This one is a single file
  and there is no unit to test that the two layers above do not already
  hold; I had to write that into the handoff myself so the developer does
  not invent a test to fill a lane.
- Nothing helps with a decision whose reason is another tool's behaviour. I
  ran npm three times to find out what it does, and the decision record
  carries the conclusion but not the runs, so a reader has to trust me or
  repeat them.

## Longed for

- A place in the drawing template for what was checked by running it, the
  same gap the analyst hit an hour ago on the same task. Twice in one chain
  suggests it is the template, not the seat.
- A way to say "this layer is empty and here is why" that the walls read,
  rather than a sentence in the handoff that only a human notices.

Feeds: architect
