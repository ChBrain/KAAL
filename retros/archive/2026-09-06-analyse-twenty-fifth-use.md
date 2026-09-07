# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the twenty-fifth use of the analyse skill, on
`requirements/assess-boundary` (task one of the dual-mode design: the
write boundary of external mode), 6 September 2026.

## Liked

- The ask was a design document of eighteen sections, and the count came
  to one task worth taking first: the boundary, because every later task
  lands inside it and it cannot be retrofitted. Nothing else from the
  document entered the requirement.
- Three of the new sentences from this morning's build paid off in the
  same hour: the criteria fix the descriptor's shape and the wall's two
  lines, so the tests were written before any code; every test reads a
  fixture root; and the reproducibility criterion exists because the
  format of a generated document is now the analyst's to fix.

## Learned

- A criterion can force an honest design. Criterion 6 refuses a module
  under the assess tree that executes anything, which would refuse a
  resolver that spawns git; the stand-in then read `.git/HEAD` and the
  ref file instead and resolved a real repository without running a
  thing. The constraint that said "asks git for a revision" was corrected
  to "reads the refs git keeps" before handoff, since a constraint that
  contradicts a criterion is a trap for the architect.

## Lacked

- Nothing new.

## Longed for

- A fixture that is a git repository, so the resolved path is proven on
  fixed ground rather than on the league's own tree; storing one means
  building it in the test, which is a task of its own.

Feeds: `analyse`.
