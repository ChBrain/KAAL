# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the twenty-sixth use of the architect skill, on
`architecture/asks-when-not-told` (one seam over a checklist line), 6
September 2026.
Place: this repository

## Liked

- The seam drew itself once I read the renderer and saw that it keeps only
  the lines beginning with a dash or two spaces. The failure worth catching
  was the silent one, an item that sits in the file and never reaches the
  reader, and that is exactly one seam.
- Deciding that this drawing and its build share a pull request, and
  writing the reason down as a decision rather than doing it quietly.

## Learned

- Two tests that read the same file are one test written twice. The
  acceptance test reads the checklist; if the contract had read it too, the
  seat would have produced ceremony. Reading the rendered page is what made
  the second test worth its line.

## Lacked

- The rule that a drawing and its build may share one merge lives in
  `requirements/architect-v2`, criterion 4, and not in the skill I was
  using. I went looking for it because I remembered it existed. A rule you
  have to remember to find is a rule most readers will not apply.
- The skill's one seam one test rule gives no help at the bottom end: with
  one criterion and one obvious file, I had to talk myself out of drawing a
  second seam to look thorough.

## Longed for

- The skill's Hand off section to say plainly when a drawing and its build
  belong in one pull request, instead of pointing at `human.gates` and
  leaving the size question open.

Feeds: architect
