---
traces:
  supersedes: nothing
---

# Requirement: each-skill-carries-its-own-version

_Written in analyse mode. Ask, from Kai: "go for it, but also skill version
0.0.1. each skill moves on its own. a set might make sense on top using
dependencies." That is three tasks and this is the first. The second is that
a skill which changes moves its own version, which can fail on its own and
needs a base to compare against. The third is the set, which he marked as a
maybe rather than an ask._

## Goal

Whoever runs a skill wants to name which version of it they ran, so that a
skill's promise can move without the tool's version moving and an eval record
can say what it evidenced; they will know when every skill declares a version
of its own and a wall refuses one that does not.

## Assumptions

- The version lives at `metadata.version`. The standard's frontmatter allows
  `name`, `description`, `license`, `compatibility`, `allowed-tools` and
  `metadata` and nothing else, which `bin/lib/rules.mjs` mirrors, so a
  top-level `version` key would be a finding against the standard. `metadata`
  already requires string values, so `"0.0.1"` is a string and not a number.
- Every skill starts at `0.0.1` and only its patch place moves, the same rule
  Kai set for the tool. The two versions are unrelated: a skill at `0.0.3`
  sitting in a tool at `0.0.1` is the point of each skill moving on its own.
- A skill's promise is behaviour and the version says nothing about how well
  it is kept. The ledger and the eval records already answer that, and this
  version is a name for a state of the text, not a claim about it.
- The tool's own package does not ship the skills, which
  `the-engine-is-installable` fixed: `files` names `bin` and nothing else. A
  skill is an artefact with its own version because it is not cargo in
  someone else's tarball.
- Whether a changed skill must move its version is a separate task, because
  it can fail on its own and it needs a base to compare against, which is
  `kaal class`'s question and not `kaal check`'s.

## Constraints

- The skill rules apply to the skills: the standard's shape, MIT, no vendor
  or product named, no dash. Adding a key must leave every skill passing the
  standard's own reference validator, which the `standard` job runs.
- `kaal check` keeps its shape: findings one per line on stderr, exit 0, 1 or
  2, and the skills directory as its argument rather than a root.
- Nothing outside `skills/`, `bin/lib/rules.mjs`, `SURFACE.md` and the tests
  moves.

## Acceptance criteria

1. Every skill under `skills/` declares `metadata.version` whose value is
   three numeric places and whose minor and major places are both zero.
2. `kaal check` on a skills directory holding a skill with no
   `metadata.version` writes a finding naming that skill on stderr and exits 1.
3. `kaal check` writes a finding naming the skill and the version it found
   when the version is not three numeric places, and when its minor or its
   major place is not zero.
4. `SURFACE.md`'s section for `check` names the version among what the rules
   require, so the page and the command do not disagree about what `check`
   answers.

## Open questions

- Does a skill's version belong in its eval records, so a record says which
  version of the text a model was run against? The records carry three shas
  today, which is a stronger claim and a less readable one.
- Should the set Kai mentioned depend on skill versions by range or by exact
  version? A range is the usual answer and it lets a set drift; an exact
  version makes every skill move a set move.
- When a skill's version moves, does the tool's move with it? The assumption
  above says no, and the answer only matters once something depends on both.

## Handoff

- Task: each-skill-carries-its-own-version
- Criteria: 4; tests: 4 (equal)
- Red run: `node --test --test-timeout=60000 requirements/each-skill-carries-its-own-version/acceptance.test.mjs`
- Tests: `acceptance.test.mjs`, beside this file; criteria 2 and 3 build a
  skills directory in a temporary place, because a finding about a broken
  skill cannot be proven on skills that are not broken
- Open questions: 3, listed above
- Blocked on: nothing
- Supersedes: nothing
- People: none
