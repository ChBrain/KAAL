# AGENTS.md: the contract for any runtime

KAAL is Kai's Artificial Agent League: skills that build software, agents
that hold them, and walls that gate every change. `README.md` is the door
and `DESIGN.md` says why. This file says how to work in the tree, and it is
vendor agnostic; the vendor files point here and add nothing.

## The board

```
npm install   # once per clone; wires the pre-push hook
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

A seat declares the paths it may change, the lane is read off the diff,
and one pull request is one lane. Branches are named by lane:
`requirement/<task>` for a requirement with its drawing and build,
`governance/<topic>` for the rest of the tree, `skill/<name>`,
`agent/<name>`, `eval/<skill>-<fixture>`. A diff that crosses two lanes is
two pull requests.

Every seat writes its own want and its own proof: the analyst a
requirement and acceptance tests under `requirements/<task>/`, the
architect a drawing and contract tests under `architecture/<task>/`, the
developer code and unit tests. Every test is seen red before it is trusted
green. A closed task's red is a failure; an open task's red is reported.

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
