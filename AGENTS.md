# AGENTS.md: the contract for any runtime

KAAL is Kai's Artificial Agent League: skills that build software, agents
that hold them, and walls that gate every change. `README.md` is the door
and `DESIGN.md` says why. This file says how to work in the tree, and it is
vendor agnostic; the vendor files point here and add nothing.

## The board

```
npm install   # once per clone; the formatter and nothing else
npm run hooks # once per clone; wires the pre-push hook
npm test      # node bin/kaal.mjs gates: every wall, one exit code
```

Read the board before touching anything. One line per wall: `ok <wall>` or
`FAIL <wall>  fix: <what to run>`; then `green:` or `red:` with the counts.
Main is green, so a red board on your change is your change's, and the
`fix:` hint is where to start. When every wall fails at once, the runner
itself could not start something; read the first error line before you
read the tree.

## The way past a red wall

Fix it, or file a waiver: `waivers/<wall>.md` with `wall`, `who`, `why`
and `until`, a human's act that the board then shows as `waived`, never as
`ok`. Never `--no-verify`, never skip, disable or quarantine a test, never
edit another seat's test to make it pass; hand it back to its owner.

## One pull request, one lane

A seat declares the paths it may change in `kaal.config.json`, the lane is
read off the branch, and one pull request is one lane. A lane carries one
seat or none, and nothing outside that seat's paths, the lane's own allowed
paths, and the shared paths may travel in it.

Six lanes carry a seat, one each, and they are declared in the order of
the chain: `plan/<topic>` the manager, `requirement/<task>` the analyst,
`architecture/<task>` the architect, `build/<task>` the developer,
`test/<task>` the tester, `operate/<topic>` the operator. Four carry none:
`governance/<topic>` for the league's own contract, `skill/<name>`,
`agent/<name>`, `eval/<skill>-<fixture>`. A diff that does not fit its lane
is two pull requests, and the split is yours to make: nothing here widens a
declaration to let a diff through.

Every seat writes its own want and its own proof: the manager the plans
under `plan/`, the analyst a requirement and acceptance tests under
`requirements/<task>/`, the architect a drawing and contract tests under
`architecture/<task>/`, the tester the strategy and the plans under
`tests/`, the developer code and unit tests beside it, the operator the
release records under `deploy/`.

A seat is a place as much as a name: each owns one tree and nothing else
owns it. The manager orders work across the seats and writes none of their
artefacts; the operator carries out the acts the tree cannot, and records
what happened. Neither reaches into another seat's tree, and a plan that
says what somebody else must do is still a plan and never their diff. Every test is seen red before it is trusted
green. A closed task's red is a failure; an open task's red is reported.

## How a change lands

Branch from `release`, never from a branch that already carries something
else, and name the branch by the lane of the diff. Make the change, run
`npm test`, and push: the hook runs every wall before the push leaves the
machine, and a push it refuses is not done. Open the pull request from that
branch against `release`; the merge is the human's approval.

`release` is where the work happens and `main` is what a consumer installs.
A wall may stand red on `release`, where the seat that can fix it can see it;
no wall may stand red on the promotion to `main`, and a red one there is a
block with an owner rather than a thing to wait out. The promotion is the
operator's: `release` into `main`, one pull request, carrying every seat's
work, which is why the rule that gives a diff one seat is not asked of it. Paste the board's
lines in the pull request, and when you report a red, paste the `FAIL`
line and the lines under it, never a count alone: a red nobody can see is
a claim, not a finding. A pull request whose body describes commits that
are not on its branch describes nothing.

## House rules

- Skills under `skills/` follow the skill rules `kaal check` reads: the
  standard's shape, MIT, no vendor or product named, no en-dash or em-dash
  anywhere (use `,` `;` `:` `()` or `--`).
- A fixture obeys the rules it is not testing, and a fixture command is a
  program and its arguments that parses the same under every shell.
- Every use of a skill ends with a `retro-4ls` retro under `retros/`; ten
  unconsumed retros on one skill are the analyst's next ask.
- An eval record is evidence: its shas must match the files it names.
- The commit message says what and why; the pull request body carries the
  board's lines.
