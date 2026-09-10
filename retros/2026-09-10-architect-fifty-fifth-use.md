# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifty-fifth use of the architect skill, drawing
`a-pin-says-who-cleared-it`, the task that makes a moved pin a state with an
owner rather than a red board, 10 September 2026.
Place: this repository

## Liked

- Six isolations, six seams, each break reddening exactly one, on the first
  pass and for the second drawing running. The one that took thought was seam
  5: `mayWrite` is `stateOf` with a word compared against it, so every break
  in seam 2 reddens seam 5 as well, and the isolation that proves seam 5 is
  the one that leaves seam 2 alone.
- No sha was written by hand anywhere in the fixtures. The tool places every
  pin, then the text moves underneath it, and where a review has to name the
  sha the region has now, the fixture asks `regionSha` rather than a hash of
  its own. That is the analyst's lesson from three days ago, borrowed whole,
  and it cost nothing to borrow.
- The contract that says a dangling name is never a state. It is the case a
  reasonable implementation gets wrong: a pin compared against a file that is
  not there reads as moved, and moved is now excused as a line. Without that
  case this task would have quietly turned one of the trace wall's two
  findings into a note.

## Learned

- The frontmatter parser drops a sub key carrying a slash and says nothing.
  My own "What the runs said" claimed a second block beside `traces:` costs
  nothing to parse. It cost one character class, and I only found it because
  I ran the parser on the block I had already fixed in the drawing. I had
  read that file for what it does and not once for what it refuses.
- A silent drop is worse than either alternative. The parser could reject the
  line, or read it, or ignore it, and the third is the one that gives a
  reader a file that looks right and a tool that never saw half of it. That
  is the vacuous pass with no wall in sight.
- A seam that is a derivation of another is still worth a seam, and the
  drawing should say which it is. `mayWrite` holds no state logic; it names
  the question `writePins` asks, which is a different question from what a
  reader is shown. Naming it bought a place to put decision 4 and cost a
  contract that can only fail on the derivation.
- Fixing a value's shape in a drawing is fixing something about the tree, not
  only about the module. Keys, separators and blocks all have to survive the
  readers that already exist, and a drawing that fixes a shape without
  parsing it once is guessing in a place that reads like a decision.

## Lacked

- The skill asks what each seam promises and never asks which seams stand on
  which. A column saying "breaks with" would have shown seam 5 leaning on
  seam 2 before I wrote six contracts, rather than while I was breaking them.
- Nothing asks whether a fixed shape is expressible in the tree as it stands.
  Between "Fixed and free" and the contract tests there is no step that says
  read the code that will have to accept this, and that step is where tonight
  went sideways for twenty minutes.
- No shape for a change a drawing owes another seat's file. The parser
  widening is a developer's edit in a build lane, and the only place it can
  live is a Handoff bullet, beside `SURFACE.md`, unweighted and easy to miss.

## Longed for

- The scratch tree helper, again, and this is the third record asking. The
  acceptance tests and these contracts now carry the same `TRUNK` constant
  and the same comment explaining why a fixture needs one, written twice by
  two seats a day apart.
- A `Weighed against:` line that could name a tension with no principle
  behind it. Decision 6 weighs one parser against a shorter diff, and that is
  neither of the two principles this drawing names. It is the same gap the
  fifty-fourth record wrote down, and a tension asked for three times is a
  principle somebody should write.

Feeds: architect
Read: analyse
