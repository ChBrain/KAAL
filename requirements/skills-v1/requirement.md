# Requirement: skills-v1

_Written in analyse mode. Ask, verbatim: "we need to build skills better:
analyst, architect, code, test, operation (limited) needed; analyst should
help us now; we learn from using it on how to improve it (feedback loop, 4L:
liked, learned, lacked, longed)."_

## Goal

Kai wants the league's five delivery skills and its retro skill built to one
set of rules, so that any of them loads in any runtime that reads the
standard, can be evaluated on a fixture, and gets better through the retro
loop after each use; he will know when every skill directory passes the same
checks and the loop has been run on a real use.

## Assumptions

- The five delivery skills are named `analyse`, `architect`, `code`, `test`,
  `operate`; the names in the ask (analyst, architect, code, test, operation)
  are the same seats, and a rename is cheap now and expensive later.
- "Better" means built to the rules already ruled in `DESIGN.md` (sections 4
  and 7), not more prose per skill.
- "Operation (limited)" means the operate skill ships with an explicit list of
  what it does not do, and that it never deploys to production without the
  human's key.
- The feedback loop is the `retro-4ls` skill, and a retro's Lacked and Longed
  for items are the next requirement for the skill it assessed.
- Fixtures and ledgers are part of what "built" means, because a skill with
  neither cannot be evaluated or placed on the ladder.

## Constraints

- Every skill conforms to the agentskills standard: the name matches its
  directory, the description is non-empty and at most 1024 characters, the
  body is under 500 lines, references sit one level deep (from `DESIGN.md`
  section 4).
- Every skill is MIT (from `LICENSE` and `DESIGN.md` section 4).
- Every skill is vendor neutral and project neutral: no runtime or product
  named, no consumer's vocabulary (from `DESIGN.md` section 4).
- No en-dash or em-dash anywhere in a skill (house rule).
- Runtime configuration stays outside the skills (from `DESIGN.md` section 1).

## Acceptance criteria

1. `skills/` contains exactly six directories: `analyse`, `architect`,
   `code`, `test`, `operate`, `retro-4ls`.
2. Every skill has a `SKILL.md` whose frontmatter `name` equals its directory,
   whose `description` is non-empty and at most 1024 characters, and whose
   `license` is `MIT`.
3. Every `SKILL.md` body is under 500 lines, and every local link in it is at
   most one level deep.
4. No `SKILL.md` or reference file names a vendor or runtime product, and
   none contains an en-dash or an em-dash.
5. Every delivery skill's `SKILL.md` carries a heading for its want, a heading
   for its proof, a heading for its scope with an Allowed and a Not allowed
   list, and a heading for its handoff.
6. The operate skill's scope states that it does not deploy to production
   without the human's key.
7. Every skill has a `moves.json` with a `moves` array in which every move
   has a name and a rung from `human`, `nlp`, `skill`, `script`, and no move
   at `skill` or `script` has a null test.
8. Every skill has at least one fixture directory under `fixtures/` holding
   an `ask.md` and an `expect.md`.
9. `retros/` holds at least one retro on a real use of a skill, and the
   analyse skill's text carries an edit traced to it.

## Open questions

- Are the five names right, or should they be the ask's (analyst, architect,
  code, test, operation)?
- How far does "limited" reach for operate: release and smoke and rollback,
  or also the observability layer the design gives it?
- Does the retro run after every use of a skill, or after every task?

## Handoff

- Task: skills-v1
- Criteria: 9; tests: 9 (equal)
- Red run: `node --test requirements/skills-v1/acceptance.test.mjs` from the
  repository root; see the handoff note in the pull request for the count,
  the run is not filed
- Tests: `acceptance.test.mjs`, beside this file
- Open questions: 3, listed above
