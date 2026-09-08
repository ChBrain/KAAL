# Requirement: the-board-counts-the-reads

_Named by the drawing `a-retro-names-what-it-read` as the task that closes a
gap that drawing opened on purpose: the read line became a finding and no
wall runs the command that finds it. Written after checking whether the gap
had already cost something, and it had. The surface page still describes the
command as it was before the read count existed._

## Goal

Whoever runs the board wants a misspelled read line to be red there rather
than found by a person who happened to type the command, so that the count
this league added yesterday can be trusted; they will know it by a wall that
runs the check and by the surface page describing the command that exists
rather than the one that used to.

## What the runs said

- `node bin/kaal.mjs retros` exits 0 on this tree, 1 on a tree holding a read
  line that names no skill (`one.md: reads delta, which is no skill in this
tree`), and 2 on a tree with no skills. Three codes.
- No wall runs it. `kaal.config.json` holds ten gates, and none of their
  commands is `retros`, so the finding added in `a-retro-names-what-it-read`
  can only be seen by a person typing the command.
- `SURFACE.md`'s `retros` entry is stale in three ways. It says the command
  "answers how many retros feed each skill that no requirement has yet
  consumed" and nothing about the read count; it says "Exits 0 or 2", and
  the command exits 1 today; and it says "archiving a retro changes no
  count", which is still true of the unconsumed count and false of the read
  count, because reads are counted over `retros/` and an archived retro
  leaves it.
- Six closed test files read `SURFACE.md`, across `a-change-declares-its-class`,
  `each-skill-carries-its-own-version` and `the-surface-is-written-down`.
  All pass today, so none of them holds the sentences that went stale.
- `node bin/kaal.mjs retros` answers `test: 3 read` on this tree, from three
  live retros. It answered `test: 1 read` when the count landed and the
  other two arrived since, so the number is moving and nothing is checking
  what feeds it.

## Assumptions

- The wall runs a flag rather than the bare command. `kaal retros` prints
  two lines per skill, which is twelve lines of board output that decide
  nothing, and `runner --check` is the tree's own precedent for a form that
  says only whether something is wrong.
- The stale surface page is part of this task and not a separate one. It
  went stale in the change that created the gap this task closes, it is one
  paragraph, and the alternative is a second requirement whose whole content
  is three sentences.
- Nothing about how a read is counted changes. Whether an archived retro
  should keep its read is a real question and it is open below; this task
  writes down what the command does today.
- Ten walls becoming eleven is not itself a promise anyone holds. No test in
  the tree asserts a count of walls, checked by reading all of them, so the
  board may grow without a supersede.

## Constraints

- `kaal retros` with no flag keeps its output and its three exit codes
  exactly. Ten closed tests read the unconsumed line anchored and two more
  read the answer's shape.
- The exit vocabulary holds: 0 an answer, 1 findings, 2 the question is not
  this tree's.
- The board's gates keep their order and their shape, each with a name, a
  command and a fix.
- No skill's text changes.

## Acceptance criteria

1. `kaal retros --check` prints nothing and exits 0 on a tree whose read
   lines all name a skill that tree holds.
2. `kaal retros --check` prints one line per read line naming something that
   is no skill in the tree, each naming the retro's filename and the name,
   and exits 1.
3. `kaal retros` with no flag prints the same lines it prints today and
   keeps its three exit codes, 0 for an answer, 1 for a finding and 2 for a
   tree it cannot read.
4. `kaal.config.json` carries a gate whose command runs the check and whose
   fix names what to do about a read line nobody can resolve.
5. `SURFACE.md`'s `retros` entry says what the command answers today: the
   unconsumed count and the read count, that a read is never counted as
   unconsumed, that archiving a retro removes its read while leaving the
   unconsumed count alone, and the three exit codes.

## Open questions

- Should an archived retro keep its read? A read falling when a stack is
  consumed means the number answers "is this skill being leaned on lately"
  rather than "has this skill ever been leaned on", and nobody has decided
  which question the league wants.
- Should the wall also refuse a read line that names the skill the retro
  feeds? The rule says the line names skills other than that one, and
  nothing enforces it, so a retro can name itself and inflate its own count.
- What does a person do with a finding on a retro that is already archived?
  The check reads `retros/` only, so a bad line in the archive is invisible,
  which is either right or a hole depending on whether the archive is
  evidence.
- Nothing checks that the surface page still describes the commands. This
  task fixes one paragraph by hand, and the same paragraph went stale
  without anything noticing.

## Handoff

- Task: the-board-counts-the-reads
- Criteria: 5; tests: 5 (equal)
- Red run: `node --test --test-timeout=60000 requirements/the-board-counts-the-reads/acceptance.test.mjs`
- Tests: `acceptance.test.mjs`, beside this file; they drive the command on
  fixture roots beside the requirement `a-retro-names-what-it-read`, whose
  trees are already the ones the criteria were written against, and read
  `kaal.config.json` and `SURFACE.md` as text
- Green before the build: criterion 3, and it is a guard rather than a
  defect. The bare command is correct today and the criterion exists so the
  build cannot pay for a flag by changing the lines ten closed tests read
- Open questions: 4, listed above
- Status: closed
- Blocked on: nothing
- Unblocks: nothing
- Supersedes: nothing. `SURFACE.md`'s `retros` entry is corrected rather
  than superseded: no closed test holds the sentences that went stale, and
  the page was describing a command that had already changed under it
- People: none
