# Requirement: gates-v1

_Written in analyse mode. The second of the two tasks counted out of the ask
"analyse for push, also hooks, CI": the hook and the CI that run the league's
walls, so a script has somewhere to gate. `push-v1` is the first._

## Goal

Kai wants every wall the league has to run before a push leaves a machine
and again on every pull request, under one command, so a push that skipped
the hook is not done and local green is not mistaken for CI green; he will
know when the same command is named in the hook and in the workflow, the
workflow is the required check, and the runner says what it does not run.

## Assumptions

- The walls are declared as data: a `gates` list in `kaal.config.json`,
  each with a `name`, a `command`, and a `fix` hint. One runner, `node
bin/kaal.mjs gates`, reads the list, runs every wall under one exit code,
  prints one line per wall and a summary with measured counts to paste into
  a pull request, and never types a number a run did not make. `npm test` is
  that runner and nothing else, so the hook and the workflow call one
  command and never list walls themselves. This is khai's gates runner,
  learned, not linked.
- The walls today are the acceptance tests of every requirement under
  `requirements/`, the script tests under `tests/`, and the format check.
- The pre-push hook is the repository's own script under `.githooks/`, wired
  by `git config core.hooksPath`, so a consumer with no package manager hook
  tool still gets it.
- The CI runs on pull requests and on pushes to `main`, on the node version
  the scripts are written for.
- What the runner cannot run, the model evals, is declared in the runner's
  own file, not in prose elsewhere.

## Constraints

- The hook and the workflow run the same command, character for character
  (from the goal: local green must mean the same as CI green).
- Never `--no-verify` as a documented path; a push that skips the hook is
  rejected by the required check (from khai's contract, adopted).
- No dependency beyond node for running the walls; a formatter is a dev
  dependency and nothing else is.
- No en-dash or em-dash; MIT.

## Acceptance criteria

1. `kaal.config.json` declares at least two walls in its `gates` list, each
   with a `name` and a `command`; `node bin/kaal.mjs gates` exits 0 on the
   league's own tree and prints every wall's name; `package.json` has a
   `test` script that is exactly that runner.
2. A pre-push hook exists under `.githooks/pre-push`, is executable, runs
   `npm test`, and exits non-zero when `npm test` does.
3. A workflow under `.github/workflows/` runs on `pull_request` and on `push`
   to `main`, and has a step whose run line is exactly `npm test`.
4. The workflow file declares, in a line beginning `# not run:`, the walls it
   does not run.
5. The commands in the `gates` list, between them, reach every
   `acceptance.test.mjs` under `requirements/`, every `*.test.mjs` under
   `tests/`, and every test beside a script in a skill's `scripts/`.

## Open questions

- Is the workflow's job the required check on `main` from day one, or after
  the first green run?
- Does the format check gate (a wall) or advise, given no formatter is a
  runtime dependency?
- Are lanes (one pull request, one seat) part of this task through a guard
  tool, or their own task once there are seats to declare them?

## Handoff

- Task: gates-v1
- Criteria: 5; tests: 5 (equal)
- Red run: `node --test requirements/gates-v1/acceptance.test.mjs`, all five
  failing, no package, hook or workflow exists; green on a stand-in in
  scratch
- Tests: `acceptance.test.mjs`, beside this file
- Open questions: 3, listed above
- Status: closed
