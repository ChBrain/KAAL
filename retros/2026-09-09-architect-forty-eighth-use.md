# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the forty-eighth use of the architect skill, on
`architecture/an-artefact-traces-what-it-came-from` (four seams: the trace
read from a page, the kind resolved against a table, the prose that must
carry the names, and the command's answer), 9 September 2026.
Place: this repository

## Liked

- Six isolations and two of them fell on one seam alone: ignoring an unknown
  kind reddened seam 2 only, and dropping the prose check reddened seam 3
  only. That is the separation the four seams claim, shown rather than
  asserted.
- The stand-in was three files and came back green on the first run, because
  the drawing had already fixed the three cases `readTrace` keeps apart. The
  hard thinking was done on the page and the code was transcription.

## Learned

- A namespace import saves a module that is missing an export. It does not
  save a module that does not exist. The first run of the contract file
  failed to load and printed one red for four seams, which is exactly the
  failure the namespace import was chosen to prevent, and my own retro had
  named this before. The fix is an import inside each seam, awaited, with
  the module's absence as that seam's own assertion.
- Reading a past retro is not the same as applying it. I quoted the rule
  about namespace imports in this session and then wrote the top level
  import anyway. What would have caught it is running the red before
  believing the shape, which I did, one step later than I should have.
- A one letter fixture name is a trap. Task `t` is inside "something-else",
  so the prose check passed on a letter rather than on a name. Every fixture
  name is now long enough that none is a substring of another, and the test
  says so where the next reader will look.
- A heading does not wrap. Writing a long decision title across two lines
  made two `###` headings and the drawings wall said nothing, because it
  counts `##` sections and not `###` records.

## Lacked

- No word in the skill for a drawing whose diff is mostly migration. 103
  artefacts gain a block and none of it is risk; the Structure section lists
  it beside the module that carries all of it, and a reader counting parts
  cannot tell the two apart.
- Nothing about a criterion held by one wall on the day it lands and by a
  different one afterwards. Criterion 1 asks that every artefact has a block;
  once migrated, what keeps it true is criterion 5's finding. The handoff had
  to explain that in prose because no section is for it.

## Longed for

- A check that a decision record's title is one line. The wall reads the six
  `##` sections and never looks inside Decisions, so a record split in two is
  invisible to it and obvious to a reader.

Feeds: architect
Read: test
