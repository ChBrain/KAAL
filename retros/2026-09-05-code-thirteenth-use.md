# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the thirteenth use of the code skill, on `architecture/analyse-v2`,
5 September 2026.

## Liked

- The build was four bullets, one paragraph and three template lines; the
  stamped fixture ran through the wall and proved the new lines harmless
  in one spawn.

## Learned

- The analyst's and the architect's tests for this task were red for the
  wrong reason: a section helper matched an empty section at the blank
  line after a heading, so every text check failed whatever the text
  said. The stand-in rule the skill carries would have caught it; it was
  skipped for "text criteria", and the build paid for the skip with three
  rounds. Text criteria need the stand-in most.
- A sentence a test reads must not break across a line where the test
  expects three words together; write the sentence so the words stay on
  one line, or the test reads with `\s+`.

## Lacked

- The stand-in, as above.

## Longed for

- The template stamped by a script.

Feeds: `code`.
