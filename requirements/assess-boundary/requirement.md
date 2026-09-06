# Requirement: assess-boundary

_Written in analyse mode. Ask: the dual-mode design proposal, which asks
KAAL to become two things, a system embedded in a repository that has
adopted it and a read-only assessor of repositories that have not. Its
core decision is that external review data belongs to the assessed party
or the caller and never to KAAL. This is task one of that ask, and it is
the boundary alone: no rules, no policy packs, no collectors, no report.
The boundary is taken first because it is the only part of the design
that cannot be retrofitted; every later task lands inside it._

## Goal

Kai wants KAAL to look at a repository it does not govern without
touching anything, and wants that inability to persist as the assessor
grows; he will know when `kaal assess` on a target prints what it
resolved and writes nothing, when the one file it may write goes only
where he names and never inside either repository, and when a wall on the
board refuses any future assess module that writes, executes, or reaches
the network.

## Assumptions

- An assessment with no rules in it is the honest first slice: what this
  task delivers is a target descriptor and a boundary, and a descriptor
  that carries no findings claims none.
- A target that is not a git repository is not a finding about that
  repository. The descriptor records that no revision could be resolved
  and why, and the command still succeeds; an unresolved revision is a
  limit on the reader, not a deficiency in the read.
- The descriptor carries no clock in this task. Two runs on the same
  target are then byte-identical, which is the reproducibility the ask's
  own acceptance criteria did not state; a timestamp arrives with the
  assessment record, and with it a fixed clock in tests.
- Provider targets (`github:owner/repo`) are out of scope: `kind` is
  `local` until a provider adapter exists, which the ask defers to its
  third milestone.
- The module that may write is named by convention, `output.mjs`, and the
  wall reads text and runs nothing, as the drawings wall does.
- "Reaches the shell or the network" is read as the skill rules already
  read it, so the tree keeps one vocabulary for one idea.

## Constraints

- External review output never lands in the league's tree; that is the
  ask's core decision and this task's reason to exist.
- The walls stay offline and deterministic (kaal.config.json's own
  contract): the boundary wall reads text, and `kaal assess` at this
  stage reads a directory and the refs git keeps in it, nothing more. It
  executes nothing, git included, which criterion 6 is what enforces.
- Existing commands keep their behaviour; `kaal assess` is new.
- No dependency beyond node; no dash; the tool keeps one entry per act.

## Acceptance criteria

1. `kaal assess <target>` with no output named prints one JSON document on
   stdout carrying `"schema": "kaal.target/v1"`, `target.kind` `local`,
   either a `target.resolved_sha` of forty hex characters or a
   `target.unresolved` naming why, and `access.target_write` and
   `access.provider_write` both `forbidden`; it exits 0, the target's
   files are unchanged byte for byte, and the directory it ran in gains
   nothing.
2. `kaal assess <target> --output <path>` writes exactly one file, at that
   path, whose bytes equal what the same command prints without
   `--output`; the output directory gains that file and no other, and the
   target's files are unchanged.
3. Two runs of `kaal assess <target>` on an unchanged target print
   byte-identical documents.
4. `kaal assess <target> --output <path inside the league's own tree>`
   exits 1 with a message on stderr naming the path, prints no document,
   and creates no file; the refusal happens before the target is read.
5. `kaal assess <target> --output <path inside the target>` exits 1 with a
   message on stderr naming the path, prints no document, and creates no
   file.
6. `kaal boundary` reads every `.mjs` file under `bin/lib/assess/` and
   refuses one that writes, executes, or reaches the network, naming the
   file and which of the three it did, except `output.mjs`, which may
   write and nothing else: it exits 0 on `fixtures/clean-assess` and 1 on
   `fixtures/second-writer`, naming `collect.mjs` as writing and
   `run.mjs` as reaching; and the gates list in `kaal.config.json` carries
   a wall that runs it.

## Open questions

- Should the writing module be declared in `kaal.config.json` rather than
  named by convention, the way the standard's pin and the gates are?
- Should `kaal assess` refuse a target with uncommitted changes, since the
  sha it records then does not describe what it read, or record the
  dirtiness in the descriptor and read on?
- Does the descriptor's shape belong in the tree as a schema file the test
  reads, or in the requirement as it is here?
- What should a provider target do before an adapter exists: refuse with a
  named reason, or resolve nothing and say so in the descriptor?
- Should the boundary wall also read the tests under the assess tree, or
  only the modules? (v1: the modules; a test that writes to a temp
  directory is not a breach of the boundary.)

## Handoff

- Task: assess-boundary
- Criteria: 6; tests: 6 (equal)
- Red run: `node --test --test-timeout=60000 requirements/assess-boundary/acceptance.test.mjs`;
  all six red, since neither command exists; seen green on a stand-in
  (a throwaway `assess` and `boundary` in the dispatcher), then discarded
- Tests: `acceptance.test.mjs`, beside this file; fixture roots
  `fixtures/plain`, `fixtures/clean-assess`, `fixtures/second-writer`
- Open questions: 5, listed above
- Status: closed
- Blocked on: nothing
- Supersedes: nothing
