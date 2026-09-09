---
traces:
  parent: none
---

# KAAL

KHAI's Artificial Agent League.

## What it is for

Agents do work. The work arrives fast, reads well, and is easy to believe.
KAAL exists to keep that work in check, whoever built the agent and whatever
model is behind it today.

In check does not mean slowed down. It means that what an agent claims and
what is true are two different things, and that the league can tell them
apart without asking the agent.

## Why a league

A league is a set of members with different powers who agree to be bound by
something none of them wrote for themselves. That is the useful half of the
idea, and it is the half most stories skip.

The oldest problem with a league of powerful members has never been the
villain. It is the moment a member marks their own homework and everyone
agrees the work looks fine. Power plus self assessment is how a league stops
being a league and becomes a fan club.

So the first rule here is the least heroic one: **nobody grades their own
case.** Every wall runs offline, deterministically, and without asking the
thing it is judging whether it did well. A wall that consults the agent is
not a wall. It is a mirror.

## Who is in it

Five seats, each a member with one power and one lane:

- the **analyst** turns an ask into a task that can fail;
- the **architect** draws the shape and proves the seams;
- the **developer** builds what the tests already demand;
- the **tester** owns how the league knows anything at all, and keeps two
  questions apart: **verification**, whether a thing is what it was specified
  to be, and **validation**, whether it works for whoever asked. A thing can
  pass one and fail the other, and most arguments about quality are really
  an argument about which one was meant;
- the **operator** takes the finished thing into the world.

Every seat writes its own tests and never edits another seat's. A seat that
can rewrite the test that judges it has quietly left the league.

The tester's two questions are not the tester's property. They stay visible to
the analyst, the architect, the developer, the operator and to whatever seat
the league adds next, because a seat that cannot see how it will be judged is
being marked rather than held to account. The tester owns the method. Every
seat owns what the method is pointed at in its own work.

## What binds them

**The ladder.** Human, then NLP, then Skill, then Script. A move climbs a rung
by producing evidence, never by claiming it deserves one. Anything can be a
human's judgement; only something checkable can be a script.

**The walls.** A wall per question, each answering one thing about the tree
without running anything it does not have to. They are boring on purpose.
A wall that is clever is a wall that can be argued with.

**The lanes.** One change, one lane, one pull request. A merge is a human
saying yes, and the league has no other way of saying it.

**The record.** Every use of a skill leaves a retrospective, and a retro that
nobody consumes is a debt the league counts. The league learns by reading
what went wrong ten times, not by resolving to do better.

## How the work is shaped

Three trees answer to this page, and they negotiate with each other rather
than nest inside each other. Each is owned by the seat whose work it is, and
each seat settles two things for itself: the shape of its own tree, and what
every document in it exists for. The shape of the whole is the league's; the
shape of a tree is its seat's.

1. **Requirements**, from what the league is for down to what one task must
   make true.
2. **Architecture**, from the shape of the whole down to one seam, in two
   modes: embedded, where the league runs inside the work it guards, and
   external, where it is installed against work it did not write.
3. **Test**, from why the league tests three ways down to a single numbered
   case.

Underneath all three, code answers tests. What cannot be tested cannot be
built here, because nobody would ever know whether it were true.

## What the league refuses

It names no vendor and no product, because a member is not defined by who
made it and the league outlives whatever is fashionable this year.

It ships nothing it cannot check, waives nothing quietly, and skips no test
to go green. A red board is information. A green board bought by deleting the
question is a lie the league told itself.

It does not ask an agent whether the agent was right.

## What it is not

Not a framework, not a harness, and not a way of getting more work out of a
model. KAAL is the part that stays sceptical while the rest of the world is
impressed, and it is written down so that being sceptical does not depend on
anybody remembering to be.

MIT licensed, because a league nobody can join is a club.
