# Requirement: standard-v1

_Written in analyse mode. Ask, verbatim: "make it tested. it should hit us
when we diverge from it." The standard is Agent Skills (agentskills.io);
the league pins its specification by hash and mirrors its constraints as a
wall, but the mirror skips three optional fields the specification
constrains, the standard's own validator never runs, and a change to the
specification reaches nobody until someone re-pins by hand._

## Goal

Kai wants divergence from the Agent Skills standard to turn something red
by itself, in both directions: a skill in the tree that the standard
refuses, and a specification that moved away from what the league pinned;
he will know when the rules wall refuses every field shape the pinned
specification constrains, the standard's reference validator runs over
every skill in CI, and a command compares the pinned hash with the live
text and says drift.

## Assumptions

- The specification is the one file the config already pins:
  `docs/specification.mdx` in the standard's repository, hashed with
  SHA-256; the reference validator is `skills-ref` from the same
  repository, installed at a commit the config names.
- The mirror stays offline and in the walls; the comparison with the live
  text needs the network and is a command and a CI job, never a wall.
- The three fields the mirror skips are `compatibility` (1 to 500
  characters when present), `allowed-tools` (a non-empty string when
  present) and `metadata` (a map from string keys to string values when
  present); a flat frontmatter parser must learn to read the map.
- Divergence in CI is a red job named `standard`, on every pull request,
  every push to main, and once a week, so a specification that moves on a
  quiet week still reaches the board.

## Constraints

- Walls stay offline and node-only (gates-v1, the design); the validator is
  a CI dependency, never a runtime one.
- Re-pinning stays a deliberate act: the command reports drift and changes
  nothing.
- No dash; the rules wall keeps its finding shape `<skill>: <rule>: <message>`.

## Acceptance criteria

1. `kaal check` on `fixtures/fields` finds `compat-long: compatibility:`,
   `tools-empty: allowed-tools:` and `metadata-flat: metadata:`, and finds
   nothing on `optional-ok`, whose three optional fields are well formed
   and whose `metadata` is a map.
2. The `ci` workflow has a job named `standard` that installs the
   reference validator from the standard's repository at the commit
   `kaal.config.json` names under `standard.validator.ref`, runs it over
   every directory under `skills/`, and runs `kaal standard`; the workflow
   also runs on a weekly schedule.
3. `kaal standard <file>` in `fixtures/spec` exits 0 on `spec.txt`, whose
   hash the fixture config pins, and exits 1 on `drift.txt` with a message
   naming both hashes and the word drift.
4. `README.md` says how compliance is tested: the mirror on every push,
   the reference validator and the pin comparison in CI.

## Open questions

- Should the validator's version be pinned by a release tag once the
  standard cuts releases, rather than by commit? (v1: the commit; a tag
  when one exists.)
- Should `kaal standard` also print which mirror rule each specification
  paragraph maps to? (v1: no; the hash says whether to look.)

## Handoff

- Task: standard-v1
- Criteria: 4; tests: 4 (equal)
- Red run: `node --test --test-timeout=60000 requirements/standard-v1/acceptance.test.mjs`;
  all four red; the build turns them green
- Tests: `acceptance.test.mjs`, beside this file; fixture skills under
  `fixtures/fields`, a fixture root under `fixtures/spec`
- Open questions: 2, listed above
- Blocked on: nothing
- Supersedes: nothing
- Status: closed
