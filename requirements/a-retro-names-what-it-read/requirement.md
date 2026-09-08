# Requirement: a-retro-names-what-it-read

_Kai asked whether the retro stacks are running on all six skills and whether
the league needs more of them. The counts said no to the first, and the reason
is mechanical rather than a matter of anyone's attention: a retro is filed
under the seat that acted, so a skill that is read constantly and never acts
as a seat collects nothing and can never be corrected by evidence. This is the
first half of the answer. The second half, whether the league needs a seat for
writing orders an executor cannot question, waits for a stack behind it._

## Goal

Whoever counts the retro stack wants to see which skills a run leaned on and
not only the seat that filed it, so that a skill read by every other seat and
never named by any of them stops being invisible; they will know it by
`kaal retros` reporting a read count for every skill beside its unconsumed
count, by the retro carrying the skills it read on a line of its own, and by
a read never being mistaken for a retro that fires the rule of ten.

## What the runs said

- `node bin/kaal.mjs retros` prints one line per skill,
  `<skill>: <n> unconsumed`, and exits 0. Today: analyse 2, architect 0,
  code 11, operate 1, retro-4ls 0, test 0.
- 131 retros are filed, live and archived together. Counted by their `Feeds:`
  line: analyse 47, code 42, architect 41, operate 1, **test 0, retro-4ls 0**.
  Two of the six skills have never had a single retro filed against them.
- Every one of the 131 carries a `Feeds:` line; none is missing one. Both
  spellings the counter accepts are in use, 68 as ``Feeds: `skill`.`` and
  63 as `Feeds: skill`.
- Ten test files read the count line with an anchored pattern,
  `^<skill>: (\d+) unconsumed$` or a literal of the same shape: two
  acceptance tests, one in `requirements/nothing-passes-vacuously`, and seven
  contract tests under `architecture/`. All ten belong to closed tasks.
- `bin/lib/retros.mjs` consumes a retro when any `requirements/*/requirement.md`
  contains its filename. Moving a file to `retros/archive/` is the league's
  convention and not what the counter reads.

## Assumptions

- The read count is a signal a human acts on, not a trigger. The rule of ten
  fires on the retros that feed a skill, as it does today, and nothing here
  changes when a stack runs. Whether a read should ever fire it is a real
  question and it is open below, because answering it means deciding what
  consuming a retro means when two skills both claim it, and that is a larger
  change than the ask.
- A skill the run followed without acting as that seat is what the line
  names. The code seat writing its own tests follows the `test` skill; every
  seat writing a retro follows `retro-4ls`. No exception is carved for the
  second: a line naming `retro-4ls` on most retros is boilerplate to write and
  a true number to read, and an exception is a rule every future seat has to
  remember.
- The 131 retros already filed are not edited. A retro is a record of a run
  and rewriting one after the fact is rewriting what happened, so the line is
  absent on all of them and the count starts from the next retro filed.
- The counter's two spellings stay as they are. Widening or narrowing what
  `Feeds:` accepts is a different task and nothing here depends on it.

## Constraints

- The `<skill>: <n> unconsumed` line keeps its exact shape and its position at
  the start of its own line. Ten closed tests read it anchored, and a task
  that breaks ten closed contracts to add a report is not this task.
- The exit vocabulary holds: 0 an answer, 1 findings, 2 the question is not
  this tree's. `kaal retros` answers today and must keep answering 0 when
  there is nothing wrong.
- A retro with no `Read:` line is valid. Every retro in the tree is one.
- The skill's rules apply to its own text: MIT, the standard's shape, no
  vendor or product named, no en-dash or em-dash, under five hundred lines.

## Acceptance criteria

1. The `retro-4ls` skill's template carries a `Read:` line beside `Feeds:`,
   and the skill says what belongs on it: each skill whose rules the run
   followed and which is not the one the retro feeds, and nothing else.
2. `kaal retros` prints, for every skill in the tree, a line
   `<skill>: <n> read` beside that skill's `<skill>: <n> unconsumed` line,
   and every existing `<skill>: <n> unconsumed` line keeps its exact shape.
3. A skill named on a retro's `Read:` line is counted in that skill's read
   count and is not counted in its unconsumed count, whether or not the retro
   has been consumed.
4. A `Read:` line naming something that is not a skill in the tree is a
   finding: `kaal retros` names the retro's filename and the unknown name,
   and exits 1.
5. A retro with no `Read:` line is not a finding, and with every `Read:` line
   absent `kaal retros` exits 0 and prints a read count of zero for every
   skill.

## Open questions

- Should a read ever fire the rule of ten? It cannot today, because consuming
  a retro is a requirement naming its filename and one filename cannot be
  consumed twice for two skills. Answering it means deciding what a stack run
  consumes, and that is the larger change this one deliberately leaves open.
- Does a read belong on a retro the seat filed against itself? The code seat
  reading the code skill is not a read by the rule above, and yet it is the
  most common thing any seat does.
- What does a skill do with a read count it can never act on? `test` will
  show a number and has no stack, no analyst run, and no requirement lane of
  its own that anybody has used.
- Should `kaal retros` say which retros read a skill, and not only how many?
  A count tells a human to look and gives them nowhere to look.
- Is the `operate` skill's single retro a count or a symptom? It is the only
  seat that touches the outside world and it has been used once on the
  record, during a release that produced three separate refusals.

## Handoff

- Task: a-retro-names-what-it-read
- Criteria: 5; tests: 5 (equal)
- Red run: `node --test --test-timeout=60000 requirements/a-retro-names-what-it-read/acceptance.test.mjs`
- Tests: `acceptance.test.mjs`, beside this file. They drive `kaal retros` on
  a fixture root, never on the league's own tree, because the league's own
  counts move every time anyone files a retro
- Green before the build: none expected
- Open questions: 5, listed above
- Status: closed
- Blocked on: nothing
- Unblocks: nothing; the question of whether the league needs a seat for
  writing orders is a separate ask and does not wait on this
- Supersedes: nothing
