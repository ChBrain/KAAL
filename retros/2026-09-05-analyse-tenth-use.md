# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the tenth use of the analyse skill, on `requirements/gates-v2` (a
defect reported from a Windows machine: every wall FAIL, read by a runtime
as pre-existing), 5 September 2026.

## Liked

- The ask was a transcript: what the board printed, and what a runtime said
  about it. Both went into the requirement's first paragraph as evidence,
  and the goal followed from the gap between them.
- Four criteria, each a run of the tool under a condition the defect named:
  no `sh` on the path, a glob nobody expanded, a checkout git converted.

## Learned

- The red run itself hung. A test that hands `node --test` a literal glob
  runs every file the glob names, including its own; a test that drives the
  league's commands on the league's own tree must run on a fixture root, or
  guard on `KAAL_GATES`. The requirement's handoff now records that.
- A runner that fails six walls for one cause reports six defects. The
  reader on the other machine believed the six.

## Lacked

- A timeout on the red run; `node --test` has `--test-timeout` and the red
  run's command in the handoff could carry it.

## Longed for

- The board saying, when every wall fails the same way, that the runner and
  not the tree is the likely cause.

Feeds: `analyse`.
