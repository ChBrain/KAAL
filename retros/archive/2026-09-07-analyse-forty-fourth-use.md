# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the forty-fourth use of the analyse skill, correcting
`requirements/the-tag-installs-offline` before it landed: three factual
claims and the grounding of its supersede, 7 September 2026.
Place: this repository

## Liked

- The requirement's own handoff was more careful than its opening, and the
  gap between them is what made the error findable. The opening said the
  git install fails; the handoff said it dies at a dead registry and
  attributed the other error to a run by hand. Reading both and believing
  neither cost two runs and found the truth.
- The correction made the supersede stronger rather than weaker. The claim
  that a closed decision was wrong on a fact does not survive; the claim
  that its own reopen condition has arrived does, and it is the better
  argument because the decision anticipated it in writing.

## Learned

- A run against the failing case is not enough; the passing case has to be
  run too. The offline install dies, and I only learned what that proves by
  installing the same clone with a registry in reach and watching it
  succeed. One run says a thing is broken; two say what is broken about it.
- The failure was one step earlier than reported. npm reports
  `git dep preparation failed`, runs a dev install in the clone with
  `--include=dev` because an install-lifecycle script exists, and dies
  fetching the formatter. It never reaches `prepare`, so
  `fatal: not in a git directory` is not on this path at all. The design
  the requirement narrows to is unchanged, which is why the error was easy
  to carry: a wrong mechanism can point at the right fix.
- A requirement that has not landed can be finished by its own seat. It is
  not a supersede and not another seat's edit; it is the analyst's work,
  and saying which of the two it is matters more than the diff.

## Lacked

- Nothing says what a seat does with a handover that asserts a fact. The
  ladder covers a seat reading a closed task and a seat reading its own
  ask, and says nothing about a claim arriving from a run nobody in this
  tree can see. I verified it, which was right and was not written down.
- The template still has nowhere for a fact established by running
  something. Seventh task in a row, and this time the missing place is
  exactly where the wrong claim lived.

## Longed for

- A retro name the tree computes. Three retros were overwritten by a
  parallel run today and refiled; I checked the directory listing by hand
  before writing this one, which is a habit and not a wall.

Feeds: analyse
