---
traces:
  supersedes: `security-v1`
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
2. What the package carries is unchanged: `npm pack --dry-run` lists
   `bin/`, the licence, the readme and the manifest, and nothing under
   `requirements/`, `architecture/`, `retros/`, `evals/`, `skills/` or
   `tests/`.
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

- Public or restricted? The repository is public and MIT, and twelve of the
  asker's thirteen packages are restricted. A restricted package on a
  public repository asks every consumer and every consumer's CI for a token
  to install something whose source they can already read. Kai decides, and
  criterion 6 records the answer rather than assuming it.
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
- Open questions: 4, listed above
- Status: open
- Blocked on: nothing to build. The first publish and the visibility that
  follows it are Kai's, and criterion 6 only requires the record to have a
  place for them
- Unblocks: a consumer installing by name, which is every consumer that has
  a registry
- Supersedes: two, both in `security-v1` and `operate`. `security-v1`'s
  second criterion, amended four hours ago in `the-release-runs-on-a-key`
  to require a reason on `contents: write`, is widened here to any write:
  that amendment narrowed the claim to the write it had in front of it, and
  this task brings `packages: write`, which would owe no reason under it.
  The principle is the same one that permitted the first move, that a
  consumer answers what a workflow may touch by reading its block. And the
  `operate` skill's rule that the refusals are the tests keeps its case and
  gains its complement: it is true where the artefact is a ref, and this
  task makes an artefact that is not
- People: none
