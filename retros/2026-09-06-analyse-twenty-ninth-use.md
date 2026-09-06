# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the twenty-ninth use of the analyse skill, on
`requirements/witness-a-tree` (four criteria for a command that proves a
directory was not touched), 6 September 2026.
Place: this repository

## Liked

- The criteria came out of one question: what can a filesystem prove that
  a rubric cannot. That kept the command small and kept the model out of
  the verdict entirely, which is the whole reason the task exists.
- Saying in the assumptions that a git working copy is witnessed by git
  and not by this, rather than inventing an ignore list to look general.
  The limit is honest and a reader can argue with it.

## Learned

- Two of the four tests passed against a command that does not exist. An
  unknown command exits 1, writes nothing to the tree and prints usage, so
  a criterion about an effect not happening was satisfied by nothing
  happening at all. A test about absence passes vacuously when the cause
  never ran.
- The fix was to tie each such test to a run that happened: assert the
  manifest form actually produced three lines before asserting the tree is
  unchanged, and assert the error line names the path at fault, which a
  usage line never does. The criterion moved with the test, and said so.

## Lacked

- The skill says every test is seen red before it is trusted green. It
  says nothing about the reason for the colour. I nearly wrote "all four
  red" into the handoff from the plan rather than from the run, and only
  caught it because I read the output.
- No guidance on writing a criterion whose subject is something not
  happening. Those are exactly the criteria that pass by accident, and
  they are the ones this repository keeps needing: the assessor that does
  not write, the guest that does not touch, the reader that does not
  parse.

## Longed for

- A line in the skill: a criterion about something not happening needs a
  test that proves the thing could have happened. Without it the proof is
  a coincidence.

Feeds: analyse
