---
traces:
  supersedes: push-v1@9862ad13549e7ea50b3f1f964510641b5ebd7f55b32a6f4e5189728c476cda77, an-install-carries-the-method@b31ab85c8b587b5d928878e4d175430aabd5a6ec1f600696b5604040cc0600a6
---

# Requirement: an-agent-skill-keeps-what-makes-it-work

_Ask, from Kai: "An Agent Skill is a portable unit. Everything that belongs
to the skill stays inside `skills/<name>/` and travels with it, including its
scripts, references, assets, fixtures, and skill-owned test cases. The
complete skill must continue to follow the pinned global Agent Skills
standard."_

## Goal

Someone who takes one Agent Skill out of KAAL wants the same complete,
working, standards-compliant skill wherever it lands; they will know it when
the source, the package and an assembled copy have the same owned tree, and
the skill can perform its required capabilities without borrowing an
implementation from the KAAL engine.

## What the runs said

- `find skills -type f` finds 80 files in seven skills. Three are skill-owned
  tests beside skill scripts: `analyse/scripts/count.test.mjs`,
  `manage/scripts/order.test.mjs`, and `retro-4ls/scripts/name.test.mjs`.
- `npm pack --dry-run --json --ignore-scripts` includes the skills and their
  scripts, references, fixtures and ledgers, but omits those three tests. The
  cause is the package's tree-wide `!**/*.test.mjs` exclusion.
- `kaal.config.json` runs those same three cases in the units wall under
  `skills/*/scripts/*.test.mjs`. The repository therefore treats them as
  owned by their skills when it verifies them and as repository-only tests
  when it packages them.
- `README.md` says both that everything a skill needs is inside its directory
  and that nothing in KAAL is required by a consumer. It also says `bin/` is
  never called by a skill. `skills/retro-4ls/SKILL.md` nevertheless requires
  the count printed by `kaal retros`, whose implementation exists only under
  `bin/`.
- `bin/lib/rules.mjs` mirrors global fields and shape, then adds KAAL's MIT,
  version, vendor, dash, reach and adversarial-fixture policies. Its findings
  name the rule but not whether the authority is the pinned global standard
  or KAAL's local policy.
- The pinned validator is installed and run over `skills/*/` in the CI
  `standard` job. That job does not run it over the packed skills or an
  assembled copy.

## Assumptions

- Ownership follows the portable unit: a regular file below
  `skills/<name>/` belongs to that skill. Its name, extension or purpose does
  not move it into a repository-wide category. A file outside that directory
  does not become skill-owned merely because it helps KAAL test, evaluate or
  release the skill.
- A skill's test case is part of the skill when it tests a script or other
  capability owned by that skill and sits inside its directory. Acceptance,
  contract, regression, release and other repository verification outside
  the skill remain the repository's working.
- "Byte for byte" applies to regular files and their relative paths. This
  requirement does not prescribe archive metadata, filesystem timestamps or
  permissions that the Agent Skills standard does not make part of a skill.
- The pinned global standard is the specification and reference-validator
  revision already named in `kaal.config.json`. This task does not move the
  pin or reinterpret the standard from memory.
- A KAAL command may be a convenient end-to-end entrance to a capability a
  skill owns. The portable skill remains the authority: the two entrances
  must produce the same observable answer on the same input.

## Constraints

- The ownership boundary is `skills/<name>/`. This task does not select a
  package layout, a copy mechanism, a shared-library mechanism or the final
  code seam inside that boundary.
- The complete skill includes its `SKILL.md` and every owned script,
  reference, asset, fixture, ledger and test case, including future owned
  file kinds not listed here.
- Repository working outside the skill does not travel with it:
  `requirements/`, `architecture/`, `tests/`, `retros/`, `deploy/` and
  `evals/` remain excluded. Their tests remain excluded even while a
  skill-owned test travels.
- Global compliance and KAAL policy are separate authorities. KAAL may add a
  stricter local rule, but an observable finding must identify it as local
  policy and must not attribute it to the global standard.
- No package redesign, script move, test move, engine change or skill edit is
  part of this requirement. The manager decides release scope after it
  exists.

## Acceptance criteria

1. `skills/<name>/` is the complete ownership and portability boundary for
   one skill: for every source skill, the packaged skill contains exactly the
   same regular-file paths below that boundary.
2. Every regular file owned by a skill remains below that skill's named
   directory when the skill travels; assembling one skill creates one such
   root and neither flattens an owned path nor writes an owned file beside it.
3. Every skill-owned script and every test case beside that skill's owned
   capability is present in the package and remains runnable there.
4. Installing the package and assembling a skill preserves every owned
   regular file at the same relative path with exactly the source bytes.
5. The portability boundary, not a repository directory name, decides what
   travels: owned files remain included even when nested paths are named
   `requirements`, `architecture`, `tests`, `retros`, `deploy` or `evals`,
   while files in those directories outside the skill do not enter its
   packaged or assembled tree.
6. A capability the skill's instructions require can be executed from the
   complete skill alone. If that capability is also present in KAAL's engine,
   the skill ledger names runnable skill-owned script evidence and its
   skill-owned passing test; engine-only evidence does not satisfy this
   criterion.
7. Where a KAAL end-to-end command exposes a skill-owned capability, running
   the command and running the capability from the skill on the same input
   produce the same observable answer and failure behaviour. The command is
   an entrance, not a second independently behaving implementation.
8. The reference validator at the commit pinned in `kaal.config.json` checks
   every complete source skill, every complete packaged skill and every
   complete assembled copy. Missing an owned file is a failure before any of
   those three copies can count as compliant.
9. A rule added by KAAL beyond the pinned global standard is reported as
   `local policy`; the same finding does not claim the global standard as its
   authority, and the pinned standard's own rules remain identified as
   global.
10. Packaging decides whether a test travels from ownership: every
    `*.test.mjs` below `skills/<name>/` travels, and every `*.test.mjs`
    outside a skill remains excluded. A blanket filename exclusion that
    removes both is a failure.

## Open questions

- Which owned capability should be the authoritative implementation when an
  existing engine command and a skill currently overlap? The drawing must
  identify each overlap before choosing the seam.
- Does the reference validator consume an unpacked package and assembled
  directory directly in CI, or does one repository-owned verification step
  enumerate all three copies for it? The criterion fixes the three subjects,
  not the orchestration.
- If two skills later need the same executable capability, is one skill the
  owner, is the capability generated into each complete tree, or does that
  justify a separately portable unit? This requirement fixes only that a
  skill cannot borrow it from the KAAL engine.

## Handoff

- Task: an-agent-skill-keeps-what-makes-it-work
- Criteria: 10; tests: 10 (equal)
- Red run: `node --test --test-timeout=60000 requirements/an-agent-skill-keeps-what-makes-it-work/acceptance.test.mjs`, all ten failing: criteria 1 to 5 and 10 on the skill-owned tests missing from the package, criterion 6 on the required retro count remaining at `nlp` with no skill script, criterion 7 on that capability having no executable skill entrance, criterion 8 on packaged skills not reaching the pinned validator, and criterion 9 on local and global findings naming no authority
- Seen red one at a time: each of the ten run alone as well as together, each on the reason above
- Stand-in green: all ten, on a disposable copy with ownership-aware packaging, a skill-owned retro-count capability and evidence, the same observable behind the KAAL entrance, three-copy validator lines, and authority-labelled findings; discarded in full
- Tests: `acceptance.test.mjs`, beside this file; the two bad inputs under
  `fixtures/`
- Open questions: 3, listed above
- Blocked on: nothing
- Unblocks: the architecture that can make a complete skill the unit of
  packaging, assembly, execution and validation
- Supersedes: `push-v1` and `an-install-carries-the-method`. `push-v1`
  criterion 5's statement that a script test may live either beside the
  script or in the repository's units tree and that its
  home is the test plan's decision. Ownership now decides: a test of a
  skill-owned capability lives and travels inside the skill. It also makes
  explicit what `push-v1`'s skill-and-scripts assumption and criterion 6 only
  implied: every file the scripted move needs, including its test, is in the
  portable unit. `push-v1`'s requirements for failure assertions and red
  evidence still stand. The permitting principle is the same one already
  stated there, that a scripted move must travel with its skill; and
  `an-install-carries-the-method` assumption "A test never
  ships", acceptance criterion 2's blanket "no file whose name ends
  `.test.mjs`", and its drawing's fixed tree-wide `!**/*.test.mjs` exclusion.
  Those clauses now apply only outside a skill. Its criteria excluding the
  league's own working still stand, as do its packaging, command and guest
  guarantees. It also supersedes the requirement and drawing's claim that a
  skill needs nothing from the tool wherever a required capability exists
  only in `bin/`: the claim becomes true only when the complete skill owns
  that capability. The permitting principle is that the skill is the
  independently portable method while repository history remains behind.
- People: none
