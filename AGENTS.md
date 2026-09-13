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
`test/<task>` the tester, `operate/<topic>` the operator. Five carry none:
`governance/<topic>` for the league's own contract, `skill/<name>`,
`agent/<name>`, `eval/<skill>-<fixture>`, and `dependabot/<ecosystem>/<name>`,
which no person writes: it is the one lane a machine files into, it is the one
head `main` takes beside the promotion, and who may open it is the workflow's
question and never the engine's. A diff that does not fit its lane
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
what happened.

An idea is not yet work, and it reaches the manager through the analyst. A
thing anybody noticed, a defect a run turned up, a want somebody said out
loud, goes to the analyst first, who judges it: it becomes a requirement with
a proof, or it is refused with the reason. Only what survives that reaches the
manager, who says which release it belongs to. Priorities are the manager's
and nobody else's, and a seat that puts its own find straight into a plan has
taken two seats at once. This is a rule about ideas and never about blocks: a
blocked seat names its block where it stands, and the manager picks that up as
it is. Neither reaches into another seat's tree, and a plan that
says what somebody else must do is still a plan and never their diff. Every test is seen red before it is trusted
green. A closed task's red is a failure; an open task's red is reported.

## What a seat needs from a seat

Each seat's work exists only when a specific upstream artefact is in a
specific state, and is blocked by a state it cannot change itself. The table
is the same on every task; what changes per task is which of these edges is
live, and that is what a seat's own backlog records.

| seat      | work exists when                                                 | blocked when                                             |
| --------- | ---------------------------------------------------------------- | -------------------------------------------------------- |
| analyst   | an ask has no requirement, or a closed criterion is contradicted | only a person can answer                                 |
| architect | a requirement has no drawing                                     | the criterion cannot be drawn as written                 |
| developer | a test is red                                                    | the red test needs a seam nobody drew                    |
| tester    | a criterion has no proof, or a task has no record                | a verify or validate fails for a reason outside `tests/` |
| operator  | something is proved and unshipped                                | a control outside the tree                               |
| manager   | two seats are clear and the order is not obvious                 | never on its own account                                 |

The manager cannot be blocked by a seat, only by proxy, carrying somebody
else's block. That is why it is the seat that picks blocks up, and it is the
argument against seats handing work to each other directly.

A block names one kind and never a fix. The kinds are declared in
`kaal.config.json` beside the seats and the lanes, and today they are
`no requirement`, `no drawing`, `no proof` and `no record`: each names a
thing the tree either holds or does not, so a block clears when the tree
holds it and never because anybody decided. A seat writes its own block in
its own lane, at `backlog.md` in the tree that seat owns, keyed
`<seat>/<task>` under a `blocks:` block in frontmatter. `kaal backlog` reads
all six and writes none.

Three rules hold the whole of it:

- **A seat names the block and never the fix.** The blocked seat says where,
  the manager says when, the owning seat says what. None of the three may
  decide for another, which is why neither a block nor the manager's pick-up
  carries a field for a remedy.
- **A refusal is a block.** Every time a seat tries to write outside its lane
  that is the moment to record one, and the wall that refuses it already
  names the seat that owns the path.
- **A bug blocks its retest.** A failing verify or validate is recorded as a
  bug naming the earliest of requirements, architecture, code or operations
  where it can be fixed, and the case it blocks is not retested until it
  clears.

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
