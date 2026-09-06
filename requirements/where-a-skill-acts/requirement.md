# Requirement: where-a-skill-acts

_Written in analyse mode. Ask, from Kai, in his words: "core concept is
simple: 1: skills apply in this repository, or 2: some remote directory.
On 1 the results are stored local. On 2 it needs to be discussed where
results go. 4L goes into KAAL either way to learn about the application
of the skills." The script rung of this was `applies-here`, which taught
four commands to say when a tree is not theirs. This is the skill rung: a
command can be handed its place as an argument, and a skill can only be
told by its own text._

## Goal

Whoever hands a KAAL skill a directory that is not the league's wants the
skill to know it is a guest there: to say which of the two places it is
acting in, to write nothing into a tree that did not ask to be changed,
and to file its retro in the league either way, since the retro is about
the skill and not about the tree; they will know when the five working
skills say both sentences where a reader looks, and the retro skill says
the third and carries the place in what it compiles.

## Assumptions

- The two places are the repository that holds the skill's work, and a
  directory the skill was pointed at. Which one is named by the ask; a
  skill that was not told asks before it begins, since guessing wrong is
  the expensive direction.
- In the second place the destination of the work is undecided on
  purpose. Kai says it needs to be discussed, so the skill hands its
  output over where the ask can see it and asks where it lands, rather
  than the league choosing a home for someone else's tree.
- The retro is about the application of the skill, so it lands in the
  league either way. That is not a leak: what makes a retro useful is
  what the skill lacked, and that is the league's, while the tree it was
  applied to is not.
- The retro names the kind of place, not the tree: `this repository` or
  `a directory the skill was pointed at`. A retro that names someone
  else's repository has carried their content into the league by the
  back door.
- The retros already filed do not gain the line: the criterion is on the
  template a new retro is compiled from, and a sweep of sixty files
  would say nothing the stack does not already say.
- The five working skills are `analyse`, `architect`, `code`, `operate`
  and `test`; `retro-4ls` is the sixth and is the one whose output always
  lands in the league, which is why it carries the third sentence rather
  than the first two.

## Constraints

- No skill gains a mode flag or a switch: the place is a fact the ask
  carries, and the skill's text is where a model reads it (the ladder's
  own lesson, that prose cannot take a parameter).
- The skills stay under their line budget and the standard's shape; no
  vendor, no dash (rules).
- The analyse skill's text moves, so its fixture's `RUNNER.md` goes stale
  and is regenerated in the same change (the runners wall).

## Acceptance criteria

1. Each of `analyse`, `architect`, `code`, `operate` and `test` says that
   a skill acts in one of two places, the repository that holds its work
   or a directory it was pointed at, that the ask names which, and that a
   skill not told asks before it begins.
2. Each of the same five says that in a directory it was pointed at it
   writes nothing there: it hands its output over where the ask can see
   it and asks where the work lands.
3. `retro-4ls` says the retro is filed in the league either way, because
   it is about the application of the skill and not about the tree it was
   applied to, and that it names the kind of place and never the tree.
4. The retro output format carries a `Place:` line naming one of the two
   kinds, beside the `Period:` line it already carries.

## Open questions

- Where does the work land in the second place: the caller's own
  workspace, a branch in that repository at its owner's ask, or the
  conversation alone? Kai has this open on purpose.
- Does a use of a skill on a directory it was pointed at deserve a record
  of its own, the way an eval run does, or is the retro the whole trace?
- Should `kaal runner` frame the place in its first prompt, so a model
  reading the runner page is told before it starts?
- Should the retro's `Place:` line become a field the retro reader parses
  (like a record's `setup`), so a stack can be counted by place?

## Handoff

- Task: where-a-skill-acts
- Criteria: 4; tests: 4 (equal)
- Red run: `node --test --test-timeout=60000 requirements/where-a-skill-acts/acceptance.test.mjs`;
  all four red; seen green on a stand-in copy of the six skills, then
  discarded
- Tests: `acceptance.test.mjs`, beside this file
- Open questions: 4, listed above
- Status: closed
- Blocked on: nothing
- Supersedes: nothing
