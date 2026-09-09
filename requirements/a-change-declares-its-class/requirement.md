---
traces:
  supersedes: nothing
---

# Requirement: a-change-declares-its-class

_Written in analyse mode. Ask, from Kai, in two parts: "we start with
0.0.x, you do not touch minor or major", and then "from 0.0.x to 0.1.x
might be a bigger step than just a change, we are still learning." The
first makes the class of a change something a machine must be able to
refuse rather than something a developer declares. The second says the
refusal is about the version and not about the surface: while the version
sits in its patch place the surface may still move, and the move past that
place is a decision, not an accident. `skills/code/SKILL.md` has told the
developer since before this to name "the change class the repository's own
tooling computes (never a class you chose)", and nothing computes one._

## Goal

Whoever proposes a change wants the repository to say what class it is, so
that a raise past the patch place cannot happen quietly; they will know
when one command names which artefacts moved and refuses a version whose
minor or major place has changed, on the board, on every push.

## Assumptions

- The class is computed from the diff against a base, not declared. That
  is what the code skill has been asking for, and a declaration is exactly
  the thing a developer can get wrong or wave through.
- Three artefacts move independently and are worth naming apart: the
  surface (`SURFACE.md`), the tool (`bin/`), and the skills
  (`skills/<name>/SKILL.md`). Everything else is the league's own working
  and moves without meaning for a consumer.
- A surface change is reported and never refused while the version's minor
  and major places are zero. That is what 0.0.x means, and refusing it
  would make every new command a decision for Kai when he has said the
  decision he wants is the version's.
- The refusal is on the version alone: a change whose `package.json`
  version differs from the base's in its minor or major place is not
  something this repository does to itself. Only a human raises it, and
  the wall says so by name.
- The base is a git ref and defaults to `origin/main`. A tree with no git
  history, or no `package.json`, is not a tree this question belongs to
  and the command says so on exit 2 (`applies-here`).
- The fixtures are git repositories built by the tests, because a command
  that reads history cannot be proven on a directory of files. The
  twenty-fifth analyse retro asked for exactly this and called it a task
  of its own; it is this one.

## Constraints

- Deterministic and offline. Git is local; nothing here reaches the
  network.
- The line shapes already fixed hold: one finding per line on stderr, the
  applicability line as `applies-here` fixed it, and the exit vocabulary
  of `SURFACE.md`.
- The command is added to `SURFACE.md`, which means this change moves the
  surface, which the command itself will report. That is correct and worth
  seeing on the first run.

## Acceptance criteria

1. `kaal class [root]` exits 2 with one line on stderr naming what it
   looked for, and nothing on stdout, when the root has no git history or
   no `package.json`.
2. Against a base, the command names on stdout which of the three
   artefacts moved, one line each, using the words `surface`, `tool` and
   `skills`, and says nothing of an artefact that did not move.
3. The command exits 1 when the version in `package.json` differs from the
   base's in its minor or its major place, with one line on stderr naming
   both versions and saying the raise is the human's; it exits 0 when the
   versions are equal or differ only in the patch place.
4. The wall is in the `gates` list of `kaal.config.json`, and `SURFACE.md`
   carries a section for the command like every other.

## Open questions

- Should the command count how many changes have moved the surface since
  the version last rose, so the decision to go to 0.1.0 can be made from
  evidence rather than from feel? It is the reason the report exists and
  it needs history this task does not yet read.
- What does the wall do once the version is past 0.0.x, when a surface
  change really does earn a minor bump? The answer is not writable until
  the surface has settled, which is Kai's point.
- Does the skills artefact deserve a version of its own, given that a
  skill's promise is behaviour and only records evidence it?
- Should `--against <ref>` exist, or is the base always `origin/main`?

## Handoff

- Task: a-change-declares-its-class
- Criteria: 4; tests: 4 (equal)
- Red run: `node --test --test-timeout=60000 requirements/a-change-declares-its-class/acceptance.test.mjs`;
  all four red, run and read
- Tests: `acceptance.test.mjs`, beside this file; the fixtures are git
  repositories the tests build in a temporary directory
- Open questions: 4, listed above
- Status: closed
- Blocked on: nothing
- Supersedes: nothing
- People: none
