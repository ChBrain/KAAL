# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the seventy-fourth use of the architect skill, drawing where a red
case is owned, 12 September 2026.
Place: this repository

## Liked

- The stand-in killed the drawing's central decision, which is the most
  useful thing it has ever done. A `bugs` gate is this league's own idiom,
  it was chosen for good reasons, and it cannot pass criterion 5. Reading
  the criterion again after the run showed the clause that rules it out had
  been sitting there the whole time.
- Running the requirement's own acceptance tests against the drawing's
  stand-in is what caught it. The contracts were all five green while the
  design was wrong, because a contract asks whether the seam keeps its
  promise and never whether the promise was the right one.

## Learned

- `whatever every wall on it says` is a clause that excludes a whole shape.
  A gate makes the board red because a wall is red, and the criterion asks
  for a board that is red when every wall is green. Read forwards it sounds
  like emphasis; read against a design it is the design.
- What it was reaching for is that a bug cannot be waived. A wall can, and
  a bug that could be waived away is the licence this task exists to refuse.
  The stronger guarantee was in the criterion and the drawing found it by
  failing to meet the weaker one.
- A signature is not a seam. `runJudged(files, root)` took a root and
  ignored it below the first line: the glob expanded against the caller's
  directory and the case ran there, which answers nothing passing and reads
  as a counting bug rather than a path bug. And the parameter cannot be
  called `root` at all, because that name is bound inside the loop to
  something else.

## Lacked

- Any reason to run the acceptance tests against a drawing's stand-in. The
  skill asks for the contracts to be green on it and says nothing about the
  layer above, and the layer above is where the wrong decision showed.

## Longed for

- A decision record that can say it was reversed by a run, in a field rather
  than in prose. This one says so in a sentence, and the sentence is the
  most useful thing on the page.

Feeds: architect
Read: code
