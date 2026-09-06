# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the twenty-seventh use of the code skill, on the build of
`asks-when-not-told` (one checklist item, one regenerated runner page), 6
September 2026.
Place: this repository

## Liked

- Three seats on one branch meant the red run and the green run were the
  same command, and the diff is small enough to read in one screen.

## Learned

- The renderer's line filter is a real hazard, not a detail. An item
  written as a paragraph would have passed the acceptance test and never
  reached the reader, and the record would have come back marked against a
  checklist that did not carry it. The contract caught a shape that is
  invisible in the file.

## Lacked

- No unit layer, two builds running. Both were text, both were held by
  contract and acceptance tests alone, and the skill still reads as though
  every build has source.

## Longed for

- The eval rerun inside the same change, so a new checklist item is not
  only present but seen to be judged once. Today the item lands and the
  record that would exercise it is stale and waits for a person.

Feeds: code
