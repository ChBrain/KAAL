# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the seventy-fifth use of the analyse skill, amending
`an-install-carries-the-method`'s acceptance suite so that it packs on both
platforms, 11 September 2026. Found by recording a run, not by reading.
Place: this repository

## Liked

- The answer was already in the tree and already explained. Three suites pack
  a tarball before this one, and two of them spawn `npm.cmd` under a shell
  with a comment saying why: npm is a shell script on one platform and a batch
  file on the other, and node refuses to spawn a batch file without a shell.
  The fix here is that precedent copied, and the criteria are untouched.
- Nothing had to be softened to go green. The suite asserts exactly what it
  asserted; only the thing it shells out to changed.

## Learned

- A record is what turns a platform failure into a wall. This suite has failed
  on Windows since the day it shipped and the board stayed green, because
  without a record a red suite reads `not delivered`, which is an answer. The
  moment a run was recorded it read `regressed` and the wall went red. The
  delivery vocabulary did precisely what it was built to do, two days later
  than it could have, because nobody had written down that the suite passed.
- So `an-install-carries-the-method` was merged, superseded three closed
  tasks, and shipped the method to the package while one of the two platforms
  this league claims to run on had never once executed its proof.
- The fourth suite to pack a tarball repeated what the first three had each
  solved, and one of them carries the reason in a three line comment beside
  its own fix. A lesson written next to its fix is a lesson only the next
  reader of that one file receives.

## Lacked

- Nothing in the skill says to read the suites that already do this thing
  before writing the next one. This suite was written against its criterion,
  which is right, and against none of its three neighbours, which is how the
  same platform bug gets solved a fourth time.
- No word for a proof that has never run where the league claims to run. The
  coverage row counts a suite as proved when a record exists, and a record is
  written by whichever platform happened to run `runs --write`.

## Longed for

- Something that notices a spawn by a name that is not an executable on both
  platforms. Three suites and one red wall have now paid for the same rule,
  and it is three characters of regular expression.

Feeds: analyse
Read: code, test
