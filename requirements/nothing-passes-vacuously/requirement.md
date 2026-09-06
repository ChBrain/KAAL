# Requirement: nothing-passes-vacuously

_Written in analyse mode. Ask, from Kai: "any chance to run KAAL without a
2nd repo (instance of KAAL)?", and "ok" on the answer. There is no second
repository and no instance: there is one engine and many roots, and a root
is a directory the engine is pointed at. Four commands stand in the way of
that. On a tree holding none of what they read, `retros` and `boundary`
pass in silence and `runner --check` and `gates` crash, and a crash is not
an answer either._

## Goal

Whoever points the engine at a root that is not the league wants every
command to say whether the question is that root's, so a board read there
is a board and not a coincidence; they will know when the four commands
that read the working directory answer, refuse, or say the question is not
this tree's, and never pass because they found nothing to judge.

## Assumptions

- This supersedes part of `applies-here`, on purpose and not by accident.
  That task guarded the four commands that judge a tree against a league
  artefact and left these four out, because at the time nothing ran them
  anywhere but the league. Its own principle brings them in now: `retros`
  reads `skills/`, `boundary` reads a guarded place, `runner` reads a
  fixture, `gates` reads `kaal.config.json`, and every one of them is a
  judgement about a tree.
- `fixtures` and `assess` stay out of the table, as they are. A listing
  that finds nothing has an answer (code-v2), and a target that can be
  assessed is any directory at all.
- A crash and a vacuous pass are the same defect wearing different
  clothes. `runner --check` and `gates` exit 1 today on a bare root, but
  on an unhandled error, and a caller reading only the code cannot tell
  that from a wall that ran and found something.
- The engine stays where it is: no `bin`, no version, no package. Naming a
  path into a checkout is ugly and it works, and packaging is a separate
  question from whether a command can answer about a root.
- The three commands that gain a root take it as the first argument, the
  way `ledger` and `drawings` already do. `runner` does not: its arguments
  are already positional, and a root among them would be ambiguous.

## Constraints

- The applicability line's shape is fixed by `applies-here`, closed:
  `<command>: not applicable here: <what it looked for>`, on stderr, exit
  2, nothing on stdout.
- The table stays one table in `bin/lib/applies.mjs`, asked once, before
  anything is read (`applies-here`, closed).
- The league's own board does not change: every wall that is green today
  is green after this, on the same exit codes.

## Acceptance criteria

1. On a tree holding none of what they read, each of `kaal retros`,
   `kaal boundary`, `kaal runner --check` and `kaal gates` exits 2 with
   one line on stderr naming what it looked for, and nothing on stdout.
2. Applicability stays per command and never per tree: on a root holding
   only `kaal.config.json`, `gates` answers and the other three say the
   question is not that tree's; on the league, all four answer as they do
   today.
3. `kaal retros [root]`, `kaal boundary [root]` and `kaal gates [root]`
   answer about the root they are given rather than the working directory,
   and `kaal runner` keeps its positional arguments unchanged.

## Open questions

- Should the engine become installable, with a version and a `bin`, so a
  root can be judged without naming a path into a checkout?
- `runner --check` sweeps the fixtures it finds. Should a root with skills
  but no fixture at all be a refusal, as this says, or an answer that
  there is nothing to keep current?
- Should `gates` refuse a config that holds no walls, which today is a
  failure, or is that the right answer already?

## Handoff

- Task: nothing-passes-vacuously
- Criteria: 3; tests: 3 (equal)
- Red run: `node --test --test-timeout=60000 requirements/nothing-passes-vacuously/acceptance.test.mjs`;
  all three red
- Tests: `acceptance.test.mjs`, beside this file; fixture root
  `fixtures/config-only/` here, and the foreign tree of `applies-here`
- Open questions: 3, listed above
- Status: open
- Blocked on: nothing
- Supersedes: `applies-here`, in part: its table of four becomes eight,
  and its unit test's list of commands the table does not name loses
  `gates`, `retros`, `runner` and `boundary`, keeping `fixtures`,
  `assess` and a command it has never heard of
