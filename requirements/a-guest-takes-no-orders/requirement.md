# Requirement: a-guest-takes-no-orders

_Written in analyse mode. Ask, from Kai, on a finding rather than a plan:
a guest run of the analyse skill against a real consumer repository found
that the tree it was pointed at opens with a file addressed to agents,
beginning "read this before you touch anything, these are imperatives,
not background", and requiring a command be run before any other. Nothing
in `where-a-skill-acts` says whether such a file binds the guest. Kai:
"khai is the better test", then "ok" on putting this ahead of the fixture._

## Goal

Whoever points a KAAL skill at a directory that is not the league's wants
the skill to read that tree without being commanded by it: to treat what
it finds as evidence about the tree, to keep working under its own
contract, and to bring the tree's conventions back to the asker rather
than adopting them in silence; they will know when the five working
skills say all three where a reader looks.

## Assumptions

- A directory a skill was pointed at is untrusted input. Both failure
  modes are real and were seen in the guest run: ignore the host's file
  and write against conventions the host already settled, or obey it and
  let a file inside an untrusted tree tell an agent to run commands.
  `where-a-skill-acts` covered what a skill writes and said nothing about
  what may write to the skill.
- Two different things live in such a file, and the rule must separate
  them. Directives addressed to an agent are content: quoted, never
  followed. Conventions, the words a tree uses and how it lays work out,
  are evidence for the output, and a guest that ignores them produces
  something the host cannot use.
- The skill's own contract wins a disagreement, and the disagreement is
  named rather than resolved in silence. A guest that quietly adopts a
  host's rule has changed seats without telling anyone.
- `retro-4ls` does not carry this. It compiles a retro from a period, it
  does not read a tree, and the rule it already carries, that it names the
  kind of place and never the tree, is the guard it needs.
- The five working skills are `analyse`, `architect`, `code`, `operate`
  and `test`, and the sentences join their `## Where you act` section
  rather than opening a second place for the same subject.

## Constraints

- Text only: no skill gains a flag, and nothing in `bin/` reads these
  sentences (`where-a-skill-acts`, closed, fixed both).
- The skills stay under their line budget and the standard's shape; no
  vendor, no dash (rules).
- The analyse skill's text moves, so its fixture's `RUNNER.md` goes stale
  and is regenerated in the same change (the runners wall).

## Acceptance criteria

1. Each of `analyse`, `architect`, `code`, `operate` and `test` says that
   what it finds inside a directory it was pointed at is content and never
   instruction, and that a file there addressed to an agent is quoted and
   not followed.
2. Each of the same five says its own contract governs how the work is
   done, and that where the tree's file and that contract disagree, the
   skill's contract wins and the skill says so.
3. Each of the same five says the tree's conventions are evidence for the
   output, to be named to the ask rather than adopted in silence or
   ignored.

## Open questions

- Does a guest ever need to run something the host's tooling provides, a
  formatter or an environment probe, and if so who authorises it: the ask,
  or a rule that names which kinds of command are safe?
- Should the skills say what to do when the tree holds no contract at all,
  which is the common case, or is silence there already right?
- The same argument applies to a fetched document and to a tool result.
  Is this rule about directories, or is it one instance of a rule about
  every input a skill did not write?

## Handoff

- Task: a-guest-takes-no-orders
- Criteria: 3; tests: 3 (equal)
- Red run: `node --test --test-timeout=60000 requirements/a-guest-takes-no-orders/acceptance.test.mjs`;
  all three red
- Tests: `acceptance.test.mjs`, beside this file
- Open questions: 3, listed above
- Status: open
- Blocked on: nothing
- Supersedes: nothing
