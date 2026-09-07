# Requirement: the-surface-is-written-down

_Written in analyse mode. Ask, from Kai: KAAL needs SemVer, a clean path
forward and a package concept, and then the rule that decides the shape of
all three: "we start with 0.0.x, you do not touch minor or major." A class
of change that only a human may raise above patch has to be refusable by a
machine, and nothing can judge a change against a surface that is not
written down. This is that page, and it comes before the wall that reads
it._

## Goal

Whoever asks whether a change to this tool is a patch wants one page that
says what the tool promises, so the question has an answer that is not a
matter of taste; they will know when every command the tool offers is on
that page with what it answers and on which exit codes, and when the page
and the tool cannot disagree without a wall saying so.

## Assumptions

- The surface already exists; it is scattered. `applies-here` fixed exit 2
  and the shape of the line that carries it. `witness-a-tree` fixed the
  manifest's format and the two exit codes of a comparison.
  `nothing-passes-vacuously` fixed which commands answer about a root.
  `code-v2` fixed that a listing which finds nothing still answers. This
  task gathers what is already decided; it decides nothing new.
- The exit codes are three and they are the whole vocabulary: 0 an answer,
  1 findings or usage, 2 the question is not this tree's. Everything the
  tool does today ends on one of them.
- The page is for a reader deciding whether a change is a patch, not a
  manual for using the tool. `README.md` already does the second job and
  keeps it.
- The page and the tool's own usage line are two readings of one fact, so
  a test holds them equal, the way `evals/README.md` and the record's
  fields are held equal today.
- Nothing here versions anything. The version, the package split and the
  class wall are separate tasks and each is blocked on this one.

## Constraints

- No command changes behaviour. This task adds a page and a test and
  touches nothing in `bin/`.
- The page names no vendor and carries no dash (rules apply to the tree's
  voice as much as to the skills).

## Acceptance criteria

1. A page at `SURFACE.md` names every command the tool's usage line
   offers, and for each: what it answers, what it reads, and which exit
   codes it can end on.
2. That page states the exit code vocabulary once, as three codes: 0 an
   answer, 1 findings or usage, 2 the question is not this tree's.
3. The page names the shapes that closed tasks fixed and that a caller
   parses: the applicability line, a finding line, and the manifest line.
4. The page and the tool cannot disagree: every command named in the
   usage line appears on the page, and every command the page names
   appears in the usage line.

## Open questions

- Does the skills bundle need a surface page of its own, or is a skill's
  surface its text and its records, with no interface to break?
- Should the page carry, for each command, the closed task that fixed it,
  so a reader can find the argument rather than the conclusion?
- When the class wall arrives, does it read this page or the usage line?
  They are held equal, so either works, and the answer decides which one
  a change must touch to be more than a patch.

## Handoff

- Task: the-surface-is-written-down
- Criteria: 4; tests: 4 (equal)
- Red run: `node --test --test-timeout=60000 requirements/the-surface-is-written-down/acceptance.test.mjs`;
  all four red, run and read
- Tests: `acceptance.test.mjs`, beside this file
- Open questions: 3, listed above
- Status: open
- Blocked on: nothing
- Supersedes: nothing
