# Requirement: status-v1

_Written in analyse mode. The ask arrived as a refusal: the pre-push hook,
on its first run, refused a push because the board was red, and the red was
an open requirement's criterion that no code can meet (push-v1's manual
step). Nothing in the league says when an open requirement's proof starts to
gate; today it gates from the moment it exists, so a task in progress reads
as a broken tree._

## Goal

Kai wants the board to distinguish a task that is not finished from a tree
that is broken, without ever relaxing a wall: an open requirement's red
tests are its analyst's red run and are reported; a closed requirement's red
tests are a failure; and an open requirement whose tests are all green is a
failure too, because it is done and must be closed. He will know when a push
goes through with push-v1 open and its manual step undone, and a closed
requirement with one red test still refuses the push.

## Assumptions

- A requirement declares its status in its own file, in the Handoff section,
  as `- Status: open` or `- Status: closed`; there is no third value and no
  default.
- Closing a requirement is the analyst's act, made when every criterion is
  green; opening one is the analyst's act at handoff.
- The acceptance wall keeps its shape in the gates list and keeps reaching
  every `acceptance.test.mjs` by glob (gates-v1 criterion 5); what changes is
  the command that runs them.

## Constraints

- No wall is relaxed: a closed requirement gates exactly as today.
- Silence is not success: a requirement with no status is a failure, and an
  open requirement that is all green is a failure that says "close it".
- The gates list's entry shape stays `{ name, command, fix }` (gates-v1).
- No en-dash or em-dash; no dependency beyond node.

## Acceptance criteria

1. Every `requirement.md` under `requirements/` carries exactly one
   `- Status: open` or `- Status: closed` line.
2. `node bin/kaal.mjs acceptance <files...>` prints one line per requirement
   naming its status and its pass and fail counts, and exits 1 when any
   closed requirement has a red test, when any open requirement has no red
   test, or when any requirement has no status; it exits 0 otherwise, with
   open requirements' reds reported as open.
3. The acceptance wall in `kaal.config.json` runs that command over the
   requirements glob.
4. `node bin/kaal.mjs gates` exits 0 on the league's own tree while push-v1
   is open with its manual step undone.

## Open questions

- Should closing a requirement also archive the retros it consumed, or is
  that the retro count's separate command?
- Does a closed requirement's test file stay in the wall forever, or move to
  a regression set after some time?

## Handoff

- Task: status-v1
- Criteria: 4; tests: 4 (equal)
- Red run: `node --test requirements/status-v1/acceptance.test.mjs`, all
  four failing, no command and no status lines exist; green on a stand-in
- Tests: `acceptance.test.mjs`, beside this file; fixture requirements under
  `fixtures/`
- Open questions: 2, listed above
- Status: closed
