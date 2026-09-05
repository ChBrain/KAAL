# Requirement: eval-record-v1

_Written in analyse mode. Ask: the eval record, which today carries a model,
a verdict and the skill's SHA, must say under what conditions its evidence
was made before the first two records exist, because a record shape is hard
to change once evidence is filed. Prompted by an outside review that named
"two model names agreed once" as too thin a proxy for correctness._

## Goal

Kai wants an eval record to mean "this evidence was made under conditions a
reader can reproduce and a change can invalidate": which model produced the
output and which read it, at what temperature, on which day, against which
exact fixture and which exact skill, with the raw output and the reading kept
in the file; he will know when the ledger refuses a record that lacks any of
it or that names a fixture or skill that has since changed.

## Assumptions

- The record stays one markdown file under `evals/<skill>/<fixture>/`, with
  the frontmatter as its contract and two body sections, the output and the
  reading; raw output is kept in full, since fixtures are public asks.
- The reader is a model too, named separately from the model that produced
  the output; in v1 they may be the same model.
- Freshness extends from the skill to the fixture: a record carries the
  SHA-256 of the fixture's `ask.md` and `expect.md` as well as the skill's
  `SKILL.md`, and any of the three changing makes the record stale.
- Two distinct `model` values are still the bar for the Skill rung; what
  changes is what a record must carry to count at all. Aggregation over
  repeated runs, and human adjudication of a disputed reading, are later
  versions.

## Constraints

- No wall is relaxed: a record that met the old shape but lacks a new field
  counts for nothing until it is regenerated (the evals workflow does that).
- The frontmatter stays flat, one shape, as the parser ruled in push-v1.
- The record's required fields are named once, in `evals/README.md`, and the
  ledger reads the same list from one place in code.
- No en-dash or em-dash; no dependency beyond node.

## Acceptance criteria

1. `evals/README.md` exists and names every required field of a record:
   `model`, `reader`, `temperature`, `date`, `fixture`, `ask_sha`,
   `expect_sha`, `skill_sha`, `verdict`, and the two body sections, Output
   and Reading.
2. `kaal ledger [root]` counts a record as evidence only when every required
   field is present: exit 0 on `fixtures/complete`, exit 1 on
   `fixtures/missing-field`, whose records lack `temperature`.
3. Freshness covers the fixture: exit 1 on `fixtures/stale-fixture`, whose
   records carry an `ask_sha` that does not match the fixture's `ask.md`.
4. The evals workflow writes every required field and both sections into the
   records it commits.

## Open questions

- Should `temperature` be required, or should a settings map be accepted for
  models that do not expose it?
- How many repeated runs make a reading, and at what agreement, once records
  are cheap: this is the harness's N and K and it is not in v1.

## Handoff

- Task: eval-record-v1
- Criteria: 4; tests: 4 (equal)
- Red run: `node --test requirements/eval-record-v1/acceptance.test.mjs`,
  all four failing; green on a stand-in
- Tests: `acceptance.test.mjs`, beside this file; fixture roots under
  `fixtures/`
- Open questions: 2, listed above
- Status: closed
