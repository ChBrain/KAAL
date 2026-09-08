# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the forty-third use of the code skill, building
`a-retro-names-what-it-read` against three contract tests, five acceptance
tests and four new units, 7 September 2026.
Place: this repository

## Liked

- The skill this change exists for says the diagnosis in its own first
  paragraph: `test` is "the one skill every seat loads and no seat owns". It
  has never had a retro. The sentence was written by a seat that knew
  exactly what was happening and had no way to record it, and this build is
  the first retro in the league that can.
- The build was the stand-in, unchanged except for one ordering fix the
  contract had already forced. Nothing in the drawing turned out to be
  wrong, which is the first time this week a build had nothing to send back.

## Learned

- A unit test importing its own module's exports cannot avoid the collapse
  the contract tests were rewritten to avoid. Against the old counter, all
  four new units failed as one module load error, because a named import of
  `readFindings` fails the file. For a unit that is the truthful shape: the
  module's surface is what a unit tests, so the surface missing is the
  failure. The contract tests import the namespace because three seams must
  fall separately; the units do not, and pretending otherwise would be
  ceremony.
- The acceptance wall's finding is a real one and it fired on the stand-in.
  A requirement whose tests are all green while its status says open is
  refused, so a stand-in green run turns the board red until it is
  discarded. That is the wall doing its job and it reads at first like
  damage from the stand-in.

## Lacked

- Nothing tells a seat which of its reads to name. This retro reads `test`
  because the units and contracts are its rules, and it does not read
  `architect` even though the drawing was followed closely, because the
  drawing is an artefact and the skill that made it is not what shaped this
  work. The rule shipped today says "every skill whose rules this run
  followed", and the boundary between following a skill and reading its
  output is a judgement the skill does not help with.
- The read count has nowhere to go. `kaal retros` will report `test: 1 read`
  after this lands and there is no lane, no stack rule, and no analyst run
  that consumes a read. The number is honest and inert, which the drawing
  priced and named, and it is still the first thing a reader will ask about.

## Longed for

- A second half to the rule of ten for reads: some number of reads on a
  skill with no retros of its own that says a seat should look at it. Ten
  unconsumed retros fires a stack; a hundred reads and zero retros should
  fire something, and today it fires nothing.

Feeds: code
Read: test
