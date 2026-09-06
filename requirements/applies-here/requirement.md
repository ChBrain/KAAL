# Requirement: applies-here

_Written in analyse mode. Ask, from Kai: KAAL now has an external mode in
name, and the question is how a script, a skill or a person reading prose
is supposed to know which mode it is in without being told. Pointed at a
tree that never adopted the league, the tool answers dishonestly twice
over: `kaal check` reported a plain `src/` directory as a skill with no
SKILL.md and no adversarial fixture, and `kaal ledger` and `kaal drawings`
answered "every rung evidenced" and "every drawing holds its shape" for a
ledger and drawings that do not exist. An invented finding and a vacuous
pass are the same defect twice: a command answering a question that was
never asked of that tree._

## Goal

Whoever points a KAAL command at a repository that has not adopted the
league wants the command to say the question does not apply here, rather
than inventing a finding or passing on nothing; they will know when each
of the five commands that read a league artefact from a root ends by a
code of its own and names what it looked for and did not find, and when
the league's own answers are unchanged.

## Assumptions

- A tree that holds none of the artefact a command reads has not adopted
  the league for that question. The honest answer to "does every rung
  have its evidence" on a tree with no skills is that the question does
  not apply, not "yes".
- Exit 2 is free in this tool, which uses 0 for an answer and 1 for
  findings or a usage error, and a non-answer must not share the code of
  a pass, because a caller that reads only the code is the caller most
  likely to be misled.
- Applicability belongs to each command, not to a global mode: the
  design's own rules carry it (a rule declares its prerequisites and
  returns not applicable when they are absent), and the league's fixture
  roots are trees that hold `skills/` or `architecture/` without being
  adopted repositories and must keep answering as they do.
- The five commands are the ones that take a root and read a league
  artefact from it: `ledger`, `drawings`, `check`, `agents`, `fixtures`.
  The rest read `kaal.config.json` or an explicit list of files, and
  already fail in the open when there is nothing to read.

## Constraints

- The league's own answers do not change, and the board's nine walls stay
  green (criterion 3).
- The closed requirements that fix these commands on their fixture roots
  stay met: push-v1 and code-v2 on the ledger and its standings,
  architect-v2 on drawings, skills-v1 and fixtures-v1 on check, agent-v1
  on agents. Each points its command at a root that does hold what the
  command reads, so applicability holds there and their tests are
  untouched.
- No dependency beyond node; no dash.

## Acceptance criteria

1. Each of `ledger`, `drawings`, `check`, `agents` and `fixtures`, run
   on `fixtures/foreign` (a tree holding a README and a `src/a.js` and no
   league artefact), exits 2, prints nothing on stdout, and prints one
   line on stderr of the shape `<command>: not applicable here: <what it
looked for>`.
2. `kaal check` on that tree names no finding against `src`: the tree's
   own directories are not read as skills when none of them carries a
   `SKILL.md`.
3. On the league's own tree each of the five answers exactly as it does
   today, exiting 0 with its present summary line, and `npm test` stays
   green on nine walls.

## Open questions

- Should `gates`, `acceptance`, `contracts`, `standard` and `runner`
  learn the same answer? Today `gates` on a foreign root throws on the
  missing config, which is loud but not an answer.
- Should adoption be a marker at the root (`kaal.config.json`) rather
  than an artefact each command looks for, once a consumer repository
  exists that holds one?
- Should the not-applicable line carry the same words in a machine
  readable form, for a caller that reads output rather than the code?
- Does the skills side of this ask (the six seats saying they act inside
  a repository that has adopted the league, and assessment as a seventh
  seat) belong in its own task? (This one is the script rung alone.)

## Handoff

- Task: applies-here
- Criteria: 3; tests: 3 (equal)
- Red run: `node --test --test-timeout=60000 requirements/applies-here/acceptance.test.mjs`;
  criteria 1 and 2 red, criterion 3 green before the build and to be kept
  green after, since it is the promise that nothing else moved
- Tests: `acceptance.test.mjs`, beside this file; fixture root
  `fixtures/foreign`
- Open questions: 4, listed above
- Status: open
- Blocked on: nothing
- Supersedes: nothing
