# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the eleventh use of the test skill, deleting the twenty-one from the
tester's tree, 12 September 2026.
Place: this repository

## Liked

- The board went green on the delete, which is the diff before this one's
  finding clearing exactly as it said it would. A red wall on `release` with a
  named owner and a written next diff lasted one merge.
- Twenty-one files gone and nothing lost: every one was compared against its
  copy before the copy was named, three of them merged case by case, and the
  counts are what say so rather than anybody's memory.

## Learned

- `tests/` now holds four kinds and a fixtures directory. The strategy says
  "Five kinds and no sixth" and means strategy, plans, suites, runs and bugs;
  what is actually there is the four that are built, and `fixtures/`, which
  the eighth use of this skill put there so a unit about a red wall had a red
  wall of its own. That directory is not one of the five and the page does not
  mention it.
- Nothing catches it, and two rules nearly do. `a-suite-names-its-cases`
  criterion 3 makes a case path under `tests/` a finding, and the suites wall
  excludes anything inside a `fixtures/` directory by name, so the file is
  invisible to both. The page claims five, the tree holds a sixth thing, and
  every wall is green.
- That is an ask and not a fix. Saying six on the page turns criterion 1 red,
  which asserts the word five; moving the fixture costs the unit its red wall.
  The analyst judges which, and this seat names it.

## Lacked

- Any check that the strategy's claim about its own directory is true. It is
  the page a reader meets first and the only thing reading it is a test that
  counts the word `five`.

## Longed for

- To have noticed when I put the fixture there rather than four diffs later.
  The eighth use wrote three paragraphs about where that file could live and
  not one of them asked what the strategy said the place holds.

Feeds: test
Read: analyse
