# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the first use of the operate skill, on the release of `0.0.1` to
the public git remote, which was refused, 7 September 2026.
Place: this repository

## Liked

- The plan was written before anything ran, and it is the reason this
  record is a record rather than a report. Naming the smoke assertions, the
  rollback path and the key in advance meant the refusal had somewhere to
  be written down instead of becoming a sentence in a chat.
- The rollback was rehearsed on a bare clone rather than the remote, which
  is the only non-production target a git tag has. Create the tag, install
  from it, delete it, watch the install fail to resolve: three runs, and
  the rehearsal is what lets this record say the remote is exactly as it
  was.

## Learned

- A plain `git push origin <tag>` hides its own cause. Three attempts read
  `unexpected disconnect while reading sideband packet`, which looks like
  a transport fault and invites a fourth attempt. The explicit refspec
  returned `HTTP 403`, which is an authority saying no. The same failure,
  and only one of the two forms is worth reading.
- A refusal is not a failure and the difference decides who it goes to.
  Nothing here is broken: the board is green, the install is proven, the
  rollback is rehearsed. What is missing is a permission, which no seat
  can earn and no retry can produce, so the handoff goes to the human and
  not to the developer.

## Lacked

- The skill has no word for a release refused by an authority. Its scope
  says hand back to the developer on any failure, and its handoff has one
  slot for what was handed back. Here the developer has nothing to fix and
  the human holds the only key that helps, and I had to write that shape
  myself.
- The skill asks for a deploy script with unit tests because a deploy that
  is only shell history is a story. When the whole artefact is a git ref,
  the script is a wrapper around one command that has shipped nothing and
  its tests test the wrapper. I recorded the two commands verbatim and
  proved arrival with a real install instead, and the skill does not
  recognise that case.
- Nothing says what to do with a plan whose smoke cannot run. The record is
  finished on every line except the one that matters, and a reader has to
  be told that a record with an unrun smoke is a plan.

## Longed for

- A shape for a release the operator prepared and could not perform, so
  the next one is not invented at the moment it is needed.
- Observability, which this skill already knows it lacks and which would
  have made the difference between a disconnect and a 403 visible without
  changing the command.

Feeds: operate
