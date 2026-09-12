# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the seventy-seventh use of the code skill, building where a red case
is owned, 12 September 2026.
Place: this repository

## Liked

- The build order the drawing set held exactly. Seams 1 to 3 went green
  together because they share one reader, then 4, then 5, and nothing had to
  be revisited once it passed.
- One reader answers both questions. What is held back and what the board
  prints come from the same walk over the same pages, so a tree cannot
  report a case as blocked while running it, and a unit says so.

## Learned

- The too-clean fixture caught me inside the hour. The unit I wrote for the
  field reader carries a comment saying the separator is a space and never a
  line, and mutating it to `\s` killed nothing: the fixture had no page with
  an empty field line, which is the only shape where the two differ. The
  comment was a claim and the test was not making it. A page carrying
  `- Seen:` with the next field under it is what proves it, and it kills the
  mutation.
- Mutating the code is how a unit's claim gets read back. Both times this
  session the test looked right and the mutation was the only thing that
  said whether it was, and both times a guard that looked covered was not.

## Lacked

- Anything that runs a mutation. It was done by hand twice today, and the
  second one is the only reason the field reader has a real test.

## Longed for

- A fixture built from a page the tree actually holds. Every helper here
  writes the page its author had in mind, and the shapes that break readers
  are the ones nobody imagines writing.

Feeds: code
Read: test
