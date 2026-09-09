# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the sixtieth use of the analyse skill, amending
`requirements/a-tree-has-one-root` after the asker settled the shape (seven
criteria, seven red tests), 9 September 2026.
Place: this repository

## Liked

- The amendment shrank the task rather than growing it. The asker's answer
  named a root and three trees; the run that followed showed the third tree
  has no documents at all, 128 test files under 50 local strategy sections
  and nothing above them, so the requirement now shapes two trees and names
  the task that writes the third. Claiming three would have been claiming a
  shape over files with nowhere to put a parent.
- Criterion 6 came out of the machinery already specified rather than a new
  one. The mechanism for a second tree was written before anyone knew what
  the second tree would be, and the architecture root is exactly what it was
  for.

## Learned

- Two edges were hiding under one word. `parent` runs down a tree and
  `requirement` runs across between trees, and until the asker said "in
  negotiation with each other" I had them as the same relation: my own
  earlier note said architecture hangs off requirements one to one, which
  would have parented every drawing to its requirement and flattened
  architecture into a mirror. The criterion now forbids it by name.
- My first draft of criterion 6 invented a fourth kind of document, a root
  above the three trees belonging to none of them, parented by nothing and
  pinned against nothing. The asker had written the root as a requirement in
  their own message and I read past it. A structure that needs a new kind of
  artefact to express it is usually a structure read wrong.
- A test can go green because a different rule fired. Test 4 asserted an exit
  code and the fixtures used `parent:`, which the kind table does not hold
  yet, so every fixture reported "no such kind" and the code alone made the
  test pass. The criterion it was written for was never exercised. It now
  discards those lines before asking anything.

## Lacked

- Nothing in the skill about amending a merged requirement after the asker
  answers an open question. The open question was the right place for it and
  the answer arrives as prose in a conversation; where it lands, and what
  marks it as answered rather than forgotten, is not written.
- No word for a criterion that cannot be met until another task exists. The
  third tree needs documents that nobody has written, and the requirement had
  to say so in an assumption and an `Unblocks:` line rather than anywhere
  meant for it.

## Longed for

- A check that every fixture exercises the rule it was built for. Twice today
  a fixture passed or failed for a reason that had nothing to do with its
  criterion, and both times the tell was an exit code standing in for a
  finding.

Feeds: analyse
Read: test
