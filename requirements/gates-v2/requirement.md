# Requirement: gates-v2

_Written in analyse mode. Ask, from a defect: on a Windows machine with no
`sh` on the path, every wall reported FAIL and the pre-push hook refused the
human's first eval record, because the runner starts every wall through
`sh -c`. The board said the league was broken when only the runner's shell
was. A runtime reading the board could not tell the difference either and
called the failures pre-existing._

## Goal

Kai wants the board to mean the same thing on every platform the league's
own conduct already warns about: a wall's command runs through the platform's
own shell, the globs the walls carry are expanded by the league's commands
when the shell does not, and line endings do not turn the format wall red on
a checkout that git converted; he will know when the runner passes a config
of plain node commands on a path with no `sh`, `kaal acceptance` and `kaal
contracts` run a literal glob, and a `.gitattributes` holds every text file to
LF.

## Assumptions

- Node's own shell mode (`shell: true`) picks `/bin/sh` on POSIX by absolute
  path and `cmd.exe` on Windows; the runner uses it and stops naming `sh`.
- `node --test` expands its own glob patterns since node 21, so the units
  and script walls need no help; the acceptance and contracts commands are
  the league's and must expand the glob they are handed when it arrives
  unexpanded.
- The one shell feature the walls use is none: every command is a program
  and its arguments.

## Constraints

- The gates list's commands stay as they are; the fix is in the runner and
  the two commands, not in the config.
- No dependency beyond node; `fs.globSync` is node's own.
- No en-dash or em-dash.

## Acceptance criteria

1. `kaal gates` on `fixtures/plain` (two walls that are plain node commands,
   one printing a count) exits 0 and reads the count, when run with a `PATH`
   that holds node and no `sh`.
2. `kaal acceptance` and `kaal contracts` handed a literal glob (the string
   `requirements/*/acceptance.test.mjs`, unexpanded) run the files it names.
3. `.gitattributes` exists and sets `text=auto eol=lf` for every path.
4. `kaal gates` on the league's own tree is green.

## Open questions

- Should the hook itself be a node script rather than `sh`, so that a
  machine with no `sh` at all still runs it? (git on Windows ships a `sh`
  for hooks; v1 leaves the hook.)

## Handoff

- Task: gates-v2
- Criteria: 4; tests: 4 (equal)
- Red run: `node --test requirements/gates-v2/acceptance.test.mjs`; three
  red, the board green; the first run hung because the test re-entered its
  own file through node's glob expansion, and was rewritten on a fixture root
- Tests: `acceptance.test.mjs`, beside this file; `fixtures/plain`,
  `fixtures/globs`
- Open questions: 1, listed above
- Status: closed
