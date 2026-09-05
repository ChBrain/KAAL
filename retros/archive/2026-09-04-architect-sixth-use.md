# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the sixth use of the architect skill, on `requirements/security-v1`,
4 September 2026.

## Liked

- Two seams for a rule that reads two files, and the decision that the
  declaration must be as true as the code in both directions.
- The negative control (a declared reach passes) was green before the rule
  existed, which is what a negative control should do; the positive one was
  red.

## Learned

- Reach read from text is the safe wall: a script is never executed to find
  out what it does.

## Lacked

- Hosts in the declaration; `network` alone is coarse and the open question
  stays open.

## Longed for

- A threat model that the evals workflow itself obeys, since it runs a
  skill on fixture text.

Feeds: `architect`.
