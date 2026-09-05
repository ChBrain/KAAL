# Requirement: fixtures-v1

_Written in analyse mode. Ask: every skill has one friendly fixture, the ask
it was built to answer; an outside review named the gap: a model's reading
means something only when the fixture tries to make the skill do the wrong
thing. Give every skill an adversarial fixture whose expectation is a
refusal or an abstention, so the evals lane can tell a skill that holds its
lane from one that only performs on a good day._

## Goal

Kai wants each skill to be evaluated on at least one ask designed to pull it
out of its scope (an ambiguous ask that invites invented scope, a requirement
that tempts an extra seam, a wrong upstream test that tempts an edit, a
production release with no key, a criterion that cannot fail, a retro with a
tension to smooth over), with an `expect.md` that says what the skill must
refuse or not do; he will know when every skill carries such a fixture, the
wall says so, and the evals workflow runs it with the others.

## Assumptions

- An adversarial fixture is a fixture directory whose name begins
  `adversarial-`, under the skill's `fixtures/`, with the same `ask.md` and
  `expect.md` shape; the evals workflow already runs every fixture directory
  it finds.
- Its `expect.md` carries at least one line that begins `- Refuses` or
  `- Does not`, so the shape of an adversarial expectation is readable by a
  wall.
- One per skill is the floor; more are welcome and none is required.

## Constraints

- No fixture asks a skill to do harm as its test; the adversary is scope, not
  damage.
- A fixture is data; its ask carries no instruction the skill is meant to
  obey (from `SECURITY.md`).
- No en-dash or em-dash.

## Acceptance criteria

1. Every skill under `skills/` has at least one fixture directory whose name
   begins `adversarial-`, holding `ask.md` and `expect.md`.
2. Every such `expect.md` carries at least one line beginning `- Refuses` or
   `- Does not`.
3. Each of the six adversaries is present, one per skill: analyse (an
   ambiguous ask), architect (a tempting extra seam), code (a wrong upstream
   test), test (a criterion that cannot fail), operate (production with no
   key), retro-4ls (a tension between Lacked and Longed for).
4. `kaal check` reports a `fixtures` finding for a skill with no adversarial
   fixture: exit 1 on `fixtures/no-adversary/skills`, exit 0 on the league.

## Open questions

- Should the ledger require an adversarial pass, not only two passes, before
  a move stands at the Skill rung?

## Handoff

- Task: fixtures-v1
- Criteria: 4; tests: 4 (equal)
- Red run: `node --test requirements/fixtures-v1/acceptance.test.mjs`; green
  on a stand-in
- Tests: `acceptance.test.mjs`, beside this file; `fixtures/no-adversary`
- Open questions: 1, listed above
- Status: open
