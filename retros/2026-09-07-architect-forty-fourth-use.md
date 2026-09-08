# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the forty-fourth use of the architect skill, drawing
`the-release-runs-on-a-key`, three seams and three contract tests,
7 September 2026.
Place: this repository

## Liked

- The strategy table earned its empty rows three times over. Three of seven
  criteria are proven by nothing here, and each says so in the table with
  its reason, in the same words: nothing in this tree runs GitHub. A reader
  meets that before the handoff rather than in it, and the handoff repeats
  it once instead of explaining it three times.
- The seam that cannot be driven is drawn as an order rather than as four
  facts. Seam 3 promises that the branch, the board, the refusal and the tag
  are in that order, and the contract sorts the four positions and compares.
  A step moved anywhere is one failure naming where it went, which is the
  most a text reading can honestly hold.

## Learned

- A namespace import saves a file whose module is missing an export. It does
  not save one whose module does not exist. The first draft imported
  `bin/lib/release.mjs` at the top and the whole file failed to load, so
  three seams shared one red again, two days after the rule that was meant
  to stop it. The fix is a dynamic import inside the seam that needs it,
  which also lets the test say "there is no bin/lib/release.mjs" rather than
  a stack trace.
- Every refusal in this tool is printed with its command's own name in
  front, so two refusals can never be byte-identical on the page and a test
  comparing printed lines compares prefixes. The invariant that matters
  lives one layer down, in what `appliesHere` returns, and that is where the
  unit test holds it. The contract now strips the prefix before comparing.
- A step's own message names the thing its condition tests. Searching the
  workflow for the default branch found the echo rather than the `if:`, so
  deleting the condition left the test green, which is worse than a missing
  step: the step would then run every time and fail every time.

## Lacked

- Nothing says how to draw a seam whose far side is a service. Seam 3's far
  side is GitHub, its promise is an order in a file, and the drawing says so
  in three places because no shape carries it once.
- The strategy table has one kind per criterion and three of these are the
  same `none` for the same reason. A reader counts three empty rows and
  cannot see that they are one gap rather than three.

## Longed for

- A way to name one reason once and point three rows at it, so a table shows
  a single gap of three criteria rather than three gaps that happen to
  agree.

Feeds: architect
Read: test
