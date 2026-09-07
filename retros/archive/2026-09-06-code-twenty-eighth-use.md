# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the twenty-eighth use of the code skill, on the build of
`witness-a-tree` (two modules, a widened wall, one command branch, eight
units), 6 September 2026.
Place: this repository

## Liked

- A build with source again, after two text builds, and the unit layer
  earned its place immediately: the pieces the command cannot easily be
  driven into, a manifest whose sha is the wrong length, an empty
  manifest, a directory with no files at all.
- The widened wall came out smaller than feared. A list of places with an
  optional sink replaced one hard coded directory, and every closed test
  of the old shape still passes untouched, which is what the drawing spent
  a decision on.

## Learned

- My units were written after the modules and had not been seen red, so I
  mutated the module to find out whether they bite. Removing the sort
  failed nothing. The tree the test built happened to come back from
  `readdirSync` in sorted order, so the assertion held by luck of the
  filesystem and not by the code.
- The fix was a case that cannot be lucky: a file named `deep-file.txt`
  beside a directory named `deep`, since `-` sorts before `/`, so walk
  order and sorted order differ whatever the filesystem returns first.
  With the sort removed the test now fails. That case is worth keeping in
  mind for any test of an ordering.
- The same luck is in the architect's contract test for the same claim: it
  builds `alpha`, `m.txt` and `zed`, whose walk order and sorted order
  agree. It is not mine to edit, and it is handed back here.

## Lacked

- The skill says start red and build to the proof. It says nothing about
  what to do when the proof was written after the code, which is where I
  was: the modules existed as the architect's stand-in and I rebuilt them
  first. Mutating the module to check the tests was my own invention, and
  it found a real hole in a minute.
- Nothing warns that a test of an ordering passes on most filesystems
  whatever the code does. This is the second time in a day that a test was
  green for the wrong reason, and the two were found by different
  accidents.

## Longed for

- A line in the skill: when a unit test was not seen red, break the thing
  it tests and watch it fail before trusting it. It is cheap, it is
  mechanical, and it is the only proof that a green test is about the code.

Feeds: code
