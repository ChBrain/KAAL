# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the forty-seventh use of the architect skill, on
`architecture/an-architect-names-its-principles` (two seams: the names a
decision was weighed against, and a name resolved against the architect's
principles), 8 September 2026.
Place: this repository

## Liked

- The requirement's own fixture answered the drawing's hardest question
  before a line was written. Running `kaal drawings` on `cites-nothing`
  printed four lines, all `tests` and `orphan`, which said out loud that
  both its drawings have no requirement. The placement decision was then
  read off a run instead of argued, and the record could say so.
- Six isolations, each breaking one thing, and three of them fell on seam 2
  alone. That is the first time the seam split showed up in the isolations
  rather than only in the drawing, and it is better evidence that the two
  seams are two promises than anything the page could claim.

## Learned

- Two tests failing on one break is not always a weak test. Dropping the
  guard that treats `none` as naming nothing reddened seam 1's grammar and
  seam 2's silence, because the fixture that proves the rule quiet also
  carries a `none` line. The tests share a fixture, not an assertion, and
  the isolation that told them apart was the one that moved the rule below
  the early return: it reddened seam 2 and left seam 1 green.
- A finding's wording is free, and free is where a defect no wall can see
  lives. The stand-in's message opened with the rule's own name while the
  command already prints `<task>: <rule>: <message>`, so the line read
  `principles: principles: no ...`. It was found by reading printed output
  during an isolation, not by any test, and the only fix available to a
  drawing was to say it in Fixed and free.
- The module orders its rules by what each one reads, and nothing but a
  comment says so. A rule that needs only the page must sit above the
  orphan return and a rule that needs the requirement must sit below it;
  that is structure carried by line number, and the second architect to add
  a rule will rediscover it the same way I did.

## Lacked

- No word in the skill for a drawing whose criteria are mostly text. Five
  of six rows read `none` and the table is honest, but a reader counting
  `none` rows cannot tell a task that was under-designed from one that is
  mostly prose, so the drawing had to say it twice, once in the table and
  once in the handoff.
- Nothing about a build that owes a fixture to a closed unit. A sixth rule
  in `RULES` reddens `tests/drawings.test.mjs` until a sixth fixture root
  exists, which is a real obligation on the developer that no section of
  the template has a place for; it went into the handoff because there was
  nowhere better.

## Longed for

- A computable link between a page and the tree it describes. This drawing
  leaves two agreements honoured by a reader: the wall's hardcoded path to
  the principles directory against the skill's prose about where principles
  live, and the skill's own citation of a principle by name. Both are the
  same hole, and it is the next task.

Feeds: architect
Read: test
