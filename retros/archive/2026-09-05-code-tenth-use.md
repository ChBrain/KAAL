# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the tenth use of the code skill, on `architecture/gates-v2`,
5 September 2026.

## Liked

- The fix in the runner is one option, `shell: true`, and the expander is
  four lines around node's own `globSync`; the diff is mostly fixtures and
  tests losing shell-isms.
- The contract tests caught two line-format mistakes of mine before the
  build did anything: the runner's `ok` carries three spaces, the judged
  line two.

## Learned

- A fixture command must parse the same under `sh` and `cmd.exe`: double
  quotes outside, single quotes inside, nothing escaped. The first version
  of the `plain` fixture escaped an inner quote and broke under both.

## Lacked

- A way to run the units wall on Windows from here; the platform-neutral
  fixtures are argued, not observed.

## Longed for

- `windows-latest` in the `ci` matrix.

Feeds: `code`.
