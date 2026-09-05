# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the twelfth use of the code skill, on `requirements/public-v1`
(the capabilities of a public repository, as khai wires them),
5 September 2026.

## Liked

- The build is nine small files and three test edits; the tests that
  restrict the PATH now name `node.exe` on Windows and fall back from a
  symlink to a copy, which is the one place the platform leaks in.

## Learned

- A test that simulates "no sh" by emptying the PATH has to put back the
  one thing the wall needs, under the name the platform looks for; the
  first version would have failed on the very platform it was written for.

## Lacked

- A Windows machine to run the units wall on before pushing; the
  `walls-windows` job is the first run, and it may come back red.

## Longed for

- Nothing new.

Feeds: `code`.
