# Requirement: code-v2

_Written in analyse mode. The ask is a stack: the first ten retros on the
code skill, read as section 6 of the analyse skill says. Two Lacked items
recur: the judged walls print no count, so the board shows `ok acceptance`
with no number (retros 3, 4); and a new rule reaches into fixtures written
for older rules, which nobody can list before the board finds them (retros
5, 8). A third asks the ledger to say what a move at a candidate rung is
waiting for (retro 1)._

## Goal

Whoever uses the code skill wants the board to count what the judged walls
ran, a list of every fixture artefact a new rule will reach, a ledger that
says how far a candidate move is from its rung, and the skill's text to
carry what ten uses learned about formatting the whole tree and about
fixtures; they will know when the two commands print a count line the board
shows, `kaal fixtures` lists the artefacts, `kaal ledger` prints the
standing of every candidate, the skill's text says the two things, a fixture
reproduces the whole-tree rule, and the ten retros are archived.

## Assumptions

- The count the board reads is the runner's own convention, a line
  `# pass N`; the judged commands print it after their lines, N the total
  of passing tests across the files they ran.
- A fixture artefact is a file of a shape the walls read, under any
  directory named `fixtures`: a `SKILL.md`, a `kaal.config.json`, an eval
  record (a `.md` with `verdict:` in its frontmatter), a `requirement.md`,
  a `drawing.md`.
- A candidate move is one whose `candidate` is `skill`; its standing is the
  count of fresh passing models out of the two the rung needs.

## Constraints

- What the retros liked stays: the walls as data, one finding per broken
  rule, the count regex as the walls' shared convention (Liked, retros 2,
  3, 9).
- The judged verdict table does not change (status-v1, status-v2).
- No dependency beyond node; no dash; the skill under its budget (rules).

## Acceptance criteria

1. `kaal acceptance` and `kaal contracts` end their output with a line
   `# pass N`, N the total passing tests across the files run, and
   `kaal gates` on the league's tree shows a count on the acceptance and
   contracts lines.
2. `kaal fixtures [root]` prints one line per fixture artefact,
   `<shape> <path>` with the shape one of `skill`, `config`, `record`,
   `requirement`, `drawing`, sorted by path, and exits 1 when a root holds
   none (`fixtures/none`); on `fixtures/some` it lists exactly the five
   artefacts planted there.
3. `kaal ledger` prints one line per candidate move, `<skill>: <move>:
candidate skill, <n> of 2 fresh models`, on the root
   `architecture/push-v1/fixtures/ledger` and on the league's tree.
4. The skill's text says the repository's checks run on the whole tree
   (format everything, every time), and that the house rules apply to code
   as well: a rule about a banned character is written as its escape
   (retro 4 Learned, retro 1 Learned).
5. The skill's text says fixtures obey the rules they are not testing, and
   that a fixture command is a program and its arguments that parses the
   same under every platform's shell (retros 5, 8 Learned; retro 10
   Learned).
6. A fixture `fixtures/whole-tree/` holds an `ask.md` (a change in one
   directory) and an `expect.md` that requires the whole tree formatted and
   every wall run before the handoff.
7. The ten retros named below are under `retros/archive/` and none remains
   in `retros/`.

## Open questions

- Hosts in the Reach declaration (retro 7 Lacked).
- A secret-scanning wall (retro 7 Longed for).
- A second platform in the `ci` matrix (retro 10 Lacked and Longed for).
- Division names (retro 6 Lacked).
- Kaal's stamp as a move with a record (retro 6 Longed for).
- A way to inject a failing command into the hook without the hook knowing
  about the test (the analyse skill's second retro; retro 2 here).

## Retros consumed

`retros/archive/2026-09-04-code-first-use.md`,
`retros/archive/2026-09-04-code-second-use.md`,
`retros/archive/2026-09-04-code-third-use.md`,
`retros/archive/2026-09-04-code-fourth-use.md`,
`retros/archive/2026-09-04-code-fifth-use.md`,
`retros/archive/2026-09-04-code-sixth-use.md`,
`retros/archive/2026-09-04-code-seventh-use.md`,
`retros/archive/2026-09-04-code-eighth-use.md`,
`retros/archive/2026-09-04-code-ninth-use.md`,
`retros/archive/2026-09-05-code-tenth-use.md`.

## Handoff

- Task: code-v2
- Criteria: 7; tests: 7 (equal)
- Red run: `node --test --test-timeout=120000 requirements/code-v2/acceptance.test.mjs`;
  five red; criteria 6 and 7 green by this change (the fixture and the
  archive are the analyst's acts); no stand-in, the build's
  green is the proof
- Tests: `acceptance.test.mjs`, beside this file; fixture roots under
  `fixtures/`
- Open questions: 6, listed above
- Blocked on: nothing
- Supersedes: nothing
- Status: closed
