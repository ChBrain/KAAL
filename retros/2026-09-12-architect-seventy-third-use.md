# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the seventy-third use of the architect skill, drawing
`a-plan-picks-its-suites`, 12 September 2026.
Place: this repository

## Liked

- The stand-in earned its whole cost twice in one sitting. It reported green
  on a red case, and it could not name the file a red case came from, and both
  were found by running rather than by reasoning. Neither would have been
  visible in a drawing that stopped at the seam list.
- The open question the analyst left is answered and the answer is the boring
  one: the regression plan names a wall, that wall is on the board, and it
  runs when the others do. Every alternative added a second kind of gate.

## Learned

- A run started from inside `node --test` inherits `NODE_TEST_CONTEXT`,
  reports as a subtest of its parent and exits 0 whatever happened. The
  stand-in did it, the contract caught it, and `tests/gates.test.mjs` has held
  a unit about exactly this since before the units moved. I wrote the same
  defect the tree already had a guard for, in a module that does not import
  the guard.
- The runner does not say which file a red test came from. Two files handed to
  `node --test` directly answer one flat stream of test names, and the file
  names only appear when the runner discovers the files itself. So the fast
  answer and the exact answer are two different runs, and the design is to ask
  the second only when the first has already failed.
- The cost of this wall is machine time and it is not hideable. A regression
  plan picks suites whose cases their own walls have just run, so a board with
  it runs that work twice. Every way of avoiding it makes a second kind of
  gate, and a board where some walls run and some do not is a board whose
  green means two things.

## Lacked

- Any way for a new module to inherit a trap another module already solved.
  `wallEnv` exists, it is exported, and nothing points a writer at it except
  having read the module that uses it.

## Longed for

- One runner in this tree rather than a spawn per caller. Three modules now
  start `node --test` and each one has to remember the same two things about
  the environment it must not pass on.

Feeds: architect
Read: code
