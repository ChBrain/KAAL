# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the twenty-fifth use of the architect skill, on
`architecture/where-a-skill-acts` (four seams over a text change), 6
September 2026.

## Liked

- The requirement had already fixed the words, so the contract's job was to
  fix their places instead. Naming the heading and demanding it stand before
  the first numbered step gave the drawing something to say that the
  acceptance tests could not say for themselves.
- The seams fell out of one question, who reads this text, rather than being
  invented: the model in the seat, the retro that gets compiled, the stack
  that counts it, and the runner page. Four readers, four seams, no argument
  about the count.
- The stack could be driven from outside with no change to `bin/`, because
  `kaal retros` reads its cwd: a fixture root with two skill directories and
  one filed retro was enough to hold the promise.

## Learned

- A section reader stops inside a fenced block that carries headings of its
  own. Reading the retro skill's output format with the same helper the
  drawings wall uses returned an unterminated fence, and the acceptance test
  for the same criterion passes only because `Period:` and `Place:` happen to
  sit above the block's first inner heading. Read a fence from its heading,
  not from a section.
- A contract test that is green before the build is legitimate when the seam
  is a reader several seats share: it says what must not change. It is not
  legitimate silently, so the handoff names which one and why.
- Running the formatter between writing a file and patching it defeats an
  exact string written from memory. The same trap as in the code seat, from
  the other direction: I caused the rewrap myself.

## Lacked

- The skill says every contract test fails now, because nothing behind the
  seam exists. That is false for a guard on an existing reader, and nothing
  told me whether a green test was a defect or a kind. I decided alone and
  wrote the reason into the handoff.
- The skill says that for a text change the parts are the sentences' places,
  but nothing says how a place is fixed. Position is not a phrase, so the
  contract had to invent the reading (an index before the first numbered
  step) and no wall would have caught its absence.

## Longed for

- `kaal retros [root]`, the way `ledger` and `drawings` take one, so a stack
  can be driven at a root instead of by setting a working directory. The
  fixture works, but it works by a side door.
- A way for a drawing to declare a contract test a guard, so that the honesty
  about a green test is structural and the contracts wall can count guards
  separately from proofs.

Feeds: architect
