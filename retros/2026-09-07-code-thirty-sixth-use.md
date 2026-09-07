# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the thirty-sixth use of the code skill, on
`a-change-declares-its-class` (a module, a branch, a table entry, a wall and
a page section), 7 September 2026.
Place: this repository

## Liked

- Mutation found what the red run could not. All five unit tests were red
  together because the module did not exist, which says nothing about
  whether they test different things, so I broke one line at a time and
  watched. Five of six mutations turned a test red and the two survivors
  were both real findings, not noise.
- The wall's first act was to refuse me. It told the board to close the
  requirement it belongs to, and on a stand-in raise to `0.1.0` on this
  tree it printed exactly the line the criterion asks for. A wall proven
  only on fixtures has not been proven on the thing it guards.

## Learned

- A guard no test can hold is not an untested line, it is a line with
  nothing behind it. Two survivors were guards on git's own exit status,
  and in both cases the fallback below already produced the same answer:
  an empty diff, a null version. Neither could be made to fail, so both
  went, and the comment now says why the status is not asked twice.
- Two readings of a tree in one module must be the same reading. The
  version came from the working copy and the paths came from HEAD, so an
  uncommitted surface change was invisible while an uncommitted version
  raise was refused. A mutation dropping `HEAD` from the diff passed
  everything, which is how the inconsistency surfaced at all.
- A drawing can be internally wrong and still pass its wall. This one
  decided a wall would be quiet in CI on exit 2 while its own opening
  cited the requirement that makes any non-zero exit a failure. Nothing
  reads a drawing for that kind of contradiction; only building it did.

## Lacked

- Nothing tells a developer what to do when the drawing they were handed
  contradicts itself. The skill says to hand back to the architect, which
  is the right answer for a shape that does not fit, but this was one
  sentence of reasoning that was false, and handing back a whole drawing
  for a sentence is the wrong size of response. I corrected the record in
  place and said so; the skill has no name for that.
- The build needed a change to CI before it could be green, in a different
  lane, so the work was two pull requests with an order between them and
  nothing in the tree records that order.

## Longed for

- A way for a decision record to be marked corrected rather than rewritten,
  so a reader sees the reasoning that was wrong and why, instead of a
  history that looks like nobody ever erred.
- The change class, which this build finally provides, in the handoff of
  the next one. Three builds in a row have answered that line with "nothing
  computes this yet".

Feeds: code
