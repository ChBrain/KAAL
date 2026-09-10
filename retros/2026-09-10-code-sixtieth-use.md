# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the sixtieth use of the code skill, building `a-pin-says-who-cleared-it`
from its drawing: a review state beside every pin, a moved pin that answers
instead of refusing, and a report that counts an unread pin against the task,
10 September 2026.
Place: this repository

## Liked

- Four readers were walking the same three directories in the same order and
  this would have been the fifth. Extracting `artefacts(root)` first made the
  new module three lines of walking instead of thirty, and the two hundred
  contract tests said in one run that the extraction had cost nothing.
- The cycle between `traces.mjs` and `reviews.mjs` is narrow enough to
  describe in a sentence: one asks for the grammar of a trace and where each
  kind lives, the other for a state and for what `--write` may touch. Every
  binding either side uses is a hoisted function called at run time. Writing
  that sentence down was the test of whether the cycle was acceptable.
- The verdict gained a fifth parameter with a default that reads the task off
  the record, so the contract that calls it with four arguments never noticed,
  and the two callers that know the task pass it. A signature that widens
  without moving anything is worth the ten seconds it takes to find.

## Learned

- Seam 1's findings had nowhere to go, and six green contracts did not say so.
  The drawing gave seam 1 findings and seam 3 lines and never named the reader
  that collects the first, so `readReviews` reported a fifth state to nobody.
  All six contracts passed and the acceptance suite stayed red on it. A
  contract proves a seam; it cannot prove a wiring, because the wiring is
  exactly what a contract replaces with a direct call.
- The answer was already in the tree: a malformed review is a finding about
  the page the trace wall is reading, in the shape that wall already uses, so
  it goes there rather than into a second place to look.
- A wall that stops refusing has to keep saying what it used to say. The
  superseded task still wants the region named and the word moved, and the new
  one wants the state, so the line carries all five and only the exit code
  moved. Cheaper than it sounded, and the check was running its suite.
- Putting a unit beside its code moved the units plan from 24 to 25, which is
  the shared count again, third time this week. It is landing in the same diff
  this time, which is the only reason it is not a red board.

## Lacked

- Nothing in a drawing says where a seam's output goes. Each seam names both
  its ends, and the end that says "the trace wall" is a place and not a
  caller, so a seam can be built, contracted and green while nothing calls it.
  The strategy table is where that would show, and it asks about layers.
- No cheap way to see a module's imports as a graph. Deciding whether the
  cycle was acceptable was a read of two files and a paragraph of reasoning,
  and it would have been one picture.

## Longed for

- A wall that fails a seam nothing calls. It would have caught this in the
  same minute the module was written, and it is a real wall rather than a
  wish: the drawing names the exports, and grep knows who imports them.
- The scratch tree helper, again. Both suites this task touched build the same
  trunk with the same comment, and the build wrote a third copy inside its own
  head before deleting it.

Feeds: code
Read: architect
