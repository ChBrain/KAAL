# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the forty-second use of the code skill, building
`a-drawing-shows-its-ground` against its five acceptance tests,
7 September 2026.
Place: this repository

## Liked

- The isolation that reddened nothing was the most useful run of the build.
  Three assertions in one test were held by words in the sentence that
  explains why the rule exists rather than by the rule, and the rule could
  be deleted with two of the three still green. Nothing else in the process
  would have found it: the stand-in was green, the full run was green, and
  the criterion reads correctly on the page.
- The same defect twice in two builds meant the second was cheap. Criterion
  5 carried a count of zero here for the reason it carried one in
  `a-requirement-shows-its-work`, and the correction was written in ten
  minutes because the shape was already known and already on a page.

## Learned

- A weak isolation reads exactly like a strong test. The first attempt broke
  half a sentence, left the other half standing, and the run came back with
  nothing red. That looked like a test not holding its half and was in fact
  an isolation not doing its job, and the two are told apart only by
  breaking the whole rule and then each part of it in turn. An isolation
  that reddens nothing is a question, not an answer.
- The explanatory sentence is where a text test goes wrong. A rule states
  itself and then says why, and the why repeats the rule's own words, so any
  pattern read across the whole bullet is satisfied by the half that is not
  the rule. Three times this week now: `forecloses` matched `closes`, the
  Decisions bullet already said `task`, and the reason a table carries its
  empty cases already said `empty` and `table`. The fix each time was to
  find the rule's own sentence first and read only that.
- A criterion this task adds can convict a criterion this task carries.
  Criterion 4 forbids a contract to assert a count it did not compute, and
  criterion 5's test asserted a count of zero. Writing the rule was what
  made the defect legible.

## Lacked

- Nothing in the acceptance tests can name a section or a sentence, so every
  test folds a document, matches a pattern, and is only as honest as the
  slice a human remembered to take first. Two builds in a row have hand
  rolled the same sentence splitter, and both found a defect with it.
- The retro asked for by the analyse skill's own loop is filed by the seat
  that acted, so the architect skill collects nothing when the code seat
  builds against it, and this build touched the architect skill in five
  places.

## Longed for

- A helper the acceptance tests share: give it a heading or a rule's first
  words and it returns that region alone, failing loudly when the region is
  not found rather than matching the rest of the page. Every
  green-for-the-wrong-reason this week dies at that helper.

Feeds: code
