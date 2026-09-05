# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the tenth use of the architect skill, on `requirements/gates-v2`,
5 September 2026.

## Liked

- Three seams, each one line: the platform shell is node's and not ours,
  the commands expand their own globs, the tree pins LF. Nothing new was
  invented; two defaults were stopped from being assumed.
- The decision "fixtures follow the constraint" reached back into gates-v1
  and push-v1: their shell-isms would have kept the units wall red on the
  machine where the defect was found, and the drawing says so.

## Learned

- A contract for "runs without `sh`" can be held on POSIX by taking `sh`
  off the PATH; it proves the absence, not the presence of `cmd.exe`, and
  the drawing says which.

## Lacked

- A Windows runner to hold the contract where the defect lives; the `ci`
  workflow runs one platform.

## Longed for

- A second platform in the `ci` matrix, once the required check's name can
  survive it.

Feeds: `architect`.
