# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the seventy-second use of the code skill, moving the two units that
test a directory beside the directory, 12 September 2026.
Place: this repository

## Liked

- Neither needed the gate widened. `assess/` and `witness/` are directories
  under `bin/lib/`, so a unit about the directory sits beside it and the wall's
  existing glob already runs it. The two that looked like they needed a new
  place needed no place at all.
- Both match their originals, five and six, compared before either was named.

## Learned

- Three files were called command drivers an hour ago and only one is.
  `assess` imports two modules out of `bin/lib/assess/` and `witness` two out
  of `bin/lib/witness/`; both are units of a subsystem and were read as
  command tests because their names match a command. A file's subject is what
  it imports, and the list was made by reading names.
- A test beside a command is a script to something else. `bin/kaal.test.mjs`
  turned `push-v1` red on its fifth criterion, which asks that every script in
  `bin/` has a test asserting a failure on bad input, and a `.mjs` file under
  `bin/` is a script to that reading. It is right about scripts and wrong
  about tests, and the fix is the analyst's on that task's own branch.
- Only one of the twenty-one is genuinely about the command. That one is the
  last, it needs a criterion amended and then a gate widened, and it is the
  only part of this item that is three lanes rather than one.

## Lacked

- A reading of what a file imports before deciding where it goes. The list of
  three was built from file names and two of the three were wrong, which cost
  nothing here only because the imports were read before anything moved.

## Longed for

- One place that says what counts as a script. `push-v1` decides it by a glob
  in a test, and a test file that lands in the same directory is a script by
  that definition and by nothing anyone would say out loud.

Feeds: code
Read: analyse
