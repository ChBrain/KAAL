# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fiftieth use of the architect skill, on
`architecture/a-tree-has-one-root` (five seams: the tree a parent resolves
inside, the ring, the roots and the argument, the star, and the edge that
runs across), 9 September 2026.
Place: this repository

## Liked

- Nine fixtures, one shape of forest each, so no finding can be reported in
  another's words: a crossing, a ring of three, an unargued root, an argued
  one, a star, a tree with depth, a drawing answering none, one answering
  two, no trunk, and two trunks. Every isolation landed on one seam.
- The stand-in found a defect in the requirement rather than in the code.
  The trace grammar filters `nothing` and criterion 6 says `parent: none`,
  so the first run reported `none is not at requirements/none/requirement.md`
  on every root in every fixture. That is a word the analyst and the
  architect chose separately and nobody compared.

## Learned

- An isolation that reddens nothing is a weak test, and this is the third
  drawing in four where one appeared. Naming only one artefact in a ring
  broke no test, because the test asked whether three names appeared
  anywhere in the output and every artefact starts its own walk, so three
  findings naming one each between them said it all. The assertion now asks
  for one line naming the whole ring.
- The pattern across the three is the same shape: an assertion over a whole
  output where the criterion is about a single finding. Twice it was a
  fixture that could not exercise its case; once, here, it was a matcher
  that could not tell one finding from three.
- The kind table's promise did not survive `parent`. Every other row answers
  the same way for every caller; this one is handed the artefact that asked,
  because a parent means a different file in each tree. The drawing chose to
  let one row read more of the question rather than split the table, and it
  says at the table that two shapes now live there.
- A number chosen without evidence is worth writing down as a choice. The
  star rule needs a share and nobody has one, so the build picks it, names
  it on the surface page and defends it in the handoff. The league keeps
  saying a threshold should be found rather than declared, and this is the
  one place in the task where it does the opposite on purpose.

## Lacked

- No instruction to write the isolation list from Fixed and free. I asked
  for one in the previous architect retro and then chose isolations from
  what came to mind again. Five fixed behaviours, five breaks, and the one
  that mattered was the one I nearly did not run.
- Nothing about a vocabulary shared across tasks. `nothing` and `none` are
  the same idea in one grammar and two tasks chose separately, which no wall
  and no section would have caught before a stand-in ran.

## Longed for

- A check that every line of Fixed and free has a fixture that fails when it
  is broken. The isolations are that check done by hand, and by hand is why
  the third one keeps being a question rather than an answer.

Feeds: architect
Read: test
