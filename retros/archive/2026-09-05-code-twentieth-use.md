# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the twentieth use of the code skill, on `architecture/eval-runner`
(the runner module, the command, the generated file), 5 September 2026.

## Liked

- The generated file is checked byte for byte, so the formatter is a wall
  on the generator: the first render carried two blank lines where the
  formatter keeps one, and `--check` said stale after `prettier --write`.
  The generator now emits what the formatter would, and the check holds
  on the formatted tree.

## Learned

- A document that must survive both a formatter and a byte comparison is
  written to the formatter's taste from the start: no trailing newline
  inside a joined part, one blank line between parts, fences that no inner
  fence can close.

## Lacked

- Nothing new.

## Longed for

- A wall for stale runners, so a skill edit cannot land without
  regenerating them; the requirement left it open, and `--check` is the
  one line it would take.

Feeds: `code`.
