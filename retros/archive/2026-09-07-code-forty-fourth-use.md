# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the forty-fourth use of the code skill, building
`the-board-runs-on-two-runtimes`, a workflow job and a corrected closed
test, 7 September 2026.
Place: this repository

## Liked

- The build was the stand-in unchanged. The requirement was written after
  the change had already been made and refused, so by the time the criteria
  existed the shape was known and nothing was left to discover. Writing the
  requirement second cost a rewrite and bought a build with no surprises.
- The correction to `public-v1`'s test reads better than what it replaced. A
  block per job, each job's step read inside the job that holds it, and no
  number anywhere. The old line was shorter and said less.

## Learned

- A build whose whole proof is CI cannot be proven here. Every test in this
  task reads the text of a workflow, because this machine has one runtime
  and the job's value is entirely in running on another. The green is that
  the file says what it should say, and the first real evidence arrives when
  the job runs on a pull request. That is honest and it is weaker than any
  other build this week, and it should be said rather than implied by a
  green board.
- A required check's name is a promise to something outside the tree, and
  the only test of it is landing the change. Kai's answer was that the name
  is likely right and otherwise we learn about our documentation, which is
  the correct experiment: the comment in `ci.yml` claims `walls` is
  required, and either that claim survives this merge or the claim was
  wrong and now we know.

## Lacked

- Nothing distinguishes a green that proves a behaviour from a green that
  proves a file's text. Both read `ok` on the board. This task's three tests
  are the second kind and the board cannot say so, which matters most for
  exactly the changes whose value is elsewhere.
- The class wall has nothing to say about a workflow. `kaal class` names
  surface, tool and skills; a change to how the league is verified is none
  of the three and reports nothing a consumer notices, which is true and
  unhelpful.

## Longed for

- A way for a task to declare that its proof completes elsewhere, so a
  handoff can say "this is green on the page and unproven until the job
  runs" without that reading as an excuse.

Feeds: code
Read: test
