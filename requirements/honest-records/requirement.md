# Requirement: honest-records

_Written in analyse mode. Ask, from a day of readings: three readings said
"not met" about things that were met, and none of the three was the
model's fault. A checklist line was stricter than the template; an output
was recorded without its first turn; a reader read an older copy of the
checklist it found in the tree. The same skill also behaved as three
skills across three setups (a pasted chat, a system prompt, a workspace
with the repository open), and the record names the model and says
nothing of the setup. And every fix relegated the records that led to it,
which is right, and the standings then read as if nothing had ever been
measured. Also in the ask: "I'm not a fan of your versioning."_

## Goal

Kai wants a record to be evidence a reader can trust and compare: it
carries the whole exchange, it is read against the checklist it names, it
says how the skill was given to the model, and a relegated record stays
visible as stale rather than vanishing from the board; he will know when
the evals README says the first two, the contract has a `setup` field the
ledger enforces, the standings name stale records under a candidate, the
workflow writes its setup, and a task is named for the change it makes.

## Assumptions

- `setup` takes one of four words: `chat` (the skill pasted as a message
  before the ask), `system` (the skill as a system prompt, a Gem, a Space
  instruction), `workspace` (the skill loaded by an agentic runtime with a
  repository open), `workflow` (the evals workflow). A record with any
  other value is incomplete.
- The whole exchange means every turn from the first line the model wrote
  to the last, including the author's answers to its questions, verbatim.
- The reading is made against the checklist text at the record's
  `expect_sha`; a reader handed that text cannot read an older copy.
- A stale record is one whose `verdict` is `pass` but whose shas no longer
  match; it counts for nothing and is listed under the candidate, so the
  board says "measured, then moved" and not "never measured".
- A task is named for the change it makes, in a few words, never with a
  version number; the tasks already named stay as they are.

## Constraints

- The standing line `<skill>: <move>: candidate skill, <n> of 2 fresh
models` does not change (code-v2 holds it); the stale records are lines
  under it, indented.
- The record's other fields and the body's two sections do not change.
- No dash; no dependency beyond node.

## Acceptance criteria

1. `evals/README.md` says the Output is the whole exchange, first line to
   last, the author's answers included, and that the reading is made
   against the checklist at the record's `expect_sha`.
2. The record contract has a `setup` field with the four values; `kaal
ledger` on `fixtures/no-setup` exits 1 naming `setup` as missing; the
   README lists the field and the values; every record under `evals/` in
   the league's tree carries one of the four.
3. `kaal ledger` on `fixtures/stale-record` prints, under the candidate's
   standing, one indented line per stale record naming the file and the
   reason, and the standing line keeps its shape.
4. The evals workflow's record template writes `setup: workflow`.
5. The requirement template's Task line says a task is named for the
   change it makes, not numbered.

## Open questions

- Should `reader` also carry a setup, when the reader is not the model?
  (v1: no; the reading is one prompt in one thread.)

## Handoff

- Task: honest-records
- Criteria: 5; tests: 5 (equal)
- Red run: `node --test --test-timeout=60000 requirements/honest-records/acceptance.test.mjs`;
  all five red; the build turns them green
- Tests: `acceptance.test.mjs`, beside this file; fixture roots
  `fixtures/no-setup` and `fixtures/stale-record`
- Open questions: 1, listed above
- Blocked on: nothing
- Supersedes: eval-record-v1, on the field list (one field added)
- Status: closed
