# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifth use of the code skill, on `architecture/eval-record-v1`,
4 September 2026.

## Liked

- The record module is forty lines and three readers use it; the ledger
  lost its parsing and gained the reasons it drops a record.
- The workflow's shas are computed with the same function the ledger reads
  with, so the two cannot disagree by construction.

## Learned

- A contract that supersedes a shape reaches into every fixture that carried
  the old shape: the push-v1 drawing's evidence fixture went stale the
  moment the record grew, and a unit test said so. Fixtures are evidence
  artefacts and follow the contract, not the drawing that wrote them.

## Lacked

- A way to find every file of a given shape when the shape changes; the
  failing test found this one, and a wall that reads records anywhere
  would have found all.

## Longed for

- The first real record, now that the shape is settled.

Feeds: `code`.
