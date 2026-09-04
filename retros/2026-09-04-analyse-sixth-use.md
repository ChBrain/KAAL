# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the sixth real use of the analyse skill, on
`requirements/security-v1`, 4 September 2026.

## Liked

- Three of five criteria were already true on the tree (permissions, the
  lockfile, no undeclared reach); the requirement turned facts into walls
  without inventing work, and the red run said which two were missing.
- The threat model as a section of `SECURITY.md` rather than a second
  document: one file to find.

## Learned

- "Reach" is a property a wall can read from a script's imports; the
  declaration it demands is one heading in the skill's own text, which keeps
  the skill portable and the rule cheap.

## Lacked

- A way to say in the requirement that a criterion is already met, so the
  handoff's red run is honest about being a partial red.

## Longed for

- Hosts named in a reach declaration, once a script actually calls one.

Feeds: `analyse`.
