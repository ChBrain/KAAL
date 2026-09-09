# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifty-first use of the code skill, on
`requirements/an-artefact-traces-what-it-came-from` (four seams, six
criteria, 106 artefacts migrated), 9 September 2026.
Place: this repository

## Liked

- The migration was derived and never invented. Every requirement's
  `supersedes` came out of its own `- Supersedes:` line, keeping only names
  that resolve; every drawing's `requirement` came from its directory and its
  `principles` from the `Weighed against:` lines the previous build had just
  made possible. 106 artefacts, no judgement calls, and the wall was green on
  the first run after it.
- The wall found a real thing on its first day. `agent-v1`'s line says
  "PR #1, which closes when this lands", which is not a task, so its trace is
  `nothing` and the prose keeps the fact. That answered an open question the
  requirement had left, by example rather than by argument.

## Learned

- The build corrected its own requirement's numbers, and the correction is
  the task's own subject. The record read "forty-four lines, twelve name
  something"; the truth is forty-seven, and ten, because three lines say
  `nothing` and then explain why and I had counted by grepping for the line
  rather than reading its value. A task about links going stale was specified
  from a count that was already wrong.
- A one letter fixture name hid a case for the second time in two days. The
  `silent-prose` fixture's task was `t` and its prose says "something-else",
  which contains a t, so the check it exists to drive passed on a letter. I
  learned this in the contract fixtures of this same task and wrote the
  acceptance fixture before learning it. A lesson learned inside a task does
  not travel backwards through the work already done in it.
- A test that strips tokens to find what is left must strip only the tokens
  it means. Criterion 6 asked whether prose remained after the names were
  removed, and removed every lowercase word, so `evals-v2`'s nine word line
  read as bare names. The assertion was right and its arithmetic was not.
- The change class must be computed last. I wrote it from the tool's output,
  then added the surface entry, and the class moved from "tool, skills" to
  "surface, tool" while the handoff still said the old one. That is the
  second time in two runs I have put a wrong class in a handoff, and the
  first time it was from memory; this time it was from a measurement taken
  too early.

## Lacked

- Nothing in the skill about when to compute the class. It says to write what
  the tooling computed and never one you chose, and the run that computes it
  has to be the last one before the commit, which is not said.
- No word for a build whose migration is derived from the tree. The sweep
  section covers fixtures a test counts, fixtures a record's sha pins, and
  generated files; a hundred artefacts rewritten from what they already said
  is a fourth kind and it is the one with the most ways to be quietly wrong.

## Longed for

- A fixture naming rule: no fixture name shorter than four characters, and no
  name that is a substring of any prose beside it. Twice in two days is a
  pattern, and both times the test passed rather than failed.

Feeds: code
Read: test
