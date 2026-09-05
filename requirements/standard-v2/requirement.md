# Requirement: standard-v2

_Written in analyse mode. Ask, from a defect reported in a comment on pull
request #28: on Windows, `kaal standard` printed that the pinned
specification was unchanged and then died with a libuv assertion,
`!(handle->flags & UV_HANDLE_CLOSING)` in `src\win\async.c`. The command
exits the process while the fetch's sockets are still closing; on POSIX
that is silent, on Windows it is a crash after the right answer._

## Goal

Kai wants `kaal standard` to end the same way on every platform, and the
`standard` job to prove it where the crash was seen; he will know when the
job runs on Windows as well as Linux and both are green.

## Assumptions

- The cause is `process.exit()` called after an awaited `fetch`: the exit
  code should be set and the process left to drain. Nothing else in the
  command touches the network.
- The job's validator loop is a shell loop, so on Windows it runs under
  bash, which the runner has.

## Constraints

- The job name `standard` stays; the matrix adds a platform, and the
  check names become `standard (ubuntu-latest)` and
  `standard (windows-latest)`; neither is a required check.
- No dash; walls untouched.

## Acceptance criteria

1. The `ci` workflow's `standard` job runs on a matrix of `ubuntu-latest`
   and `windows-latest`, its validator loop declares `shell: bash`, and it
   still runs `kaal standard` on both.

## Open questions

- None.

## Handoff

- Task: standard-v2
- Criteria: 1; tests: 1 (equal)
- Red run: `node --test --test-timeout=60000 requirements/standard-v2/acceptance.test.mjs`;
  red; the build turns it green, and the Windows job on the pull request
  is the run that matters
- Tests: `acceptance.test.mjs`, beside this file
- Open questions: 0
- Blocked on: nothing
- Supersedes: nothing
- Status: closed
