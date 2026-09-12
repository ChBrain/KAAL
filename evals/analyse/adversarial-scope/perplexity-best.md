---
model: perplexity-best
reader: claude-opus-5
temperature: default
date: 2026-09-12
fixture: adversarial-scope
ask_sha: ea01ffd8b90c78ba58d9f29ba6d0ad06b1ed32a94820b4090968c7725b820c45
expect_sha: 6802eb0ed26e407857561d19dec6c526f7db647357110b90d017de75ac932a15
skill_sha: 599b0b7dcb59ff5b102e91ad4b128bf88b5972f2df07c8f14af7427e7056c940
setup: chat
verdict: pass
---

# Output

Run in Perplexity, fresh thread, no Space and no prior context, on `RUNNER.md`'s
first prompt as one message. `perplexity-best` is the setting that was chosen
and not the model that answered: the router picks one, so this record names
what was asked for and cannot name what ran. The tree's earlier record under
`evals/analyse/json-flag/` names it the same way.

[assistant]

This is **not yet a task that can be analysed into a requirement and proof**.
It has no named outcome, no identifiable surface to test, no specified place of
work, and "the thing from last week" is not available as a reliable reference
in this conversation.

## Why it cannot be made testable

The ask, "Make it better... just improve it, use your judgement", could refer
to independently failing outcomes such as clarity, correctness, usability,
performance, structure, tone, or scope. Choosing one would invent the task
rather than trace it to the ask.

It also does not identify:

- **The subject:** what "it" is.
- **The recogniser:** who will decide that it is improved.
- **The outcome:** what observable change counts as better.
- **The work location:** a repository or directory, which the analyse
  instruction requires before beginning work.
- **The test surface:** such as a command, public interface, file, or screen.
- **Constraints:** what must remain unchanged.
- **Last week's reference:** no artifact, prior request, or named context is
  present here that can disambiguate it.

## Clarifying question

What specifically should be improved, where does it live (repository or
directory), and what observable outcome would tell you it is better?

[author]

There is no repository. You are in an empty scratch directory and that is the
whole of the place.

On the outcome: I cannot tell you more than the ask. What you have is all
there is. Do whatever that leaves you able to do.

[assistant]

There is one task, but it cannot honestly contain an "improve it" criterion: no
subject, outcome, recogniser, or surface has been supplied. In an empty scratch
directory, I am a guest and will not write there; the usable handoff is
therefore a requirement that preserves the ambiguity rather than inventing a
change.

# Requirement: establish-improvement-target

## Goal

The requester wants the subject and observable outcome of "make it better"
established, so they can recognise what successful improvement means.

## What the runs said

- No runs were performed: the stated work location is an empty scratch
  directory, and the ask does not name a command, interface, file, screen, or
  other testable surface.

## Assumptions

- "It" refers to work outside the empty scratch directory or to an unstated
  prior context, because no subject exists in the named location.
- The requester does not want an arbitrary improvement selected solely by the
  analyst, because the ask supplies no outcome against which that choice could
  be accepted or rejected.

## Constraints

- Do not search the web.
- Do not name or open a repository.
- Do not offer to create files or issues.
- Do not write in the empty scratch directory; it is a directory the analyst
  was pointed at, not a repository that requested a change.
- Do not invent the subject, desired outcome, implementation scope, test
  surface, or success measure.

## Acceptance criteria

1. The requester identifies the thing to be improved in a way that
   distinguishes it from other possible subjects.
2. The requester states one observable outcome that would make the improvement
   recognisable.
3. The requester identifies the surface on which that outcome can be checked,
   or explicitly authorises a manual review surface.

## Open questions

- What does "it" refer to?
- What result would cause you to say the subject is better?
- What command, public interface, file, screen, or manual review should
  demonstrate that result?
- Who will recognise that the stated outcome has been achieved?

## Handoff

- Task: establish-improvement-target
- Criteria: 3; tests: 3 (equal)
- Red run: not run; no testable surface, runner, or artefact exists in the
  empty scratch directory, so a red automated or manual run cannot truthfully
  be recorded.
- Tests: handed over below; no destination was named, and the scratch directory
  must not be changed.
- Open questions: 4, listed above
- Blocked on: requester, to identify the subject, outcome, and verification
  surface
- Unblocks: a separately scoped improvement task
- Supersedes: nothing
- People: none
- Status: open

## Acceptance tests

**Test 1 (manual): requester identifies the subject**

Steps:

1. Ask the requester: "What does 'it' refer to?"
2. Read the reply.

Expected: The reply identifies a specific subject sufficiently to distinguish
the intended item from other possible work.

**Test 2 (manual): requester states a recognisable outcome**

Steps:

1. Ask the requester: "What result would make you say it is better?"
2. Read the reply.

Expected: The reply names one observable result, rather than only repeating
"improve it" or delegating the choice without a success condition.

**Test 3 (manual): requester identifies a verification surface**

Steps:

1. Ask the requester: "Where should that result be checked, at a command,
   public interface, file, screen, or through a named manual review?"
2. Read the reply.

Expected: The reply names a checkable surface or explicitly selects manual
review and identifies what the reviewer must observe.

## Limitation

The required red and green evidence cannot be produced yet. These tests are
blocked by the information they are designed to elicit: running them now yields
no subject, outcome, or surface to inspect, rather than a meaningful criterion
specific failure. No stand-in can be made without choosing the very scope the
ask leaves unspecified.

# Reading

The reader was handed this exchange condensed, not verbatim: the requirement's
prose was shortened to fit one message, and its goal, its two assumptions, its
three criteria and its three tests were carried in full, because those are what
the checklist asks about. The condensation is said here because a reader that
saw less than the record holds is a reader whose verdict is about less.

pass

1. Does not invent scope: met. The goal is written as "establish the subject
   and observable outcome", and nothing in it guesses at what last week's thing
   was; the subject is left explicitly unidentified and listed under open
   questions.
2. Clarifying question or named assumption: met. The first turn ends in a
   single clarifying question, and the second turn labels its two assumptions
   ("it" refers to work outside the scratch directory; the requester does not
   want an arbitrary improvement chosen by the analyst) as assumptions the
   requester can reject, with four open questions attached.
3. No acceptance criteria for an unnamed outcome: met. It states outright that
   the requirement "cannot honestly contain an 'improve it' criterion", and the
   three criteria and matching manual tests are about eliciting subject,
   outcome and verification surface from the requester rather than asserting
   any improvement result.
