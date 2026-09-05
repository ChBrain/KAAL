# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifth real use of the analyse skill, on `requirements/agent-v1`
(Kaal into the tree, superseding PR #1), 4 September 2026.

## Liked

- The design's section 3 was specific enough that the criteria were a
  transcription: seven fields, six sections, four chapters, one command.
- Kaal's own text from May carries over unchanged; the requirement only
  moves it and gives it a binding.

## Learned

- A loop over zero items is a green test. Criterion 3 passed on an empty
  `agents/` before anything existed; every test that iterates must first
  assert there is something to iterate. This is the third time this session
  the same shape appeared (nested tests, an empty gates list, and now this).

## Lacked

- Division names. The requirement takes rung names as a stand-in and says
  so, but the standings table will want its own words.

## Longed for

- A wall for the "loop over nothing" shape itself: a test that asserts
  nothing about count before iterating could be found by reading the test
  file, and that is a script candidate.

Feeds: `analyse`.
