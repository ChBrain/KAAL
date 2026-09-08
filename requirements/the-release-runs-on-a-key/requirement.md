# Requirement: the-release-runs-on-a-key

_Kai asked for this after the v0.0.1 cut: "we might want to have a Github
Action for release next time?" The cut was refused twice by machines that
should have been able to do it and finished by a person on a third. The
shape comes from the operate retro filed the same evening, whose second
Lacked says the skill asks for a deploy script whose tests would test a
wrapper. They would. What is worth testing about a release whose artefact is
a git ref is not the two commands; it is the refusals._

## Goal

Whoever holds the key wants to spend it by starting one run rather than by
holding a credential and typing two commands, and wants the run to refuse a
release the tree does not agree with; they will know it by a command that
answers whether this tree may be released as this version, by a workflow a
human starts that runs the board and that command before it tags anything,
and by the operate skill recognising a dispatch as a key.

## What the runs said

- `package.json` names `0.0.1` and `deploy/releases/0.0.1.md` exists. Those
  are the two facts a release of `0.0.1` rests on and nothing checks that
  they agree.
- The v0.0.1 record says the deploy was `git tag` and `git push`, and that
  it wrote no deploy script because "a script would be a wrapper around one
  command that has never shipped anything, and its tests would test the
  wrapper". The operate retro repeats it as a Lacked: the skill "does not
  recognise that case".
- This session's credential can write branch refs to this repository and not
  tag refs; a plain `git push origin v0.0.1` reported an unexpected
  disconnect and the refspec form reported HTTP 403. The agent proxy logged
  no relay failure, so the refusal is the remote's.
- The second machine that tried also failed, on a different thing: the board
  was red under a runtime that prints a different test format, which
  `a-wall-reads-one-format` then fixed. Two machines, two refusals, one
  human finishing by hand.
- `bin/lib/applies.mjs` guards nine commands and a unit test asserts the
  nine by name, so a tenth is red in that unit rather than quietly
  unguarded.
- `.github/workflows/` holds three workflows, none of which writes anything:
  every one declares `permissions: contents: read`.

## Assumptions

- The key stays the human's and this changes only how it is spent. A
  dispatch a person starts, naming the version, is an explicit go for that
  version from the person who holds deploy authority, which is what the
  skill already asks for. Nothing here lets a merge or a schedule release
  anything.
- The command refuses and does not release. It answers whether the tree
  agrees with a version; the tag is still made by the workflow, from the
  commit the run was started on, and the workflow is what holds the token.
- The two facts worth checking are the version and the plan. The version,
  because a release named for a version the tree does not carry is a
  mislabelled artefact; the plan, because the skill says a release plan
  written after the release is a report, and a missing record means there
  was no plan.
- The board is run by the workflow rather than trusted from a green merge.
  The v0.0.1 cut was refused by a red board on a runtime CI did not pin,
  which is exactly the case a merge's green would have hidden.
- The workflow's own behaviour cannot be proven here. Its criteria are read
  from its text, and the first evidence is a dispatch. That is why the
  refusals are a command with tests rather than conditions in the file.

## Constraints

- The exit vocabulary holds: 0 an answer, 1 findings, 2 the question is not
  this tree's.
- The workflow declares the narrowest permission that lets it tag, and
  nothing wider. The other three workflows read and this one writes.
- Nothing in this task creates a tag, a release or a version. It is the
  path a future release takes, not a release.
- No wall is added. The command answers when it is asked; a board that ran
  it on every push would refuse every tree whose version has no record yet,
  which is every tree between releases.
- The skill's rules apply to its own text: MIT, the standard's shape, no
  vendor or product named, no en-dash or em-dash, under five hundred lines.

## Acceptance criteria

1. `kaal release <version>`, run in a tree whose `package.json` carries
   that version and which holds `deploy/releases/<version>.md`, exits 0 and
   prints an answer naming the version and the record it found. It takes no
   root: its argument is a version, never a path, and it is asked about the
   working directory the way `runner` is.
2. On a tree whose `package.json` carries a different version, it exits 1
   with a finding naming both the version asked for and the version the
   tree carries.
3. On a tree with no `deploy/releases/<version>.md`, it exits 1 with a
   finding naming the path it looked for.
4. `SURFACE.md` carries a `release` entry naming what the command answers
   and its three exit codes, and run in a tree with no `package.json` it
   answers 2.
5. `.github/workflows/release.yml` runs only on `workflow_dispatch`, takes
   the version as an input, declares `contents: write` and no wider
   permission, and runs both the board and `kaal release` before any step
   that creates a tag.
6. The operate skill says a dispatch a human starts is a key when the
   release record names the person, the version and the target, and says
   that where the artefact is a ref the deploy tests are the refusals
   rather than a wrapper around the commands.

## Open questions

- Should the command also refuse a version whose record has an unrun smoke?
  The operate retro asks what to do with a plan whose smoke cannot run, and
  a record is a plan until its smoke is green, which is a distinction no
  file format carries today.
- Should the workflow refuse a dispatch from a ref that is not the default
  branch? Releasing from a branch is a real want and releasing from a
  branch by accident is a real hazard.
- Who writes the release record, and when? The skill says before the run,
  and the workflow refuses without one, so the record must be merged before
  the dispatch. Nothing says whether that is one pull request or two.
- Should the run's own record be written back into the tree? The record
  names the person, the version and the target, and a dispatch knows all
  three, so a run could append what it did rather than a person recording
  it afterwards.
- Nothing here proves the workflow. Its first evidence is a dispatch a
  human starts, and the version after this one is the first that could
  provide it.

## Handoff

- Task: the-release-runs-on-a-key
- Criteria: 6; tests: 6 (equal)
- Red run: `node --test --test-timeout=60000 requirements/the-release-runs-on-a-key/acceptance.test.mjs`
- Tests: `acceptance.test.mjs`, beside this file; the command is driven on
  fixture trees beside it, and the workflow and the skill are read as text
- Green before the build: none expected
- Open questions: 5, listed above
- Status: open
- Blocked on: nothing
- Unblocks: the next release, which is the first thing that can prove the
  workflow
- Supersedes: nothing. The `operate` skill gains a case it did not have;
  its rule that a deploy script has unit tests stands, and criterion 6 says
  what those tests are when the artefact is a ref
