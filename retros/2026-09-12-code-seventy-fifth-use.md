# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the seventy-fifth use of the code skill, keeping the runner's target
out of a case, 12 September 2026.
Place: this repository

## Liked

- One helper, three call sites, eight cases. The fix was smaller than the
  find because the two spawns were already separate functions; nothing had to
  be threaded anywhere.
- The scratch proof came before the diff. One deleted line on a file copy
  turned the two red walls green, which settled the whole design question
  before a single real edit was made.

## Learned

- The reasoning was written and the list was short, twice. `wallEnv` says a
  nested run must not inherit the runner's own marker, and kept the runner's
  own target. One case file clears `GITHUB_BASE_REF` and `GITHUB_HEAD_REF`
  with a comment saying every case says what it wants and nothing else, and
  does not clear the league's own. Both are the same sentence with an
  incomplete enumeration after it, and neither wall reads the sentence.
- A wall and a case want opposite things from the same variable. A wall is
  about this tree and is told its target so it never guesses; a case builds a
  tree of its own and must not be told anything about this one. The two
  spawns looked alike enough to share a helper for as long as the helper was
  only about the runner's marker.
- Measuring beat guessing twice over. `KAAL_BRANCH` looked exactly as guilty
  as `KAAL_BASE` and turns nothing red; a sweep of every case file in the
  tree found six, where reading imports had suggested nine and reading
  spawn sites had suggested ninety-four. Clearing what is not leaking would
  have been a rule nobody can point at a failure for.

## Lacked

- A unit for the two spawns being different. Nothing said a case's
  environment is a wall's minus the tree's declaration, so a helper that
  served one served both for as long as nobody asked.

## Longed for

- One list of what a nested run must not inherit, in one place, that both
  the modules and the case files read. There are three enumerations of it
  now and they disagree.

Feeds: code
Read: test
