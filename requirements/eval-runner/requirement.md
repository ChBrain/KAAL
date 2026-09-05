# Requirement: eval-runner

_Written in analyse mode. Ask: the page that carried the two prompts to a
phone did more for a skill today than the evals workflow, and it was made
by hand, twice, and went stale twice. A runtime that could not reach it
went hunting in the tree and read an older checklist. The page is a pure
function of the skill, its references, the fixture and their hashes, so it
is a script, and it belongs in the tree where any runtime and any phone
can read it._

## Goal

Whoever runs a skill on a fixture by hand wants the two prompts and the
record's frontmatter generated from the tree, current by construction and
committed beside the fixture, so that a phone copies from the repository
page and a runtime in the workspace reads the same text; they will know
when `kaal runner <skill> <fixture>` prints the document, `--write` files
it as `RUNNER.md` beside the fixture's ask and expect, `--check` refuses a stale one, and
the league's own fixture carries a current one.

## Assumptions

- Prompt 1 is a framing paragraph (the text between the lines is the
  instruction; no search; no repository; answer the ask in full), then the
  skill's `SKILL.md`, then each file under the skill's `references/` after
  a line naming it, then the fixture's `ask.md`.
- Prompt 2 is the reader's instruction (one word first, then one line per
  item, met or not met and why; no search), then the checklist lines of
  `expect.md`, then `Output:` and nothing after it.
- The frontmatter has the three shas and `fixture` filled and `model`,
  `reader`, `setup`, `temperature`, `date`, `verdict` as placeholders.
- `RUNNER.md` lives in the fixture's directory, so it travels with the
  skill and no reader of `evals/` mistakes it for a record; it is a
  generated file and says so on its first line; the
  document's three parts are fenced blocks so a repository page renders a
  copy button on each.

## Constraints

- No dash in the generated text, so the file passes the tree's own grep;
  no dependency beyond node.
- The runner reads the tree and writes one file; it never calls a model.

## Acceptance criteria

1. `kaal runner analyse json-flag` prints a document whose first fenced
   block contains the analyse skill's `SKILL.md` text and its
   `references/requirement.md` after a line naming it and the fixture's
   `ask.md`; whose second fenced block contains every checklist line of
   `expect.md` and ends with `Output:`; and whose third block carries
   `ask_sha`, `expect_sha` and `skill_sha` equal to the files' current
   SHA-256 and `fixture: json-flag`.
2. `kaal runner <skill> <fixture> --write` writes
   `skills/<skill>/fixtures/<fixture>/RUNNER.md` with that document, and `--check`
   exits 0 when the file equals the output and 1 when it differs
   (`fixtures/stale-runner`, a root whose `RUNNER.md` is one byte off).
3. `skills/analyse/fixtures/json-flag/RUNNER.md` exists and `--check` on
   the league's tree exits 0.

## Open questions

- Should a stale `RUNNER.md` be a wall, so a skill edit cannot land
  without regenerating its runners? (v1: `--check` exists; the wall is one
  line in the gates list when the runners have earned it.)

## Handoff

- Task: eval-runner
- Criteria: 3; tests: 3 (equal)
- Red run: `node --test --test-timeout=60000 requirements/eval-runner/acceptance.test.mjs`;
  all three red; the build turns them green
- Tests: `acceptance.test.mjs`, beside this file; fixture root
  `fixtures/stale-runner`
- Open questions: 1, listed above
- Blocked on: nothing
- Supersedes: nothing
- Status: closed
