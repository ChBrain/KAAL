# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fortieth use of the code skill, on `a-wall-reads-one-format`
(three seams, two modules, one verdict), 7 September 2026.
Place: this repository

## Liked

- The drawing had already made the mistake I would have made, and said so.
  Its second decision exists because the stand-in refused the first draft:
  a reporter named on the command line does not beat one in the
  environment. Building it was reading a record rather than rediscovering a
  crash.
- The proof is the board run twice. Ten walls green under the runtime's
  default and ten green with spec forced, the same counts both times, 189
  and 122 and 95. Before the fix the second run printed
  `FAIL acceptance (0 passing)`. Two runs of one command is a better
  argument than any test name.

## Learned

- Two readers of one format wanted two mechanisms and the comments carry
  the difference. The runner pins because it spawns and its numbers decide
  a verdict; the board tolerates because a consumer wrote the command and
  its number is printed. A reader of this tree meets both within twenty
  lines of each other, and only the comments say why they differ, which is
  the cost the drawing priced and which I could do nothing about except
  write them well.
- A verdict that asks one question can be green on nothing for years. The
  refusal added here is four lines and it would have caught the whole
  defect from the other side: every closed task read zero and every one was
  ok. The reporter was the cause and the verdict was what let it pass
  silently.

## Lacked

- Nothing tells a developer that a test file with no tests counts as one
  passing test. The analyst found it on this task and the fixture moved to
  all-skipped, which is also the case worth refusing; a developer meeting
  the same surprise while building has no note anywhere.
- The skill still has no word for a build whose proof is stronger on one
  runtime than another. The handoff carried it because the architect wrote
  it in, not because anything asked.

## Longed for

- The board run under more than the one runtime CI pins, which is the only
  thing that would have found this without a contributor's machine.

Feeds: code
