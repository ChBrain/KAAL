# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the eighth use of the test skill, giving a unit a red wall of its own,
12 September 2026.
Place: this repository

## Liked

- The fix lands before the change that would have broken it, and it is green
  on both sides. Nothing red ever stood on `release`, which is the second time
  today the order of two diffs was the whole of the work.
- The fixture says what it is for in its own first line. A file whose entire
  purpose is to fail is a file somebody will try to fix.

## Learned

- A unit resting on another task's redness is a unit with a hidden dependency
  nothing declares. `tests/gates.test.mjs` proved that a red nested suite
  stays red by running `requirements/push-v1/acceptance.test.mjs`, which was
  red because nobody had delivered it. Two models passed a fixture this
  morning, `push-v1` went green, and the unit went green with it and stopped
  proving anything.
- The wrong kind of green is the dangerous one. The unit did not fail when its
  premise disappeared; it passed, for a reason that has nothing to do with
  nesting, and only the skill diff that delivered `push-v1` made it fail at
  all. A test that borrows its red from elsewhere goes quiet exactly when the
  elsewhere improves.
- The fixture could not go where the others are. `architecture/gates-v1/
fixtures/` holds this unit's trees and it is the architect's, so a red suite
  put there would be two lanes. `tests/fixtures/` is this seat's, the units
  glob is one level deep and never runs it, and the suite wall excludes a
  `fixtures/` directory by name.

## Lacked

- Any way to see that a test depends on another task's state. Nothing in the
  tree reads a command a unit builds, so nothing could have said this one was
  pointing at a requirement whose colour was not its business.

## Longed for

- A rule that a test names no path outside its own tree and its fixtures.
  Every one of the twenty-one units still in this lane is a candidate for the
  same mistake, and moving them is the next item.

Feeds: test
Read: code
