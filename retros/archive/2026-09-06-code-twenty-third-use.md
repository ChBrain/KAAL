# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the twenty-third use of the code skill, on
`architecture/nothing-stale` (four sentences, the sweep and the runners
wall), 6 September 2026.

## Liked

- The wall's first run caught its own build. The analyse skill grew three
  sentences in this same change, which moved its `skill_sha` and made
  `skills/analyse/fixtures/json-flag/RUNNER.md` stale; the unit test went
  red on the league's own tree before the board ever ran. That is the
  whole argument for the wall, paid on the day it landed.
- The drawing said `bin/lib/runner.mjs` does not change, so the sweep is
  twenty lines in the dispatcher calling `renderRunner`, and the unit
  tests drive the command rather than a new export. Staying inside the
  drawing was cheaper than the extraction would have been.

## Learned

- A wall that reads generated files must be built together with a
  regeneration in the same change, or the build is red for a reason the
  developer caused and the board cannot explain. The `fix` line on the
  gate names the command that cures it.

## Lacked

- Nothing new.

## Longed for

- A `--write` sweep beside the `--check` sweep, so a skill edit and its
  runners land in one command instead of one per fixture.

Feeds: `code`.
