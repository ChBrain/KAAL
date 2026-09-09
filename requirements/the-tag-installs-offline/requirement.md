---
traces:
  supersedes: the-engine-is-installable@95ec4bb3baeac9088a41a22496e6d07b07bd123a25ec88427ce28ee4169b5397
---

# Requirement: the-tag-installs-offline

_Written in analyse mode. Ask, from Kai: "right now I work KAAL towards a
npm package approach", and then, on how a consumer takes the engine, the
lean toward "improve KAAL into a package, make it a dependency for SIGNAL and
run from there". The first consumer tried it on 7 September: a packed
tarball installs and every command answers from `node_modules`, and an
install from a git URL dies with no registry in reach. The drawing of
`the-engine-is-installable` chose to keep `prepare` and called the git
install "the online path". That was accurate and it is no longer enough:
the online path is the only path, and a consumer who needs the offline one
has arrived, which is the condition that decision named for its own
reopening._

## Goal

A consumer who names a version of this tool in its own manifest wants the
install to succeed from that name alone, so that the engine is never copied
and never bound to a sibling checkout; they will know when an install from a
git URL into an empty project, with no registry in reach, leaves the `kaal`
command answering, and when a contributor's fresh clone still gets the
pre-push hook it has always had.

## Assumptions

- A tag is a commit, and a bare clone of this tree at `HEAD` is the same
  commit without the network. The tests install from that clone by a
  `git+file:` URL, which npm treats exactly as it treats a tag on a host:
  it clones, it prepares, it packs.
- "No registry in reach" is measured, not declared: an empty cache and a
  registry address on a port nobody listens on. Whatever the install needs
  beyond the clone itself fails there. This is why the tests can be
  deterministic about a thing that is usually a network's mood.
- The contributor's clone keeps one step that wires the hook, named on the
  board in `AGENTS.md` as it has been since `push-v1` ("once per clone;
  wires the pre-push hook"). Which command that step is, is the
  architect's: the tests read it off the board rather than fixing it. Two
  runs on 7 September bound the choice, and a third confirmed it: npm
  installs a package's dev dependencies in the clone before it packs a git
  dependency whenever the manifest carries any install-lifecycle script,
  `prepare` and `postinstall` alike (a stand-in with `postinstall` alone
  died reaching for the formatter). The install then dies fetching the
  formatter and never reaches `prepare` at all, which the run below names
  by line. So an offline git install and an install-lifecycle script cannot
  both be true, and the wiring has to be a step of its own.
- The version stays where it is. This task changes no command, no promise
  on `SURFACE.md`, and no place of the version; `kaal class` will say
  nothing a consumer notices moved.

## Constraints

- Offline and deterministic, like every other wall; the tests clone
  locally, install locally and reach no registry.
- `bin/` is not touched. A fix that changes a command to make an install
  work has changed the wrong thing.
- The tarball path stays as `the-engine-is-installable` fixed it: its four
  tests stay green.
- No en-dash or em-dash.

## Acceptance criteria

1. `npm install <git URL of this repository>` into an empty project, with an
   empty cache and no registry in reach, exits 0 and leaves an executable
   named `kaal` under `node_modules/.bin` that prints the usage line on
   exit 1 when given nothing it knows.
2. That install adds exactly one package, and what it installed holds
   `bin/` and nothing under `requirements/`, `architecture/`, `retros/`,
   `evals/`, `skills/` or `tests/`.
3. The board in `AGENTS.md` names exactly one step that wires the pre-push
   hook, and a fresh clone of this repository, after that step with no
   registry in reach, has `core.hooksPath` set to `.githooks`.

## Open questions

- Is `v0.0.1` cut now, on the commit that closes this task, so that the
  first consumer names a tag and not a commit? The drawing of
  `the-engine-is-installable` left the version and the tag unheld until the
  first release; this is the first release's occasion.
- Should the `ci` workflow carry a consumer job, an empty project that
  installs the tool from the pull request's own commit, so the install is
  proven on every push and not once in a test that reads a clone?
- The first consumer would pin a commit until the tag exists. Is a commit
  an acceptable name for a version, or does the dependency wait for the tag?
- The build of this task will move the board's line in `AGENTS.md` if the
  wiring becomes a step of its own. `AGENTS.md` is the governance lane;
  does that line ride with the requirement's pull request, or is it a
  second one?

## Handoff

- Task: the-tag-installs-offline
- Criteria: 3; tests: 3 (equal)
- Red run: `node --test --test-timeout=120000 requirements/the-tag-installs-offline/acceptance.test.mjs`,
  7 September 2026: tests 1 and 2 red on the same first cause, run twice
  and read. npm reports `git dep preparation failed` and runs a dev install
  in the clone (`--include=dev`, because an install-lifecycle script is
  there), which dies at the dead registry on
  `FetchError: request to http://127.0.0.1:1/prettier/-/prettier-3.9.6.tgz
failed, reason: connect ECONNREFUSED`. It never reaches `prepare`. With a
  registry in reach the same install exits 0 and the tool answers, so the
  defect is the offline path alone and not the git path. Test 3 green
  before the build, a guard on the contributor's hook that must not change,
  which is why it is here. Green on a stand-in in scratch, 3 passing,
  discarded.
- Tests: `acceptance.test.mjs`, beside this file; it clones this tree into
  a temporary directory and installs there, and touches this tree not at
  all
- Open questions: 4, listed above
- Status: closed
- Blocked on: nothing
- Supersedes: `the-engine-is-installable`, one claim of its drawing's third
  decision: not that it was wrong, but that its price is now due. It read
  the mechanism correctly, that npm installs the dev dependency because an
  install-lifecycle script exists, and it priced the trade as a
  contributor's hook against a consumer who did not exist yet. Runs on
  7 September confirm the mechanism and find no error beyond it: with a
  registry in reach the git install succeeds. What moves is the price. The
  decision named its own reopen condition, a consumer needing an offline
  git install, and the first consumer is it. The decision's other half,
  that a contributor's `npm install` wires the hook, does not survive, and
  criterion 3 keeps what can be kept of it: one named step, on the board.
  And `gates-v1`, its third seam, "install to hook": that the step which
  wires a fresh clone's hook is `prepare` and runs at install time. The
  seam itself survives whole, a fresh clone gets its hook from a step this
  tree offers, and only the step's name and its moment move. This second
  supersede was missed when the requirement was first written and is
  declared here because the build found the contract red.
- People: none
