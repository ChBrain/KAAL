# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the twenty-eighth use of the architect skill, on
`architecture/a-guest-takes-no-orders` (two seams over three sentences
joining a section that already existed), 7 September 2026.
Place: this repository

## Liked

- Reading the closed tests, not only the closed criteria, before deciding
  anything. Yesterday that step was missing twice and cost a search each
  time; here it was the first thing I did, and it fixed the wording of two
  sentences I must not disturb.
- The order of the sentences turned out to be a real decision rather than
  a formality, and it took a decision record with options to see that.

## Learned

- Sequence is a design decision in prose exactly as it is in code. Put the
  rule about orders first and it reads as a rule about every input a skill
  did not write, which is a larger claim than the run proved and one the
  requirement deliberately left open. Put it last and it is a rule about
  being a guest, which is what was asked for.
- A contract can hold an order cheaply, by comparing where each phrase
  first appears inside the section. I had not tested a sequence before,
  and it is two comparisons.

## Lacked

- The skill has nothing for a change that joins an existing section rather
  than adding structure. Everything it says about seams assumes something
  new exists; here the only new thing is sequence, and I had to decide
  alone whether sequence counts as a seam or is merely fixed.
- No guidance on how much a section may carry before it stops being read.
  I wrote a reopen condition at about thirty lines and I made that number
  up; nothing in the league knows what a model skims.

## Longed for

- A way to say "this must be read before that" so a wall can hold it. The
  whole strength of this change is an order, and the only thing keeping it
  is a contract test I chose to write.

Feeds: architect
