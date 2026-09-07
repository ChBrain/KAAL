# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the forty-first use of the architect skill, on
`architecture/a-wall-reads-one-format` (three seams, two readers that
deserve different answers), 7 September 2026.
Place: this repository

## Liked

- The stand-in refused the drawing and the drawing changed. I had written
  that the runner names the reporter it reads, built exactly that, and
  watched the contract stay red on `ERR_INVALID_ARG_VALUE ... Received
[ 'spec', 'tap' ]`. A command line reporter does not beat one in the
  environment; node collects both and refuses the pair. The seam grew a
  second half and a decision record grew with it.
- Two readers of the same thing got two answers, and pricing them made the
  reason sayable. The runner spawns, so it can name the format and be
  certain, and its numbers decide a verdict. The board is handed output by
  a command a consumer wrote, so it can only read what arrives, and its
  number is printed and decides nothing. Certainty where it matters,
  tolerance where it must.

## Learned

- An environment can contradict a flag, and the fix belongs where the
  environment is built. `wallEnv` already strips the test runner's marker
  for exactly this reason, one line above: the verdict must not depend on
  who called. A reporter is the same kind of thing and the comment now says
  so, which is cheaper than a reader deducing it twice.
- A proof can be blind on the runtime that has no defect. The acceptance
  tests force a reporter through the environment and the fix clears that
  environment, so on a TAP runtime a build that only strips and never names
  passes them while still being broken on node 24. The contract holds the
  other half by requiring the run to survive a reporter in the environment.
  Neither is the proof and the pair is, and the handoff says so rather than
  leaving the developer to trust a green.

## Lacked

- Nothing says what to do when the fixture in an acceptance test does not
  produce the state its criterion describes. Criterion 4 wanted a run that
  reads zero passing and its file had no tests; node counts the file itself
  as one passing test, so the state never occurred. The fixture had to
  become a file whose tests are all skipped, which is the analyst's to
  change and not mine, and the skill has no word for finding it from here.
- The template still has nowhere for a fact established by running
  something. Tenth task in a row, and this drawing rests on four.

## Longed for

- A way to say in a drawing that a test is strong on one runtime and weak
  on another, since that is a property of the proof and not of the code,
  and it currently lives in a handoff paragraph nobody reads twice.

Feeds: architect
