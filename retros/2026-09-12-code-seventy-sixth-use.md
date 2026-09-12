# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the seventy-sixth use of the code skill, keeping a count out of the
frontmatter, 12 September 2026.
Place: this repository

## Liked

- The reproduction was three lines and the fix was one pattern. Copy the
  page, run the write, diff: deterministic every time, which turned an
  argument about whether a formatter had done it into a fact in one command.
- The reader was wrong everywhere and the writer only in one place, and
  asking the reader first is what showed the size of it. All three plans
  answered a count of 1 and not one of them states a count at all.

## Learned

- A fixture can be too clean to see a bug. The unit for this writer has been
  green since it was written and it is a good unit: it builds its page with
  a helper, and the helper's frontmatter carries no sha. The bug lives in
  `1\nsuites:`, which only occurs in a page that has been pinned, so the
  shape the bug needs could not occur inside the test. The rule the analyse
  skill already has is the mirror of this one: it says a fixture must not
  break a rule it is not testing, and this says a fixture must carry what a
  real page carries, or it proves the function against a page nobody has.
- `\s` crosses a line and a sha ends in a digit. Those two facts were both
  harmless for months, and a gate with no globs made them meet: the glob
  guard is what kept the writer away from the other two plans, and the
  regression gate is the first gate that has none.
- A page that still parses after being corrupted is a page no wall will
  report. The sha lost its last character, the `suites:` key moved onto the
  pin's line, and every check in this tree stayed green.

## Lacked

- Any fixture built from a real page. Every helper here writes the page the
  author had in mind, and the tree's own pages have three years of pins on
  them that no helper reproduces.

## Longed for

- A wall that reads a pin as a pin. A sha that is not the sha of anything
  is a thing this tree can compute, and it would have caught this the run
  after it happened rather than whenever somebody diffed.

Feeds: code
Read: test
