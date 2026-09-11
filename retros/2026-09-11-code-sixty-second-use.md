# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the sixty-second use of the code skill, the first of three diffs for
`a-suite-names-its-cases`: two kind rows, five readers, and the glob
comparison stood down, 11 September 2026.
Place: this repository

## Liked

- The contracts were the specification and nothing had to be guessed. Seven
  seams named their shapes, the build filled them, and all seven went green
  without a single question back to the drawing. The round that cost the
  architect a correction, fixing the export names, is exactly the round that
  made this one quiet.
- Standing down a check is smaller than replacing one. The glob comparison
  leaves as two lines and a `void`, and nothing else in the module moved.

## Learned

- I wrote a second reader for a grammar that already has one, and the unit I
  wrote to test its edges is what found it. `listOf` stripped the wrapping
  quotes off a whole entry and then split the pin, so `` `x`@sha `` left a
  backtick on the name; `splitTrace` does the two in the order that works. The
  fix was to delete the reader rather than repair it, and the module now hands
  the value to the grammar's own function.
- The tell was that the unit was hard to write. A test asserting what a value
  should read as, on a value the tree never writes, is a test about a reader
  nobody asked for.
- A page is a proof's subject, so editing one breaks tests in other lanes, and
  a two word phrase breaks on a line end. Adding a sentence to `SURFACE.md`
  pushed `whole file` across a wrap and an assertion matching that phrase went
  red on a page that still said exactly what it must. Third time today an
  assertion answered to prose rather than to behaviour: `re-runs` matched
  `runs`, `cases: no such kind` matched `case`, and now a newline between two
  words.
- Removing a check and adding its replacement cannot be one diff when the
  pages they read are in another seat's lane. The replacement fires on the
  pages that still carry what the old check allowed, so the order is stand
  down, let the other seat move the pages, then wire the replacement. The
  middle diff is a window where a plan's prose is nobody's business, and that
  window is the price of a change spanning two lanes without a red wall.

## Lacked

- Nothing says a module that reads a grammar must use that grammar's reader.
  The rule exists and is written in `frontmatter.mjs`'s own header, one
  parser, tested once, no dependency, where only a reader of that file meets
  it. It is a rule about the tree and it lives inside one module.
- No word for the middle diff of three. It is not a build and not a
  refactor: it removes a promise so that another seat can move the page the
  promise was about, and the board is green throughout while the tree is
  briefly less checked than it was.

## Longed for

- A check that a regular expression over a trace value appears nowhere but
  `traces.mjs`. Today it would have found `listOf` before the unit did, and it
  is a grep over one pattern.
- A way to assert about a page's sentence without asserting about its line
  ends. Three of today's reds were a regular expression meeting prose, and all
  three were written by somebody who knew the rule and wrote the expression
  anyway.

Feeds: code
Read: architect
