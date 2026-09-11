---
traces:
  supersedes: nothing
---

# Requirement: the-engine-is-installable

_Written in analyse mode. Ask, from Kai: "we need SemVer for kaal, we need a
clean path forward, and a package concept", then "we start with 0.0.x, you do
not touch minor or major", then "go for it, but also skill version 0.0.1,
each skill moves on its own, a set might make sense on top using
dependencies". That is three tasks. `the-surface-is-written-down` wrote the
page. This one gives the tool a version and makes it something another tree
can install. The skills carrying their own versions is the third, and the set
on top is not a task yet._

## Goal

Whoever wants to run this tool in a tree that is not this one wants to
install it rather than copy it, so that the tree names which version of the
engine it runs; they will know when a packed tool installed into an empty
project answers on the command line, and when what it carries is the tool and
nothing of the league's own working.

## Assumptions

- The version starts at `0.0.1` and only its patch place moves. That is
  Kai's rule, and this task is the first place the rule has anything to
  apply to: `npm pack` refuses this repository today with "Invalid package,
  must have name and version", so there is no version for anything to read.
- `a-change-declares-its-class` reads that version. It is drawn and not yet
  built, and its wall compares a version to a base's. A wall that reads a
  field nothing writes has nothing to say, so this task lands first.
- No registry. The tool is installed from its git tag
  (`npm i github:ChBrain/KAAL#v0.0.1`), so `private` stays and nothing is
  published. Installing from a tarball or a git URL works with `private`
  set; only `npm publish` is refused by it, which is the point.
- The tool is `bin/` and nothing else. `bin/kaal.mjs` resolves one path
  inside its own package, the league root it refuses to write into, and it
  reads the consumer's tree for everything else. Requirements, drawings,
  retros, evals and fixtures are the league's working and no consumer needs
  them.
- The skills are not in this package. Kai has said each skill carries its
  own version and moves on its own, which makes them their own artefact and
  not cargo in the tool's tarball. A skill is text an agent reads, and the
  tool never reads one.
- The tool carries no runtime dependency and this task adds none. That is
  what makes it installable offline, and the walls have been deterministic
  and offline since `fixed-ground`.
- `npm` puts the licence and the readme in every tarball whatever the
  manifest says. That is not the league's working leaking out; an MIT tool
  that ships without its licence is the worse outcome, so the criterion
  names them rather than fighting them. A stand-in run found this.

## Constraints

- Offline and deterministic, like every other wall: the proof packs and
  installs locally and reaches no registry.
- The version's minor and major places stay zero. This task may not raise
  them and neither may any later one; only Kai does.
- No command changes behaviour, and `bin/` is not touched. This task
  changes the manifest and adds a proof.

## Acceptance criteria

1. `package.json` declares a `version`, and its minor and its major place
   are both zero.
2. What the tool ships is the tool and the method it carries: `npm pack
--dry-run` lists files under `bin/`, `skills/` and `agents/`, the manifest,
   and the licence and readme npm carries whatever a package says, and nothing
   else; in particular nothing under `requirements/`, `architecture/`,
   `retros/`, `evals/`, `tests/`, `plan/` or `deploy/`, and no test. Amended
   by `an-install-carries-the-method`: the skills were listed here as the
   league's own working, and they are the method a consumer installs this for.
   What this criterion protects is unchanged, which is that a consumer's tree
   does not gain another repository's history.
3. The packed tool installed into an empty project, offline, leaves an
   executable named `kaal` that prints the usage line on exit 1 when it is
   given nothing it knows.
4. The install brings nothing with it: the manifest declares no
   `dependencies`, and the install of criterion 3 adds exactly one package.

## Open questions

- Does the tool eventually take a name on a registry, or is the git tag the
  distribution forever? A registry name is a decision that cannot be undone
  quietly, which is why this task does not take it.
- `npm` runs `prepare` when a package is installed from a git URL, and this
  repository's `prepare` wires its own pre-push hook. It runs in a throwaway
  clone and sets a config nobody reads, but it also makes npm install the
  dev dependency first, which the offline path cannot do. Should `prepare`
  be guarded so the git install stays offline?
- Should the tool ship a `kaal.config.json` a consumer can copy, or is an
  empty root that has adopted nothing the right starting point?
- The version and the tag have to agree. Nothing checks that yet, and the
  first release is where it will be noticed.

## Handoff

- Task: the-engine-is-installable
- Criteria: 4; tests: 4 (equal)
- Red run: `node --test --test-timeout=60000 requirements/the-engine-is-installable/acceptance.test.mjs`
- Tests: `acceptance.test.mjs`, beside this file; it packs into a temporary
  directory and installs there, and touches this tree not at all
- Open questions: 4, listed above; the second is answered in the drawing,
  by npm's behaviour rather than by a preference
- Blocked on: nothing
- Supersedes: nothing
- People: none
