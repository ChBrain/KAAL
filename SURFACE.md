# The surface

What this tool promises. One section per command, the exit codes it can end
on, and the shapes a caller parses. It is here so that the question "is this
change a patch" has an answer that is not a matter of taste, and so the wall
that asks it has something to read.

This page decides nothing. Every promise on it was fixed by a closed
requirement, and each entry names the one that fixed it, because the first
question after "this is not a patch" is "who decided that".

`README.md` tells a reader how to use the tool. This page tells a reader what
the tool has promised not to change quietly.

## Installing it

Two paths, and a consumer with a registry takes the first.

`npm i @chbrain/kaal` resolves the package from the registry the manifest
declares, which is where the release workflow publishes it. This is the path
for anyone whose machine can reach that registry and who wants a version
rather than a checkout.

Installing from the git URL still works and always will. It needs no
registry, which is the point: it is the offline path, and it is what a
consumer takes when the registry is unreachable, unwanted, or not theirs. It
resolves a tag rather than a published version.

What the two paths deliver is the same package. The registry path is a name
and a version; the git URL is a ref.

## The exit codes

Three, and they are the whole vocabulary.

- 0 an answer. The command had something to say about this tree and said it.
- 1 findings or usage. The command judged and found something, or it was
  called in a way it does not offer.
- 2 the question is not this tree's. The tree holds none of what the command
  reads, so there is nothing to judge and a pass would be a coincidence
  (`applies-here`, widened by `nothing-passes-vacuously`).

Findings go to stderr, one per line. A summary goes to stdout. A command that
refuses on 2 writes one line on stderr and nothing at all on stdout.

## The shapes a caller parses

- **The applicability line**: `<command>: not applicable here: <what it looked
for>`, one line on stderr, exit 2, empty stdout (`applies-here`).
- **A manifest line**: the sha256 of a file's bytes, two spaces, then the
  file's path relative to the directory and separated by `/` on every
  platform, sorted ascending by path. This is the shape `sha256sum` prints, so
  a manifest can be verified by a tool that is not ours (`witness-a-tree`).
- **A finding**: one line on stderr naming its subject first, then what is
  wrong. The wording of a finding is not fixed; that it is one line on stderr
  is.

## ledger

Answers whether every rung has its evidence, and prints the standing of each
candidate move with its stale records. Reads `skills/<name>/moves.json` and
`evals/<skill>/<fixture>/*.md`. Takes a root. Exits 0, 1 or 2
(`applies-here`, `eval-record-v1`, `nothing-stale`).

## drawings

Answers whether every drawing holds the template's shape: the six sections in
order, one labelled edge and one contract test per seam, every criterion in
the strategy table. Reads `architecture/<task>/` and the task's requirement.
Takes a root. Exits 0, 1 or 2 (`applies-here`, `architect-v2`).

## runs

Answers what a run recorded and whether the record still speaks for the suite
it names. A record is a page under `tests/runs/`, one per task, carrying the
task, the suite, when it ran, the sha of that suite and its counts. `--write`
runs every acceptance suite and records the ones that are green, and records
nothing else: a record is evidence of a pass and a red suite made none. No
wall writes one, because recording is the act of the seat that proves and a
wall only reads.

What the record is for is the one question a run cannot answer about itself.
A red suite is a regression if it ever passed and a task nobody has built if
it never did, and the walls tell those apart by reading the record beside the
run. A record whose suite has changed since counts as no record, because a
pass against text that no longer exists says nothing about the text that is
failing now. A pin in the task's own artefacts that nobody has read since the
text under it moved counts the same way and is named in the reason, because a
green suite proved against text somebody still owes a reading of is evidence
with a question mark on it. Takes a root, which may be a flag. Exits 0, 1 or 2
(`a-task-is-delivered-by-its-run`, `a-pin-says-who-cleared-it`).

## traces

Answers whether every artefact declares what it was made from and every name
resolves: one row per kind says where things of that kind live, a kind the
table does not hold is a finding rather than a silence, and a requirement's
`Supersedes:` prose must still mention each name its trace declares. What is
pinned for each kind is the region a reader would go to: a requirement's
`## Acceptance criteria`, and the whole file for a principle, for a suite and
for a case. Two of the kinds carry the test graph: a plan's `suites` names
suite pages under `tests/suites/`, and a suite's `cases` names case files by
their path from the root, because a case lives beside its requirement, its
drawing or its code and no one convention reaches all three. Both are comma
lists and neither is declared from the other end, so a plan may name many
suites, a suite may be named by many plans, and a case may be named by many
suites. A kind is written one of two ways
and both mean the same: a line inside `traces:` whose value is a comma list,
or a block of its own beside `traces:`, one entry to a line, keyed by the name
and valued by its sha. A kind picks the writing its length needs, an empty
block names nothing the way `nothing` on a line does, and a page carrying both
is read by its block. A value is
`<name>` or `<name>@<sha>`: a pin that no longer matches the region it names
is reported as having moved, which is different wording from a name that
resolves to nothing, because one wants a rename and the other a reread. Only
the second is a finding. A pin whose region moved carries a review state, one
of `current`, `review-needed`, `reviewed-no-impact` and `updated`, and a pin
with nothing recorded beside it reads `current`. That is a line and never a
failure: a tree mid handoff answers rather than refusing, because a red board
stops the seat that cannot fix it, and what an unread pin costs is the task,
under `runs`. The counts of all four are on the answer either way. A review is
recorded in a `reviews:` block beside `traces:` in the same frontmatter, keyed
`<kind>/<name>` and valued `<state>@<sha> by <who>: <why>`; only the two states
a person leaves are ever written, a word outside the four is a finding naming
it, and a clearance missing its person or its reason is a finding naming which
is missing. A review counts only while the sha it names is the region's sha
now, so a second move asks again. `--write` puts the pin on every trace it can
resolve, changes nothing else on the page, and writes nothing on a second run;
nobody types a sha. A block is written entry by entry, on each entry's own
line, and a block holding one pin no review has cleared is left whole exactly
as a line is. It advances a pin a review clears, never touches one
awaiting a review, and says how many it left. It also reads the shape the `parent` kind makes: one trunk under `kaal/`
and no other artefact declaring `none` without a `- Root because:` line in
its Handoff, no cycle among parents, a drawing answering exactly one
requirement, and no tree with more than **half** its artefacts hanging
directly off its own root, which is a star rather than a tree. That share is
one number chosen without evidence, and the first tree to trip it is the
evidence for changing it. A parent that is absent is never a finding: each
seat populates its own tree. And it answers whether the test tree is written
down: every wall whose command names a file ending in `.test.mjs` has one
plan under `tests/plans/` that is about it, and every plan is about a wall the
board holds. It reads the suites too, under their own kind `suite`: a suite
naming no case, a case sitting where nothing the board declares owns it, a
case under `tests/`, which points at cases and does not hold them, and a test
file under a tree the suites reach that no suite names. A file inside a
`fixtures/` directory is never asked for, because a fixture is a scratch tree
built for a case. And it says how far each plan reaches, in suites and in
cases, on its own line and whatever the findings say. Which end is missing is the finding's own kind, `plan` or `wall`,
because a plan is usually named for its wall. What a plan's globs match and
what number it states are no longer read here: a plan picks suites, and a
selection owns neither a place nor a count. `--write` still rewrites a number
a plan carries rather than inventing one, and a plan carrying none is left
alone. Reads the
frontmatter of `requirements/<task>/requirement.md`,
`architecture/<task>/drawing.md` and every `.md` page under `tests/`, the
region of each file a kind points at, and the `gates` list in
`kaal.config.json`. Takes a root, which may be a flag. Exits 0, 1 or 2
(`applies-here`, `an-artefact-traces-what-it-came-from`,
`a-trace-pins-what-it-read`, `a-pin-says-who-cleared-it`,
`the-test-tree-is-written-down`).

## seats

Answers whether this diff is one lane's. The lane comes from the branch and
never from the diff: a lane read off a diff is whatever you changed, and there
is nothing left for a guard to be wrong about. `kaal.config.json` declares
`seats` as a name and the paths each owns, `lanes` as a branch pattern with
the one seat it carries or none and the paths that lane allows besides its
seat's, and `shared` as the paths any lane may change.

It prints the lane it matched and one line beginning `seat ` for every seat
the diff touches, and it finds three things. A path the lane's seat does not
own, the lane does not allow and `shared` does not list, naming the path and
the lane: deny by default, so a path nobody declared is refused rather than
free. A branch that carries a change and matches no lane, naming the branch
and every pattern; a branch carrying no change is an answer, because there is
nothing to place. And a changed acceptance test, requirement fixture or
drawing contract test, naming the file, unless a requirement in the same diff
declares a supersede of the task that owns it. That escape is a declaration
and never a flag, and it excuses the proof and never the lane.

A rename is one act and comes back as the path it landed at, so moving a case
beside its code is not two lanes. A file git has never seen is in the diff
too, because a person is about to land it. Where HEAD names no branch, which
is what a checkout on a pull request leaves, the branch is read from
`KAAL_BRANCH`; where neither answers, the question is not this tree's, because
a wall that does not run beats a wall that lies. Takes a root, which may be a
flag, and `--against <ref>`, defaulting to the same base the class wall reads.
Exits 0, 1 or 2 (`a-diff-carries-one-seat`).

## coverage

Answers how much of what was asked each seat has answered, as one row per
seat: the seat, the word for what it counts, how many of how many, the share
as a whole percentage, and the tasks it does not cover by name, up to a limit,
with how many more when it stops. The analyst's row counts what was stated;
the architect's counts requirements a drawing declares it answers, read from
that drawing's own trace and never from a directory listing; the tester's
counts requirements with a run on record that is still about the suite it
names.

Every number here is computed and none of them is written down anywhere in
the tree, which is why no seat can claim one. The share is truncated and never
rounded: 199 of 200 rounded prints 100 per cent and reads as done. This
command has no way to fail. A gap is a fact about how far the work has got and
not a promise anybody broke, so it exits 0 with its rows on any tree that
states a requirement, 2 on a tree that states none, and never 1. On the board
it is a wall that cannot refuse, and its own lines are carried under its `ok`
line rather than only when something is wrong. Takes a root, which may be a
flag. Exits 0 or 2 (`a-seat-claims-what-it-covers`).

## check

Answers whether every skill obeys the skill rules: the standard's shape, MIT,
the line budget, no vendor, no dash, the reach declaration, an adversarial
fixture, and a version of its own in its patch place. Reads `<dir>/<name>/SKILL.md` and `references/`. Takes a skills
directory, not a root. Exits 0, 1 or 2 (`skills-v1`, `standard-v2`,
`applies-here`).

## agents

Answers whether every agent obeys the agent rules. Reads `agents/`. Takes a
root. Exits 0, 1 or 2 (`agent-v1`, `applies-here`).

## retros

Answers, for each skill, how many retros feed it that no requirement has yet
consumed, and how many retros read it. Reads `retros/` and `requirements/`;
consumption is by filename, so archiving a retro changes no unconsumed
count. A read is never counted as an unconsumed retro, so it does not fire
the rule of ten; reads are counted over `retros/` alone, so archiving a
retro does remove its read. A `Read:` line naming something this tree holds
no skill for is a finding. `--check` prints the findings and nothing else,
which is the form the board runs. Takes a root. Exits 0, 1 and 2
(`a-retro-names-what-it-read`, `the-board-counts-the-reads`,
`nothing-passes-vacuously`).

## assemble

Puts the league into a consumer's tree: the one command here a consumer of the
package runs rather than a seat of the league, and the only one that writes
outward. Run from inside the installed package, `kaal assemble <directory>`
writes every member the package carries into the directory named, one
directory per member, and answers with what each wrote and how many members
arrived. Naming members narrows it, because a consumer who said nothing asked
for the method and being made to fetch it a member at a time is the assembly
this package exists not to ask for; naming one that is not there is a finding
naming the name and where it looked.

It writes where it was told and nowhere else. The consumer names a parent and
each member lands one directory inside it, because a destination taken as a
leaf is one typo from writing over what was already there, and because a
league arriving together needs one place to arrive at. A name that would leave
the destination, carrying a separator or a parent, is a finding and never a
path. Nothing is written when the package is installed: there is no hook and
no install-time write, because a package is a guest in a consumer's tree in
the same sense this league's own assessor is a guest in a tree it visits.

Reads `skills/<name>/` under the working directory, never under the
destination: the first argument is where a consumer wants the league, not
where it is. A tree carrying no skills is not this question's tree at all, and
that answer is the module's own rather than a copy of it. Takes a directory
and any number of member names. Exits 0, 1 or 2
(`an-install-carries-the-method`, `applies-here`).

## release

Answers whether this tree may be released as a version: whether
`package.json` carries that version, and whether the release plan exists at
`deploy/releases/<version>.md`. It refuses and never releases; the tag is
made by whoever holds the key. Takes a version and no root, and is asked
about the working directory whatever it was handed, because a version is not
a path. Exits 0, 1 and 2 (`the-release-runs-on-a-key`,
`nothing-passes-vacuously`).

## boundary

Answers whether anything under a guarded place writes, executes or reaches the
network. The guarded places are `bin/lib/assess`, whose sink `output.mjs` may
write, and `bin/lib/witness`, which has no sink. Takes a root. Exits 0, 1 or 2
(`assess-boundary`, `witness-a-tree`, `nothing-passes-vacuously`).

## runner

Renders the two prompts and the record's frontmatter for one skill on one
fixture, from the tree. `--write` files the page beside the fixture;
`--check` says whether that page is current, and with no arguments sweeps
every page in the tree. A fixture that ships a `tree/` gets the guest
procedure in the page's header and never inside a prompt. Takes a skill and a
fixture, and is asked about the working directory whatever it was handed,
because a skill name is not a path. Exits 0, 1 or 2 (`eval-runner`,
`pointed-elsewhere`, `nothing-passes-vacuously`).

## gates

Runs every wall in `kaal.config.json` in order, all of them even after one
fails, and ends on one exit code. A wall that cannot run is a failure and
never a skip. Takes a root. Exits 0, 1 or 2 (`gates-v1`, `gates-v2`,
`nothing-passes-vacuously`).

## fixtures

Lists every fixture artefact in a tree by shape. It lists rather than judges,
so a root holding none is a refusal of its own and never a silent pass. Takes
a root. Exits 0 or 1 (`fixtures-v1`, `code-v2`).

## standard

Answers whether the pinned specification still matches the live text. This is
the one command that reaches the network. Takes a file. Exits 0 or 1
(`standard-v1`, `standard-v2`).

## assess

Describes a target directory and writes nothing into it. The output path is
judged before anything is read, and an output inside the target is refused.
Takes a target and an optional output path. Exits 0 or 1 (`assess-boundary`).

## witness

With a directory alone, prints its manifest. With `--against <manifest>`,
answers what moved: nothing, or one line per path added, removed or changed.
It never writes into the directory it reads, and the boundary wall holds it to
that. A target that is not a directory, or a manifest that does not parse,
names the path at fault on stderr rather than printing usage. Takes a
directory. Exits 0 or 1 (`witness-a-tree`).

## class

Names which of three artefacts a consumer can notice moved between a base and
this tree: the surface (`SURFACE.md`), the tool (`bin/`) and the skills
(`skills/<name>/SKILL.md`), one line each on stdout, and a line saying nothing
did when nothing did. Everything else in the tree is the league's own working
and moves without meaning. A move of the surface is reported and never
refused while the version's minor and major places are zero. A version whose
minor or major place differs from the base's is refused on stderr naming both
versions, because that raise is a human's act and not something this
repository does to itself. It reads the tree as it stands, so what is not
committed counts too. Takes a root and `--against <ref>`, which defaults to
`origin/main`. A tree with no history, no `package.json`, or no such ref is
not this question's. Exits 0, 1 or 2 (`a-change-declares-its-class`).

## acceptance

Runs the acceptance tests it is given and judges them by each requirement's
status: an open task's red is reported, a closed task's red is a failure, and
an open task that is all green is told to close, and a handoff with no
`People` line is refused. Takes files or globs. Exits 0
or 1 (`status-v1`, `status-v2`).

## contracts

Runs the contract tests it is given and judges them by each drawing's task,
the same way, reading the status from the task's requirement. Takes files or
globs. Exits 0 or 1 (`status-v2`).

## What this page does not say

It does not say what earns a minor version. The surface gained four commands
in three days, and a rule written before the thing it governs has settled is a
rule written from imagination. While the version is in its patch place the
surface is still moving; the move past it is a decision, not an accident.
