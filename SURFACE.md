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
an open task that is all green is told to close. Takes files or globs. Exits 0
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
