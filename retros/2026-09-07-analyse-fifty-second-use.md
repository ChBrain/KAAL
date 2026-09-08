# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifty-second use of the analyse skill, on
`requirements/the-release-runs-on-a-key`, written from Kai's ask after the
v0.0.1 cut, 7 September 2026.
Place: this repository

## Liked

- The shape came from a record arguing with its own skill. The v0.0.1
  release wrote down why it filed no deploy script: for an artefact that is
  a git ref, a script is a wrapper and its tests test the wrapper. The
  operate retro repeated it as a Lacked. Reading both before writing a
  criterion turned an ask for a workflow into a task about what is worth
  testing, which is a better task and none of it was my idea.
- The command refuses and never releases. Splitting it that way put the
  testable half in the tool with unit tests and left the untestable half,
  two git commands behind a token, in the workflow where it belongs. The
  weak proof is confined to one criterion instead of spread over six.

## Learned

- A version is not a path, and this is the third command to say so. The
  first draft took a root as its second argument, which meant applicability
  was handed a version string and would have refused every tree. `runner`
  solved this by asking about the working directory and `class` by reading
  a flag; this one takes `runner`'s answer. The task the last drawing named,
  `an-argument-is-read-once`, now has three commands behind it and its
  reopen condition has arrived.
- The unit test that counts the guarded commands did real design work
  twice. It went red on a tenth command, which is what it is for, and then
  went red again because `release` and `class` refused a foreign tree in
  byte-identical words. A reader could not have told which command spoke.
  The reason now names what the command wanted, a version, rather than the
  file it read.
- Searching a workflow for a step finds the comment that explains the step.
  Deleting the `kaal release` line left the header's sentence about what
  `kaal release` is for, and the test stayed green. Seventh time this week
  that a pattern read across too much text held nothing.

## Lacked

- Nothing says how to write a criterion whose proof cannot run here. Five
  of six are driven by runs; the sixth reads a file that GitHub executes and
  nobody else. The requirement says so in an assumption because I decided to
  say it, not because anything asked.
- The skill has no rule for a task that arrives as a question in
  conversation. This one is Kai's sentence from four hours ago, quoted in
  the opening line, and the shape for that is the same as a stack's by luck
  rather than by design.

## Longed for

- A way to mark a criterion as proven elsewhere, in the requirement rather
  than only in the build's handoff, so a reader of the spec knows before the
  build which promises the board will never hold.

Feeds: analyse
Read: test
