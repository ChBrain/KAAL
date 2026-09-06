# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the eleventh use of the architect skill, on `requirements/evals-v2`
(the evals workflow's endpoint as configuration, after the hosted service
was retired), 5 September 2026.

## Liked

- Three seams, and the only one that moved is the middle one: the request
  shape stayed, the destination became a setting. The drawing could say
  what does not change, which is most of it.

## Learned

- A refusal step that precedes the run is a seam of its own: settings in,
  a named absence out. It earned a decision because the alternative, the
  provider's message, had just been shown to mislead.

## Lacked

- A way to hold seam 2 against a real endpoint from a contract test; the
  test reads the fetch's text. A local chat completions stub would let the
  workflow's script run for real.

## Longed for

- The evals script out of the workflow file and into `bin/`, where a unit
  test can call it with a stub endpoint.

Feeds: `architect`.
