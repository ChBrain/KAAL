# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the first real use of the code skill, on `architecture/push-v1`,
4 September 2026.

## Liked

- Starting red was cheap and true: nineteen unit tests written before a
  module existed, then every module written to its test, in the seams' order.
- The drawing's fixed list held: the finding format, the rung-relative paths
  and the exit codes were never a question while building, only a target.
- Every layer above the code was already red and stayed untouched; nothing
  had to be argued with a test.

## Learned

- The dash ban applies to code too: a regex that names the banned characters
  is itself banned, so a rule about a character is written as its escape.
- Criterion 7 cannot be turned green by this seat: two fresh eval records
  need a person's runtime and the hosted model. A criterion that names a
  manual step should be marked so in the requirement, not discovered here.
- Inferred: a stand-in from the analyst's seat is most of a build; the code
  seat spent its time on tests and edges, not on shape.

## Lacked

- A record from a first model, so that the skill rung could be evidenced in
  the same pull request as the tool that checks it.
- A hook and a workflow to run the walls in; gates-v1 is its own task and
  until it lands the walls are run by hand.

## Longed for

- A way to say in the ledger that a move is blocked on a manual step, so the
  table can show it instead of reading as merely unevidenced.

Feeds: `code`.
