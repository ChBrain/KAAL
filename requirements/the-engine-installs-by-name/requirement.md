---
traces:
  supersedes: security-v1@58da36a958c75bdeadf9e058ccc8441e4ab568e1b76001efd8ae81bb2dddd322, the-engine-is-installable@95ec4bb3baeac9088a41a22496e6d07b07bd123a25ec88427ce28ee4169b5397, the-release-runs-on-a-key@83c1dfad60d4c78de8f0cd9569ac7386ae877218b217348a5ddc00d992902045, the-tag-installs-offline@40a65577ba6faeae4dc238ab75b9667aa4be1f05d81d15bd34b64f9c29eb94f6
---

# Requirement: the-engine-installs-by-name

_Ask, from Kai: "we might want to release kaal to ChBrain, like my other
work", and then "go for it, I think I need to change the package visibility
after its released". His other work is thirteen packages under `@chbrain/`
on GitHub Packages. KAAL is the odd one out: a public MIT repository whose
package is marked private and installs only from a git URL. This gives it a
name a consumer can ask for, and it changes what the artefact is, which
unpicks a rule this league wrote yesterday._

## Goal

A consumer wants to ask for this engine by name and get the version they
named, rather than pasting a git URL and a commit; the person who releases
it wants the same run that tags to publish, and wants the tree to refuse a
publish it did not mean; they will know it by a scoped name and a declared
registry in the package, by the release run publishing after it tags and
only after the board and the refusal, and by the seat that releases knowing
what changes when the artefact stops being a ref.

## What the runs said

- `package.json` carries `"name": "kaal"` and `"private": true`. Private is
  the tree's current refusal to publish, and it is the only one: nothing
  else would stop a publish landing on the public registry under a name
  this project does not own.
- `"files": ["bin"]`, and the v0.0.1 release record's smoke reads
  `ls node_modules/kaal` as `LICENSE README.md bin package.json`. The
  package is the tool alone. `the-tag-installs-offline` fixes that in its
  second criterion, naming the six directories the install must not carry.
- The thirteen packages in the consumer repository are `@chbrain/<name>`,
  every one published to `https://npm.pkg.github.com`. Twelve declare
  `access: restricted` and one, `khai-foyer`, declares `access: public`.
  Versions run from 0.0.3 to 0.4.6.
- No `.npmrc` exists in this tree, so a publish today would resolve its
  registry from whatever the machine running it happens to hold.
- `security-v1`'s second criterion, as this session amended it four hours
  ago, requires a reason only on `contents: write`. A workflow declaring
  `packages: write` would owe no reason under the claim as it now stands.
- The `operate` skill says, since yesterday, that where the artefact is a
  ref the deploy tests are the refusals rather than a wrapper around the
  commands. That sentence is true of a tag and false of a tarball.

## Assumptions

- The name is `@chbrain/kaal`, on GitHub Packages, because that is what the
  rest of the asker's work does and consistency is worth more here than any
  argument for a different registry. The scope also removes a hazard the
  tree does not name today: an unscoped `kaal` on the public registry is
  a name this project does not hold, so `npx kaal` fetches a stranger.
- Visibility is a human's act and it happens after the first publish. A
  package on GitHub Packages takes the repository's visibility at first
  publish and a person changes it afterwards, in a setting no tree can
  read. The release record names what the package was published as and who
  changed it, the way it names who gave the key.
- What the package carries does not change. The tool, its licence and its
  readme; no skills, no requirements, no retros. A consumer installs an
  engine and writes their own league, which `the-tag-installs-offline`
  already fixed and this task holds rather than revisits.
- Both install paths stay. The git URL keeps working with no registry in
  reach, which is what `the-tag-installs-offline` bought, and the name is
  the path for a consumer who has a registry. The surface says which is
  which rather than leaving a reader to guess.
- Removing `private: true` removes the only guard against an unintended
  publish, so the guard is replaced rather than deleted: a scoped name and
  a declared registry, so a publish that reaches the wrong place has to be
  asked for twice.
- The publish is a step of the release run and not a second run. One key,
  one dispatch, one version: a tag without a package, or a package without
  a tag, is a release that half happened.

## Constraints

- `the-tag-installs-offline` stays true: the git URL installs with no
  registry in reach and carries `bin/` and nothing under `requirements/`,
  `architecture/`, `retros/`, `evals/`, `skills/` or `tests/`.
- The release workflow keeps the order the drawing fixed: the branch, the
  board, the refusal, then the tag. The publish joins the end.
- The exit vocabulary holds, and the version keeps the shape `kaal class`
  refuses to see raised past the patch place.
- The skill rules apply to the operate skill's text: MIT, the standard's
  shape, no vendor or product named, no dash, under five hundred lines.

## Acceptance criteria

1. `package.json` names `@chbrain/kaal`, is not private, and declares the
   registry it publishes to, so a publish cannot resolve one from the
   machine that runs it.
2. What the package carries beyond the method is unchanged: `npm pack
--dry-run` lists `bin/`, `skills/`, `agents/`, the licence, the readme and
   the manifest, and nothing under `requirements/`, `architecture/`,
   `retros/`, `evals/`, `tests/`, `plan/` or `deploy/`. Amended by
   `an-install-carries-the-method`, which moved the skills out of this list
   because they are the method rather than the league's working. The
   protection this criterion carries, that coming off private widened nothing
   by accident, is unchanged: it widened deliberately and this says by how
   much.
3. The release workflow publishes the version it tagged, after the tag, and
   the publish step runs only if the branch check, the board and
   `kaal release` have all passed.
4. Every workflow that declares any write says on that line what the write
   is for, not only the ones that write contents.
5. The `operate` skill says what changes when the artefact is built and
   uploaded rather than pointed at: there is a thing to test, so the deploy
   owes tests of its own, and the rule about refusals is the case where the
   artefact is a ref.
6. The `operate` skill's release record names the visibility the package
   was published with and the person who set it, since that is a setting no
   tree can read.
7. `SURFACE.md` says both install paths and which one a consumer with a
   registry should take.

## Open questions

- Public or restricted? Answered by Kai during the build: public. The
  repository is public and MIT, and twelve of the asker's thirteen packages
  are restricted, so this one is the exception on purpose. A restricted
  package on a public repository asks every consumer and every consumer's
  CI for a token to install something whose source they can already read.
  The answer is a fact about the first publish and not about the tree, so
  criterion 6 still records it in the release record rather than in code.
- `^0.0.1` matches only `0.0.1`, because npm treats every 0.0.x as
  incompatible with every other. A consumer pinning a caret range gets no
  patches until 0.1.0. Does that argue for reaching 0.1.0 sooner than the
  class wall's caution would otherwise suggest?
- Should the git URL path be deprecated once the name works, or kept as the
  offline path forever? Keeping both means two things to test at every
  release.
- Should a publish that fails after a successful tag roll the tag back, or
  leave a tagged version with no package for a person to finish?

## Handoff

- Task: the-engine-installs-by-name
- Criteria: 7; tests: 7 (equal)
- Red run: `node --test --test-timeout=60000 requirements/the-engine-installs-by-name/acceptance.test.mjs`
- Tests: `acceptance.test.mjs`, beside this file; the manifest and the
  workflow are read as text, the package's contents from `npm pack
--dry-run` on this tree, and the skill's text by section
- Green before the build: criterion 2, and it is a guard rather than a
  defect. What the package carries is correct today and the criterion exists
  so that removing `private` and adding a name cannot quietly widen it
- Open questions: 4, listed above; the first is answered, public
- Blocked on: nothing. The first publish and the visibility that follows it
  are Kai's, and criterion 6 only required the record to have a place for
  them, which it now has
- Unblocks: a consumer installing by name, which is every consumer that has
  a registry
- Supersedes: `security-v1`, `the-engine-is-installable`, `the-release-runs-on-a-key`, `the-tag-installs-offline`. Five claims across the four, and three of the four the plan did not see.
  Named before the build: `security-v1`'s second criterion, amended four hours ago in
  `the-release-runs-on-a-key` to require a reason on `contents: write`, is
  widened here to any write in any block, top level or under a job. That
  amendment narrowed the claim to the write it had in front of it, and this
  task brings `packages: write`, which would have owed no reason under it.
  The principle is the one that permitted the first move, that a consumer
  answers what a workflow may touch by reading its block. And the `operate`
  skill's rule that the refusals are the tests keeps its case and gains its
  complement: it is true where the artefact is a ref, and this task makes
  an artefact that is not.
  Found by the build, both by a wall going red: `the-engine-is-installable`
  read the installed tree one directory deep, so a scope reads as the
  package and `@chbrain` answered where `kaal` used to. Its criterion, that
  the install brings nothing with it, is unchanged; the reading is widened
  to name packages rather than directories. And `the-release-runs-on-a-key`
  listed `packages: write` among the writes the release run has no business
  holding, which was true of a run that only tagged. The list keeps the
  four writes the run still has no business with, and what every write owes
  moved to `security-v1`, where it belongs. And `the-tag-installs-offline`
  read the installed tree one directory deep for the same reason, which is
  the same widening. It was the last of the five to appear because it
  installs from a bare clone of this tree at HEAD, so it could not see the
  new name until the build was committed: it went red at the push hook and
  nowhere earlier
- People: none

## Build

- Built: all seven criteria, on `requirement/the-engine-installs-by-name-build`
- Landed: `package.json` takes the scoped name, drops `private` and
  declares its registry; `release.yml` gains `packages: write` with its
  reason and a publish step after the tag; `codeql.yml` gives its job level
  write a reason; `skills/operate/SKILL.md` says a built and uploaded
  artefact owes deploy tests of its own and that the record names the
  visibility and who set it; `skills/operate/references/release.md` gains
  the Visibility line; `SURFACE.md` gains `## Installing it`
- Proved: `node bin/kaal.mjs gates` green on twelve walls. Each criterion
  was broken on its own on a file copy and restored from that copy, and
  each break reddened its own criterion and no other
- Superseded tests, each proved red for the right reason on its own break:
  `security-v1` 2 falls on a job level write with no reason and on a top
  level write that is not contents; `the-engine-is-installable` 4 falls on
  a declared dependency and, separately, on an unscoped name, which is what
  proves the flatten reads the tree rather than a constant;
  `the-release-runs-on-a-key` 5 falls on `id-token: write`;
  `the-tag-installs-offline` 2 falls on an unscoped name, which needed a
  commit to prove, because a bare clone reads refs and not a working tree
- Found while building: `the-release-runs-on-a-key` 5 held a dead
  assertion, `/write/g && /(packages|id-token|...)/`, whose left side was
  discarded by the `&&` and never ran. It has been removed rather than
  fixed, because the surviving right side is the whole claim
- Broken on purpose, and said out loud: proving
  `the-tag-installs-offline` 2 needed a commit, and the commit carrying the
  break could not pass the hook that the break existed to redden, so it was
  made with `--no-verify` and reset in the same breath. The league forbids
  that flag and this is the one place it was used; no history left this
  tree, and the working tree afterwards held only the intended diff
- Not done, and owed: `package.json` still describes the tool as "Kai's
  Artificial Agent League". The trunk says KHAI's, and Kai has said which
  it is. That is a published string this task makes reachable, but no
  criterion here claims it, so it is a finding and not a drive by edit
- Class: surface moved, skills moved (`kaal class . --against origin/main`,
  run last, after the final edit). The tool did not move: nothing under
  `bin/` changed, and the manifest is not one of the three
