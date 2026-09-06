# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the twenty-sixth use of the code skill, on the build of
`where-a-skill-acts` (six skill files, one regenerated runner page, no new
code), 6 September 2026.

## Liked

- The drawing had fixed the heading, its position and the ten phrases, so
  the build was transcription and not invention. The seven red tests turned
  green in one pass, with the eighth green where the handoff said it would
  be.
- Regenerating the runner page was one command named in the handoff, so the
  runners wall never had to catch it. A constraint written down at analyse
  survived two seats and cost nothing at the third.

## Learned

- A build with no source has no unit layer. The skill's second step, write
  the unit test first, has nothing to bite on when the thing built is prose,
  and the contract tests are the only proof there is. That is not a gap in
  the build; it is a rung the ladder does not have here.
- The stand-in the architect discarded was the build, exactly. Doing the
  same edit twice is cheap when it is text, but the second run proved
  nothing the first had not, and the only new information came from the
  requirement's status change.

## Lacked

- The skill says every line in the diff is there because a test needs it.
  Six of these lines are there because a model has to read them, and the
  tests hold their presence and their place, not their meaning. Nothing
  told me how to judge a line whose proof is a grep.
- No guidance on closing a task whose build has no code. I closed it on the
  three green runs, which is what the skill says, but the runs were two
  layers and not three.

## Longed for

- A way to say in the diff which layer a change has, so a text build is not
  read as a code build with a missing unit test.
- The eval on the analyse fixture, run against the new page, before this
  lands rather than after. The record goes stale the moment the skill moves,
  and nothing reruns it; the honest board shows a stale record and waits for
  a human.

Feeds: code
