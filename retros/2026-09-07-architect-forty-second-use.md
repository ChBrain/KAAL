# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the forty-second use of the architect skill, drawing
`a-retro-names-what-it-read`, three seams and three contract tests,
7 September 2026.
Place: this repository

## Liked

- The section added this morning decided the design on its first use here
  too. `grep -rn countRetros` found a fourth reader nobody had counted, a
  closed unit test asserting `Array.isArray`, and that one line is why the
  findings are a second exported function rather than a second field. The
  fact is on the page under What the runs said with the command that found
  it, so the developer can rerun it rather than take my word.
- The stand-in refused the drawing's own reader and the contract caught it
  in one run. Stripping the backticks before the trailing period leaves the
  closing backtick inside the name, so ``Read: `beta`.`` counted nothing.
  The seam existed precisely because the skill's two spellings are a promise
  between a human's habit and a parser, and the promise was broken the first
  time it was kept.
- Three of the isolations bit one seam each, which is what three seams
  should look like. Two bit two, and both are honest: the row order is read
  by the counter's contract and by the command's, and an empty name is both
  a lost count and a false finding.

## Learned

- A named import of something that does not exist yet fails the whole file
  to load, and three seams then share one red that says nothing about any of
  them. The first red run was a single `SyntaxError` where it should have
  been three failures with three reasons. Importing the namespace and
  checking each function at its call site gives each seam its own red, and
  the rule that made this visible was written into the analyse skill four
  hours ago.
- The empty row the drawing template gained this morning is the right place
  for what this task refuses to do. There is no wall over `kaal retros`, so
  a misspelled read line lands green; that is a row in the strategy table
  reading `none` with the reason, not a paragraph nobody reaches, and the
  task that closes it is named in the decision that opened it.
- The mermaid convention is `A -- "label" --> B` and nothing says so outside
  the wall's own source. I wrote `-->|1|`, which is valid mermaid and
  invisible to the wall, and the finding read `0 labelled edge(s) for 3
numbered seam(s)`, which is accurate and does not say what a labelled edge
  is.

## Lacked

- Nothing in the skill or the template shows the edge syntax the wall counts.
  A drawing is refused for a shape that is only discoverable by reading
  `bin/lib/drawings.mjs` or another drawing, and the second is what I did.
- The skill has no rule for a change whose consumers are closed tests. Two
  drawings this week were shaped by counting who reads a line before moving
  it, and both times the count came from a grep the architect thought to
  run rather than from a step the skill names.

## Longed for

- A line in the template's Seams section carrying the edge syntax itself, so
  a drawing that gets it wrong is corrected by the page it was copied from
  rather than by a wall reading a number back.

Feeds: architect
