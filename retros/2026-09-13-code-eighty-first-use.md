# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the eighty-first use of the code skill, building the refusal that
names whose path it reached, 13 September 2026.
Place: this repository

## Liked

- Seven mutations, seven kills, each on the contract that owns it. The
  finding forgetting the owner, a path nobody owns saying nothing extra, the
  block losing the lane, the block answered with nobody to ask, the block
  naming only the first seat owed, the block sent into the owner's tree, and
  the command never printing it. Not one of them survived.
- The whole build is one branch in a loop, one field on a return and one line
  in the command, and the closed tasks that read this finding came back
  twenty-four green without a word changed in any of them. The drawing
  measured that blast radius before a line was written and it was right.

## Learned

- **A mutation that fails to apply looks exactly like a mutation that was
  killed.** The first attempt at the owner mutation was a perl expression
  that died on a compilation error, and the run after it printed a red
  contract for a completely different reason: the file was untouched and the
  contract had never gone green in that shell. Nothing in the output said the
  edit had not happened. The habit that caught it was reading the error
  rather than the verdict, and the fix was to make every mutation assert its
  own site before replacing it.
- Sorting the seats owed by the chain was free and worth taking. The seat
  lines are already ordered by the declaration, which is the order work
  travels, so the block naming two seats reads in the same order as
  everything else in the answer. It cost one shared comparator and it means a
  reader never meets two orderings in one block of output.

## Lacked

- A way to run one mutation and see it applied. Every mutation here was a
  string replace against a file, checked by eye, and the one that silently
  did nothing was found by the shape of its error rather than by anything
  refusing.

## Longed for

- A finding that is fields rather than prose. Three closed criteria read this
  line by substring, which is what made the words safe to add, and it is also
  what makes the front of the line hard to change: the same property twice,
  read from either end.

Feeds: code
Read: architect
