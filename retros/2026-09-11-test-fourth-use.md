# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fourth use of the test skill, writing the three suites and giving
the plans their suites, 11 September 2026. One hundred and thirty cases named.
Place: this repository

## Liked

- The documents are readable, which was the whole argument for the block. One
  hundred and thirty cases, one to a line, each with the sha of the file it
  names, across three pages a person can open.
- The seeding is one act and not a rule. The globs that used to be the plans'
  standing claim were run once to say what exists, and from here the suites are
  the tester's to split and regroup.

## Learned

- `--write` made six of its own pins stale in one pass. It pinned each plan to
  its suite and then wrote shas into those suites, so three `suites:` pins and
  three `parent:` pins were `review-needed` the moment it finished. A second
  run cannot settle it, because a pin awaiting a review is exactly the one
  `--write` may not touch, so a tool that writes left work only a person can
  clear. It should reach a fixed point or say it has not.
- The units suite names six cases where its wall runs twenty-seven. Twenty-one
  sit under `tests/` and a suite may not name one there, so the plan now
  visibly covers a fraction of what the wall it is about runs, and nothing
  checks the two agree. That gap was an argument this morning and is a number
  on a page tonight, which is the suite layer doing the thing it was for.
- A review ripples upward, because a plan pins its suite's whole file and a
  suite's whole file holds its own reviews block. A case moved, the suite read
  it, and recording that read changed the suite's page, so the plan owed a read
  of a suite whose content it does not care about. Two hand written lines for
  one case moving, and the upper one is pure ceremony: a plan's claim is which
  suites it uses and that did not move. The tree had never met this because no
  whole-file pinned artefact carried a reviews block until tonight.
- Two entries for one key in a reviews block and the parser keeps the last
  without a word. I prepended a review instead of replacing one and the older
  line won, so a clearance that named the right sha was simply not read. That
  is the same silent drop the sub key pattern was widened to stop, in a
  different part of the same parser.
- Criterion 1 went green on a page and the other six wait on a wall. Writing
  the documents proves the tree can hold them and proves nothing about whether
  anything reads them, which is the honest half of a diff that lands pages.

## Lacked

- No word for a document seeded once and kept by hand after. When a task adds
  an acceptance case, nothing adds it to the suite, and the finding that will
  say so is in the next diff rather than this one.
- Nothing says what a plan owes its wall. A plan picks suites and a wall runs a
  command, and today those two can name different sets with no finding
  anywhere.

## Longed for

- A `--write` that runs until nothing moves. Today's six reviews were caused by
  the tool and cleared by a person, which is the wrong way round.
- A pin that names the part of a suite a plan actually depends on, so that
  reading a case does not oblige a read two levels up. Today it is the whole
  file, and the whole file includes the record of every read.
- A parser that refuses a duplicate key rather than keeping one of them.

Feeds: test
Read: code
