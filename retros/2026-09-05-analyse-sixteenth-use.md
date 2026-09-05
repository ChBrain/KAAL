# Retrospective: 4 L's

Human-reported: Kai ran the analyse skill on the `json-flag` fixture in
two runtimes from his phone and pasted the outputs and readings; this
retro reads the two records.

Period: the sixteenth use of the analyse skill, two hand-made evals on
`skills/analyse/fixtures/json-flag` (google-gemini-3-1-pro, perplexity-best),
5 September 2026.

## Liked

- Both runtimes produced the pair, proof and want, with the three Handoff
  lines and the timeout that landed in analyse-v2 this morning; the text
  travels.
- Both readers flagged, on different items, and both readings were right.
  The fixture found two gaps in one afternoon.

## Learned

- One model wrote "JSON" into the goal; the skill says "not how" for the
  goal and the model still named the format there while surfacing it
  correctly as an assumption below. The goal rule needs the format named
  as the example of a how.
- One model numbered its criterion and not its test; "numbered to match"
  reads as a property of the list, not of each test's name.
- One model promised the red run ("not yet recorded") instead of
  recording it, and wrote a sixth criterion whose test needed a filter the
  ask never named. Thoroughness extended the ask; the skill's "enlarging
  it is not" sits in section 1 and the model was in section 3 by then.
- A runtime that fronts several models needs a name in the record that is
  true to what it showed; `perplexity-best` is an auto-routed choice, and
  the record says so.

## Lacked

- A sentence in section 3 that a test's name begins with its criterion's
  number.
- A sentence in the Goal rule naming the output format as the kind of
  "how" that does not belong there.
- A red-run rule that refuses "not yet recorded" in so many words.

## Longed for

- A second runtime that passes, so a move climbs; and the workflow with an
  endpoint, so a rerun costs a comment.

Feeds: `analyse`.
