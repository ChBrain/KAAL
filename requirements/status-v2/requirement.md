# Requirement: status-v2

_Written in analyse mode. Ask, again a refusal: with three drawings written
and their contract tests red by design, the contracts wall reds the board and
the hook refuses the push, exactly as it refused the analyst's red run before
status-v1. Status belongs to the task; every artefact of a task should read
it, and the contracts wall does not._

## Goal

Kai wants a drawing's contract tests to be judged the way a requirement's
acceptance tests are: by the status of the task they belong to, so an open
task's red contracts are reported and a closed task's red contracts fail; he
will know when a push with three open drawings goes through and a closed
task's red contract still refuses it.

## Assumptions

- A drawing belongs to the task named by its directory:
  `architecture/<task>/` reads `requirements/<task>/requirement.md` for its
  status. A drawing with no requirement of that name has no status and
  fails.
- Three of status-v1's verdicts apply; the fourth does not: an open task's
  drawing may be all green (its seams hold before the task is done, as
  push-v1's do while its manual step waits), so for a drawing, open is
  reported whatever the counts, and only a closed task's drawing must be
  green.
- The command is `kaal contracts <files...>`, a sibling of `kaal
acceptance`, over the same glob the contracts wall already uses.

## Constraints

- No wall is relaxed: a closed task's red contract fails exactly as today.
- One judging mechanism, two status lookups; the verdict table is not
  duplicated.
- No en-dash or em-dash; no dependency beyond node.

## Acceptance criteria

1. `node bin/kaal.mjs contracts <files...>` prints one line per drawing with
   its task's status and counts, and exits 1 when a closed task's drawing
   has a red test or when a drawing's task has no requirement or no status;
   exit 0 otherwise, an open task's drawing reported whatever its counts.
2. The contracts wall in `kaal.config.json` runs that command over the
   contracts glob.
3. `node bin/kaal.mjs gates` exits 0 on the league's own tree with
   `architecture/eval-record-v1`, `architecture/agent-v1` and
   `architecture/security-v1` present and their tasks open.

## Open questions

- When a task closes, its drawing's contracts become walls that must be
  green: is that the moment to move the drawing under a `closed` mark, or
  is the requirement's line enough? (v1: the line is enough.)

## Handoff

- Task: status-v2
- Criteria: 3; tests: 3 (equal)
- Red run: `node --test requirements/status-v2/acceptance.test.mjs`; green
  on a stand-in
- Tests: `acceptance.test.mjs`, beside this file; fixture tasks under
  `fixtures/`
- Open questions: 1, listed above
- Status: closed
