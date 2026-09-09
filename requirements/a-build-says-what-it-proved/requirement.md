---
traces:
  supersedes: nothing
---

# Requirement: a-build-says-what-it-proved

_Written in analyse mode, from a stack. Thirteen unconsumed retros on the
code skill, over the league's rule of ten and the third stack read this way
today: recurring Lacked items are criteria, a single one that names a defect
is a criterion of its own, Longed for items are open questions, and Liked
items are what the next version must not lose. Every one of the thirteen was
filed by the seat that built something, and every criterion below is about
what that seat says when it is finished._

## Goal

Whoever reads a finished build wants to know what its green established and
what it did not, so that a task can be trusted without rerunning it and a
weak proof is visible rather than implied; they will know it by the handoff
carrying the change class the tooling computed, by a proof that completes
somewhere else saying so and where, by a change to a shared reader carrying
the sweep it owes, by a record corrected in place rather than rewritten or
handed back whole, and by a supersede the analyst missed being looked for
rather than stumbled on.

## What the runs said

- `node bin/kaal.mjs retros` answered `code: 13 unconsumed` before the
  archive in this change, and the thirteen are `2026-09-07-code-thirty-second-use.md`
  through `-forty-fourth-use.md` with no gaps.
- The change class appears in three of them, the thirty-fifth, thirty-sixth
  and thirty-seventh. The thirty-fifth says the skill has asked for a class
  since before the wall was drawn and "this is the third build that has had
  to answer it with nothing computes this yet". The thirty-sixth wants it
  "in the handoff of the next one". The thirty-seventh reports the wall now
  computes it and "the handoff has nowhere fixed to put it. I wrote it into
  the commit message, which is where a reader will look last".
- A proof that completes elsewhere appears in three: the fortieth ("no word
  for a build whose proof is stronger on one runtime than another"), the
  thirty-ninth ("nothing says a build may need to commit before its proof
  runs" and a Longed for asking for "a word in the handoff for a proof that
  reads history rather than the tree"), and the forty-fourth ("nothing
  distinguishes a green that proves a behaviour from a green that proves a
  file's text").
- The sweep a new rule owes appears in two, the thirty-third and the
  thirty-eighth, the second with a Longed for naming all three of its parts:
  the fixtures a test counts owe the fix, the fixtures a record's sha pins
  do not, and the generated files are regenerated with the repository's own
  tooling.
- Correcting a record in place appears once, in the thirty-sixth, in both
  Lacked and Longed for. It names a defect: "handing back a whole drawing
  for a sentence is the wrong size of response. I corrected the record in
  place and said so; the skill has no name for that."
- A supersede the analyst did not name appears once, in the thirty-ninth,
  and names a defect: a closed contract caught it, and "had that seam been
  held by a manual test or by nothing at all, the claim would have stayed
  in the tree contradicting a merged drawing, and no wall would have said
  so".
- `node bin/kaal.mjs class` answers today, which is what makes the first
  criterion buildable; the three retros that asked for it were written while
  it could not.
- Section 5 of the skill already asks the handoff to name "the change class
  the repository's own tooling computes (never a class you chose)". It names
  the contents in one sentence of prose and fixes no shape, which is why a
  seat with a class to report put it where a reader looks last.

## Assumptions

- The seat is not asked to judge its own proof harder, only to say what it
  already knows. Every one of the three retros about a proof completing
  elsewhere had the fact in hand and no place to put it; two of them put it
  in a pull request body, which no wall reads and no next seat is handed.
- The handoff gains a fixed shape and does not gain a template file. The
  analyse and architect skills carry theirs as a file a seat copies; this
  seat's handoff is a paragraph in a change record and the shape belongs
  where the rule is, in the skill's own section 5.
- The sweep is guidance and not a wall. A wall that knew which fixtures a
  record pins would have to read the records, and the ask is that a
  developer knows where to look rather than that a command refuses them.
- Looking for an unnamed supersede is bounded by what the change touches.
  The thirty-ninth found one by running the board, which is the cheap case;
  the criterion asks for the closed tests the change touches to be read,
  not for the whole tree to be audited.
- Nothing here weakens the stand-in, the isolation, or the rule against
  editing another seat's test. Those are the Liked items across the stack
  and every criterion below adds a sentence to the handoff or to the build's
  own reading.
- Nothing here gates. Every criterion is text a reader honours, the shape
  the last two stack runs took, because the ask is about how a seat works.

## Constraints

- The skill's rules apply to its own text: MIT, the standard's shape, no
  vendor or product named, no en-dash or em-dash, under five hundred lines.
- Section 5 keeps its name and its place, and the sentence it already
  carries about the class stays true.
- The change is text. No command changes behaviour and nothing under `bin/`
  moves.
- The words the tests read are fixed in the criteria below.

## Acceptance criteria

1. Section 5 fixes the handoff's shape as a list of named lines rather than
   a sentence of prose, and one of those lines is the change class the
   repository's own tooling computes.
2. The skill says that where a build's proof completes somewhere other than
   the run the seat just made, the handoff names what is still unproven and
   where it completes, and names the cases: another runtime, a job that runs
   after the merge, and a proof that reads history rather than the working
   tree.
3. The skill says a change to something several seats read carries its
   sweep, and names its three parts: a fixture a test counts owes the fix, a
   fixture a record's sha pins owes nothing because moving it breaks the
   record instead, and a generated file is regenerated with the repository's
   own tooling and never by hand.
4. The skill says a record whose reasoning is wrong in one sentence is
   corrected in place and marked as corrected, and says what separates that
   from handing the drawing back, which is for a shape that does not fit.
5. The skill says the build looks for a supersede the analyst did not name,
   by reading the closed tests its change touches, and that the handoff says
   what it found or that it found none.
6. The thirteen retros this run consumed are under `retros/archive/`, none
   of the thirteen is still live under `retros/`, and `kaal retros` counts
   the code skill's unconsumed retros as the tree holds them.

## Open questions

- The same document reader has now been hand rolled in three builds. A
  helper that takes a heading or a rule's first words and returns that
  region alone, failing loudly when the region is absent, is asked for by
  name in the forty-second and would have caught every
  green-for-the-wrong-reason of the last two days.
- An isolation restores from a copy taken before the first break, and the
  forty-first asks for that to be a thing rather than a habit, after
  `git checkout` on a path threw away a whole uncommitted build.
- Nothing checks that a task named on the surface page is a directory under
  `requirements/`. The thirty-fourth calls it one line and says it would
  make the citations load bearing rather than decorative.
- Nothing compares what two drawings landing together say they fix, so two
  tasks may fix the same words in two ways and only a reader would notice.
- There is no way to hand a missing sentence to the analyst without opening
  a task, so "the readme should say how to install this" is either scope a
  seat invented or silence.
- Two pull requests in different lanes with an order between them are
  recorded nowhere, which the thirty-sixth met and this session met again.
- The read count has nowhere to go, and which of its reads a seat should
  name is a judgement the rule does not help with. Both are the
  forty-third's, both are known, and both wait on a rule about what a read
  fires.

## Handoff

- Task: a-build-says-what-it-proved
- Criteria: 6; tests: 6 (equal)
- Red run: `node --test --test-timeout=60000 requirements/a-build-says-what-it-proved/acceptance.test.mjs`
- Tests: `acceptance.test.mjs`, beside this file; they read the code skill's
  text with whitespace folded, because the formatter wraps where it likes,
  and each reads the section its criterion is about rather than the page
- Retros consumed, all thirteen, which move to `retros/archive/` in this
  change: `2026-09-07-code-thirty-second-use.md` through
  `-forty-fourth-use.md`
- Green before the build: none. Criterion 6 is this change's own act and
  would be green the moment it lands, but the acceptance tests land with the
  requirement and the archive lands with them, so it is red on the run
  recorded here and green from the merge onward
- Open questions: 7, listed above
- Status: closed
- Blocked on: nothing
- Unblocks: nothing
- Supersedes: nothing. Section 5 already asks for the change class and
  criterion 1 fixes where it goes, which adds a shape rather than moving a
  claim
- People: none
