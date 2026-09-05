# Requirement: public-v1

_Written in analyse mode. Ask, verbatim: "I moved KAAL public, so we can
(and should) use the capabilities. khai and most of my other repos use
those." Read as: the repository capabilities khai wires in its tree, now
that a public repository gets them without a plan: dependency updates, code
scanning, a second CI platform, owners, and the one contract file every
runtime reads. What only a repository setting can do (required checks,
secret scanning, push protection) is named for the human and not built._

## Goal

Kai wants KAAL to use what a public repository gets for free the way khai
does, so that dependencies update themselves, the code is scanned, the
walls are proven on the platform where the last defect was found, and any
runtime that opens the tree reads one contract; he will know when the
`.github` tree carries the same capabilities as khai's, the `ci` workflow
runs the walls on Windows as well, and `AGENTS.md` says how to read the
board.

## Assumptions

- The capabilities are the ones khai's tree carries and a public
  repository runs at no cost: Dependabot for actions and npm, CodeQL,
  Actions minutes for a second platform, `CODEOWNERS`, `FUNDING.yml`; the
  release pipeline, the audit lane and the house-drift job are khai's own
  and not asked for.
- The required check stays named `walls`; a second platform runs as a job
  of its own, so the setting Kai made survives.
- `AGENTS.md` is the contract, vendor agnostic, and the vendor files
  (`CLAUDE.md`, `.github/copilot-instructions.md`) only point at it, as
  khai does; the vendor rule is a skill rule and does not reach the root.
- What the tree cannot set is a setting: making `walls` required, secret
  scanning, push protection, and code review by a bot are Kai's to switch
  on and are listed in the handoff.

## Constraints

- The walls do not change; every job runs the one command `npm test`.
- Actions are pinned to a major version, the same majors khai pins.
- No dash; no dependency beyond node.

## Acceptance criteria

1. `.github/dependabot.yml` updates `github-actions` and `npm`, weekly,
   each with an open pull requests limit.
2. `.github/CODEOWNERS` names an owner for `*`, for `/.github/workflows/`
   and for `/bin/`.
3. `.github/workflows/codeql.yml` analyses `javascript-typescript` on pull
   requests, pushes to main and a schedule, with `security-events: write`.
4. The `ci` workflow keeps a job named `walls` on `ubuntu-latest` and adds a
   job on `windows-latest`; both run `npm test` and nothing else as their
   test step; every `uses:` in every workflow pins a major version of `v7`
   or higher for `actions/checkout`, `actions/setup-node` and
   `actions/github-script`.
5. `AGENTS.md` exists at the root and says: the one command, that a `FAIL`
   line carries its fix, that a red board on a change is the change's
   because main is green, that the way past a red wall is a waiver and
   never `--no-verify`, and that one pull request is one lane; `CLAUDE.md`
   and `.github/copilot-instructions.md` exist, point at `AGENTS.md`, and
   are each under 30 lines.
6. `.github/FUNDING.yml` names the sponsors account khai names.

## Open questions

- Should the Windows job become required too, once it has been green for
  a while? (A setting; v1 leaves it advisory by not naming it.)
- Issue templates and a discussions link, as khai has: wanted, or noise
  for a tool repository?

## Handoff

- Task: public-v1
- Criteria: 6; tests: 6 (equal)
- Red run: `node --test --test-timeout=60000 requirements/public-v1/acceptance.test.mjs`;
  all six red; no stand-in, the build's green is the proof
- Tests: `acceptance.test.mjs`, beside this file; surface only: files under
  `.github/` and the root
- Open questions: 2, listed above
- Blocked on: the settings, Kai's: make `walls` required (rulesets), turn
  on secret scanning and push protection, Dependabot alerts and security
  updates, and code review by a bot if wanted; CodeQL's default setup must
  stay off, since the workflow is the advanced setup
- Supersedes: nothing
- Status: closed
