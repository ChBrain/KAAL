---
traces:
  supersedes: nothing
---

# Requirement: a-decision-balances-two-goods

_Written in analyse mode. Ask, from Kai, on the architect: "two good choices
usually: 1: shortest path to value, 2: maximise possible choices. those are
often in contrast to each other. an architect needs to balance them against
each other." The skill's decision record already asks what was chosen, what
was not taken, why, and what would reopen it. It never asks which of the two
goods the choice bought, or what it spent on the other, so a record can read
as complete while the price is nowhere on the page._

## Goal

Whoever reads a decision wants to see what it cost, so that a trade taken
without noticing it is a trade can be caught while it is still a sentence;
they will know when every record names which of the two goods it bought and
what it spent on the other, and when the architect is told to check the
foreclosed side against the thing the task exists to deliver.

## Assumptions

- The two goods are the asker's and are used in his words: the shortest path
  to value, and keeping the most choices open. Renaming them into the
  vocabulary of some other discipline would lose the ask.
- They are usually in tension and not always. A choice that costs nothing on
  either side is not a decision at all, which the skill already implies with
  "a decision with no options was not a decision" and does not say about
  price.
- The dangerous failure is not choosing the wrong good. It is not seeing that
  a trade was made. `architecture/a-change-declares-its-class` decided that
  an unresolvable base would exit 2 and leave the wall quiet in CI, which
  read as free: no workflow was touched and the wall shipped. The price was
  the wall itself, red on every pull request, and the record shows no sign
  that anything was spent. The correction is in that drawing and the build
  that found it is `#74`.
- `Reopens if:` is about the future and not the price. It says what would
  make the choice worth revisiting; it does not say what the choice cost on
  the day it was made, and a reader cannot infer one from the other.
- Nothing here gates. Whether a wall should refuse a record with no price is
  an open question, not a criterion: the ask is about how an architect
  thinks, and a wall is a bigger step than the ask.
- The closed drawings in the tree are not retrofitted. They were written
  under the shape that was current when they were written, and rewriting
  history to match a new rule is the thing this repository does not do.

## Constraints

- The skill's rules apply to its own text: MIT, the standard's shape, no
  vendor or product named, no en-dash or em-dash.
- The change is text. No command changes behaviour and nothing under `bin/`
  moves.
- The words the tests read are fixed in the criteria below, so the tests can
  be written before the sentences exist.

## Acceptance criteria

1. The architect skill names the two goods in the Decisions guidance, as the
   shortest path to value and as keeping choices open, and says they are
   usually in tension.
2. The skill says a record names which of the two the choice bought and what
   it spent on the other, and that a choice costing nothing on either side is
   not a decision.
3. The skill tells the architect to check the foreclosed side against what
   the task exists to deliver, and names the failure that catches: a choice
   that takes the shortest path and forecloses the value the task was for.
4. The drawing template's decision shape carries a line for the price, so a
   record written to the template without it is visibly short.

## Open questions

- Should the drawings wall refuse a decision record with no price line, the
  way it already counts edges against seams? That would make this a rule
  rather than a discipline, and it would make every drawing in the tree red
  until each is amended.
- Is the price a third field beside `Because:`, or a clause inside it? A
  field is countable by a wall later; a clause reads better and hides more.
- Do the two goods belong to the analyst as well? An acceptance criterion
  can be written for the shortest path or for the widest one, and nothing in
  that skill says so either.

## Handoff

- Task: a-decision-balances-two-goods
- Criteria: 4; tests: 4 (equal)
- Red run: `node --test --test-timeout=60000 requirements/a-decision-balances-two-goods/acceptance.test.mjs`
- Tests: `acceptance.test.mjs`, beside this file; they read the skill's text
  and its template with whitespace folded, because the formatter wraps where
  it likes
- Open questions: 3, listed above
- Status: closed
- Blocked on: nothing
- Supersedes: nothing
- Superseded by: `an-architect-names-its-principles`, in part. The claim that
  moved is where the two goods lives: from this skill's Decisions bullet to
  `skills/architect/references/principles/the-two-goods.md`, which the bullet
  now cites. The principle's words and the obligation to price the trade did
  not change. This task's criterion 1 is read in the file it moved to, and
  its template shape grew a sixth label, `Weighed against:`
- People: none
