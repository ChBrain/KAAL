# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifty-first use of the analyse skill, on
`requirements/the-board-counts-the-reads`, written from a task a merged
drawing named rather than from a stack, 7 September 2026.
Place: this repository

## Liked

- Checking whether the named gap had already cost something, before writing
  a line of the requirement. It had: the surface page still describes the
  command as it was two changes ago, and nothing noticed because the sweep
  rule did not exist when that change landed. The task grew one criterion
  and the requirement gained a fact instead of an assumption.
- The stand-in refused itself on the first run and the fix was already in
  the tree. Applicability read `--check` as a root and said "no
  skills/<name>/ under --check", and the same file solves the same problem
  for `class` eight lines below, with a comment saying why. A precedent
  found by the failure rather than by remembering it.

## Learned

- A test that always passes an argument never exercises the call without
  one. Every test here drove `kaal retros --check <root>`, and the board
  runs `kaal retros --check` with no root, which is a different path through
  applicability. Reverting the applicability fix reddened nothing, and that
  is what said so: the invocation the wall actually makes was the one
  nothing tested. Both forms are driven now.
- Two isolations reddened nothing because a word appeared twice in the same
  entry for different reasons. `read` is in the surface page's answer, in
  its rule about the ten, and in its `Read:` line, so a match over the entry
  was green with the answer deleted. Sixth time this week, and the fix is
  always the same: find the sentence that states the thing, then read only
  that.
- I made the exact mistake I wrote a retro about two hours ago. A script
  that writes its file once at the end loses every edit before the assertion
  that throws, and the run afterwards was green, which read as success. The
  retro naming it is in the archive; writing it down did not make me do it.

## Lacked

- Nothing says a test must drive the form its consumer uses. The tests drove
  the command the way a person types it and the board types it differently,
  and only an isolation caught the gap.
- Nothing checks that the surface page still describes the commands. This
  requirement fixes one paragraph by hand, and that paragraph went stale in
  a merged change with a green board and nobody noticing for a day.

## Longed for

- A wall that reads `SURFACE.md` against the commands it describes, at least
  as far as the exit codes each one names. Every command's page lists its
  codes and the tree can produce them, so a page claiming two where the
  command has three is findable without a person rereading it.

Feeds: analyse
Read: test
