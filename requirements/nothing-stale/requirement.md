# Requirement: nothing-stale

_Written in analyse mode. Ask: the stack of ten unconsumed retros on the
code skill, the eleventh to the twentieth use. Read under section 6 of the
analyse skill: recurring Lacked items and Lacked items that name a defect
are criteria, Learned items that changed how the skill should read are
criteria on its text, Longed for items are open questions, Liked items are
constraints._

## Goal

Whoever uses the code skill wants a model reading it to leave nothing stale
behind a build: no test that breaks on a formatter's line wrap, no fixture
that still carries the old shape of a contract, no generated file the
formatter would rewrite, no green requirement left open, and no runner file
that no longer matches its fixture; they will know when the skill's text
says each of the first four in the section where a developer looks, the
board carries a wall for stale runners, and the ten retros are archived.

## Assumptions

- The four are text misses: the whitespace lesson was paid twice (retros
  13 and 16 Learned), the fixture walk once with nineteen files (retro 19
  Learned), the formatter lesson once with a byte comparison (retro 20
  Learned), the close-in-the-same-change lesson once with a runner test two
  tasks away (retro 17 Learned).
- A wall for stale runners is the eval-runner requirement's open question
  answered: the developer's twentieth retro longs for it, `--check` is the
  one line it takes, and a fixture without a runner file is not stale,
  since a runner is opt-in until it is earned.
- The stand-in the developer lacked (retro 13 Lacked) is the analyst's
  rule to fix, and the analyse stack's requirement (fixed-ground)
  carries it.

## Constraints

- What the retros liked stays: the board's counts on every wall (retro 15),
  a diff that is the drawing's Structure made literal (retros 11, 16, 19),
  fixtures that obey the rules they are not testing and parse under every
  shell (retro 12), the runner printing a failing wall's lines (retro 12
  Lacked, since built).
- The skill stays under its line budget and the standard's shape; no
  vendor, no dash, nothing that names a runtime (rules).
- The runners wall reads and compares; it writes nothing and calls no
  model (eval-runner's constraints).

## Acceptance criteria

1. The build rules in section 3 say a test that reads prose compares with
   whitespace folded, since the formatter wraps where it likes.
2. Section 1 says a change to a contract walks every fixture that carries
   the old shape, and names the fixtures that must stay as they are.
3. The build rules in section 3 say a generated file is written as the
   formatter would write it, and its check runs on the formatted tree.
4. Section 5 says a task whose tests are all green is closed in the same
   change, since an older task's runner test reads the board.
5. `kaal runner --check` with no skill and no fixture named reads every
   `RUNNER.md` under `skills/*/fixtures/*/`, prints one line per file, and
   exits 1 naming each stale one (`fixtures/stale-runner`, one file one
   byte off) and 0 when every one is current (`fixtures/current-runner`);
   a fixture without a runner file is not named; and the gates list in
   `kaal.config.json` carries a wall running it.
6. The ten retros named below are under `retros/archive/` and none of them
   remains in `retros/`.

## Open questions

- A record written by the workflow, the first since it existed, and the
  second record so a standing reads `2 of 2` (retros 11, 15 Longed for);
  both wait on a repository variable and a secret.
- The rerun of the analyse fixture against the analyse-v3 text (retro 16
  Longed for).
- The template stamped by a script (retro 13 Longed for; the architect's
  thirteenth retro too): the analyse ledger's `stamp the requirement file
from the template` move is the candidate.
- A Windows machine before pushing (retro 12 Lacked, once); the
  `walls-windows` job is the answer the league has.

## Retros consumed

`retros/archive/2026-09-05-code-eleventh-use.md`,
`retros/archive/2026-09-05-code-twelfth-use.md`,
`retros/archive/2026-09-05-code-thirteenth-use.md`,
`retros/archive/2026-09-05-code-fourteenth-use.md`,
`retros/archive/2026-09-05-code-fifteenth-use.md`,
`retros/archive/2026-09-05-code-sixteenth-use.md`,
`retros/archive/2026-09-05-code-seventeenth-use.md`,
`retros/archive/2026-09-05-code-eighteenth-use.md`,
`retros/archive/2026-09-05-code-nineteenth-use.md`,
`retros/archive/2026-09-05-code-twentieth-use.md`.

## Handoff

- Task: nothing-stale
- Criteria: 6; tests: 6 (equal)
- Red run: `node --test --test-timeout=60000 requirements/nothing-stale/acceptance.test.mjs`;
  five red; criterion 6 green by this change (the archive move is the
  analyst's act); the four text criteria seen green on a stand-in copy of
  the skill, then discarded
- Tests: `acceptance.test.mjs`, beside this file; fixture roots
  `fixtures/stale-runner` and `fixtures/current-runner`
- Open questions: 4, listed above
- Status: open
- Blocked on: nothing
- Supersedes: eval-runner, on its open question (the wall)
