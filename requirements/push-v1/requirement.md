# Requirement: push-v1

_Written in analyse mode. Ask, verbatim: "now KAAL needs to eat its own
dogfood; analyse for push: human -> NLP, NLP -> Skill, Skill -> Script; also
hooks, CI." The ask counts as two tasks that fail independently: this one,
the push up the ladder, and `gates-v1`, the hook and the CI that give the
Script rung a place to run. Both are written; this is the first._

## Goal

Kai wants every move in the league to be able to climb the ladder on
evidence, one rung at a time, with the first climbs made: a human move
recorded as human, a model move promoted to skill on two models' fixture
records, a skill move promoted to script with a test that was seen red; he
will know when the ledgers say which rung each move holds, a script can
refuse a ledger that claims a rung without evidence, and at least one move
stands on each rung above human for a reason on disk.

## Assumptions

- "Push" is promotion up the ladder in the design's section 6: a move climbs
  one rung at a time and never past a test at the target rung.
- The human rung is a seat's own moves that a person makes on purpose (the
  ask, the approval, the key), and they are recorded in the ledger so the
  ladder shows the whole move set, not only the model's part.
- An eval record is a file under `evals/<skill>/<fixture>/`: one model's
  output on one fixture, read against the fixture's `expect.md`, with
  `model`, `verdict`, and `skill_sha` (the SHA-256 of the skill's `SKILL.md`
  at the time of the run) in its frontmatter. A record whose `skill_sha` no
  longer matches is stale and counts for nothing: editing a skill relegates
  its moves until they are re-evaluated, and no one has to remember it.
- The second model runs in CI, through a chat completions endpoint the
  repository is configured with (superseded by evals-v2: it was the hosted
  models a workflow could read with a `models: read` permission, retired on
  30 July 2026); the first is whatever runtime a person used. The eval
  workflow is expensive, so it fires only on an `/eval <skill>` comment or a
  manual dispatch, never on a push; it writes the records and commits them.
  The model advises; the `skill_sha` gates. This is khai's audit lane,
  learned, not linked.
- A skill is NLP and scripts: a move that reaches the Script rung lives in
  that skill's own `scripts/` directory (the standard's, discovered with
  `references/` and `assets/`), is called from its `SKILL.md`, and ships in
  the bundle. A skill's scripted move never lives outside the skill.
- `bin/kaal.mjs` is the league's own tooling, Kaal's moves (the skill rules
  check, the ledger check, the retro count), not a member's.
- Scripts are plain node with no dependency, so a consumer needs nothing
  installed to run one.

## Constraints

- A rung is a measurement: a move claims `skill` only with eval records from
  at least two models, and `script` only with a script and a test that was
  seen red (from `DESIGN.md` section 6).
- Scripts stay blind to how a skill is written; they read what a skill must
  contain (from `requirements/skills-v1`).
- Every script has a unit test and a red fixture the wall was watched to fail
  on (from `DESIGN.md` section 8).
- No en-dash or em-dash; MIT; no vendor named (house rules).

## Acceptance criteria

1. The ledgers of `analyse`, `architect` and `operate` each list at least one
   move at rung `human` (the ask, the approval, the key).
2. `node bin/kaal.mjs ledger [root]` exits 0 on the league's own tree, exits
   1 on `fixtures/bad-ledger` (a ledger claiming `skill` with no test), and
   exits 1 on `fixtures/stale-ledger` (a ledger claiming `skill` on records
   whose `skill_sha` does not match the skill's `SKILL.md`).
3. `node bin/kaal.mjs check` exits 0 on `skills/` and exits 1 on
   `fixtures/bad-skill/`, whose one skill names a vendor.
4. `node bin/kaal.mjs retros` exits 0 and prints one line per skill with its
   count of unconsumed retros.
5. Every script under `bin/` has a test under `tests/`, and every script
   under a skill's `scripts/` has a test beside it, each asserting a failure
   on bad input.
6. At least one ledger move stands at rung `script`, naming a script under
   its own skill's `scripts/` directory that its `SKILL.md` calls, and a test
   that exists and passes.
7. At least one ledger move stands at rung `skill`, naming an eval directory
   holding records from at least two distinct models, each with the verdict
   `pass` and a `skill_sha` equal to the SHA-256 of that skill's `SKILL.md`.
8. A workflow under `.github/workflows/` runs the evals only on an
   `/eval <skill>` comment or a manual dispatch, never on `push` or
   `pull_request`, reads its endpoint from repository configuration
   (superseded by evals-v2; it held the `models: read` permission), and
   writes records under `evals/`.

## Open questions

- Resolved: the second model is the hosted one a workflow can read; the
  first is a person's runtime.
- Does the ledger check also refuse a `candidate` that has sat unchanged for
  more than ten retros, or is staleness the retro's business?
- Should `kaal retros` also archive, or is archiving a separate command with
  its own test?

## Handoff

- Task: push-v1
- Criteria: 8; tests: 8 (equal)
- Red run: `node --test requirements/push-v1/acceptance.test.mjs`, all eight
  failing, no script and no record exists; green on a stand-in in scratch
- Tests: `acceptance.test.mjs`, beside this file; bad inputs under
  `fixtures/`
- Open questions: 3, listed above
- Status: open
