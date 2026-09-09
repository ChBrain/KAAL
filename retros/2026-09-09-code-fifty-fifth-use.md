# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifty-fifth use of the code skill, on
`requirements/the-test-tree-is-written-down` (six criteria, five seams, a new
module and the league's first parent edges), 9 September 2026.
Place: this repository

## Liked

- The unit tests earned their place. One of them found that both directions
  of criterion 4 printed under the same kind, and since a plan is usually
  named for its wall, `acceptance` the page and `acceptance` the wall printed
  the same prefix meaning different things. No seam could see that and no
  criterion asked; the wall side has its own kind now because a unit test
  looked at the strings.
- The tool's own writer found the tool's own bug. Nothing in this league had
  ever declared a parent, so nothing had ever asked `writePins` to write one,
  and it had been passing the wrong tree to `regionSha` since the day it was
  written.

## Learned

- The requirement page is not the requirement. I read its Assumptions and its
  Open questions and drew a layout and a grammar from them, and both were
  already settled in the acceptance tests I had not opened: criterion 3 says
  `tests/plans/`, and criterion 6's test reads a backticked glob and a number
  before the word suites. A criterion's meaning is pinned in its test, and an
  assumption is the analyst thinking aloud. The drawing overruled a proof it
  had not read, and the build spent an hour putting it back.
- Worse than reading the fixtures late: I wrote over them. Three of the
  analyst's fixture roots were already complete, and I generated my own
  grammar into them before looking. Nothing stopped me and nothing would
  have: this diff touches all four seats at once, and the seat that writes
  the proof and the seat that makes it pass are the same hands here.
- The fixtures, once read, settled two things the drawing had guessed. A wall
  is named `Wall:` in a sentence and not only as a field, and a plan that
  states no number states no count and is not a finding. The second is the
  trace grammar's own rule arriving in a new place: a name without a pin
  resolves, and a pin that disagrees is the finding.
- A place is two things and the second half had never run. Listing a place's
  artefacts and resolving a name inside it are different questions, and for a
  place of loose pages the second answered a directory that cannot exist.
  Three separate defects in this build came from that one half being
  unexercised: the resolution, the writer's missing argument, and a closed
  test that read a parent's raw value with its pin still on it.
- Two closed tests were stricter than the criteria they prove, and both had
  been green for weeks because nothing exercised them. One read a pin as part
  of a name. The other counted every `none` in the league and expected one,
  which is its criterion's first sentence, while its second sentence says a
  further root is allowed and argues. A test written from half a criterion
  passes until the other half happens.
- Running the tree's own writer produces a diff on artefacts nobody touched,
  because it pins everything it can resolve and two drawings had no pins. I
  reverted them twice to stay in lane and put them back the third time: a
  tree where `kaal traces --write` is not a no-op is a tree that is not
  settled, and lane discipline that leaves it unsettled is discipline about
  the wrong thing.

## Lacked

- Any wall between the seats. Requirements, architecture, test and code all
  travel in this one diff, so the hand that writes the proof and the hand
  that makes it pass are never separated. The fixture I overwrote is what
  that costs when it is an accident, and it is the same door a build would
  walk through to make a red criterion green by editing it.
- No rule that a build reads the acceptance tests before the drawing is
  drawn. The drawing's own template asks for what the runs said, and the
  runs I did were greps over the tree rather than a reading of the proof
  that the tree already held.

## Longed for

- A lane guard, the way the sibling repository has one: a diff that changes a
  requirement and the code that answers it is two diffs, and the tool should
  say so rather than a person remembering.
- A wall that says a rule has never fired. Three defects here were in code
  that was green because no input had ever reached it, and the second retro
  in a row has asked for this.

Feeds: code
Read: analyse
