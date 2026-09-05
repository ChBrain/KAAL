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

- It came back red three times, and every cause was a test's or a
  fixture's: `true` and `false` as fixture walls, `npm` spawned without a
  shell, the hook's executable bit read from a filesystem that keeps none,
  and a tree walk compared with the platform's separator. The runner and
  the tool were right on Windows from the first run.

## Lacked

- A Windows machine to run the units wall on before pushing; the
  `walls-windows` job was the first run.
- The board's own lines in the log: the first two red runs said `FAIL
acceptance` and nothing else. The runner now prints a failing wall's
  lines under its FAIL line, and the judged runner names each red test,
  which is what made the third round diagnosable.

## Longed for

- Nothing new.

Feeds: `code`.
