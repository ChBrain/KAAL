# Drawing: push-v1

_Written in architect mode from `requirements/push-v1`, whose eight criteria
each have a red acceptance test. The human approves this drawing before the
developer builds; that approval is the close of this seat._

## Structure

What exists: six skills under `skills/`, each with `SKILL.md`, `moves.json`,
`fixtures/`; two requirements with acceptance tests; retros under `retros/`.

What is new:

- **The league's tool**, `bin/kaal.mjs`: one entry point that dispatches a
  command (`ledger`, `check`, `retros`; `gates` arrives with `gates-v1`) to a
  module, prints findings, and exits 0 or 1. It is Kaal's, it reads the whole
  league, and no consumer needs it.
- **The tool's modules**, `bin/lib/`: pure functions with no dependency:
  `frontmatter.mjs` (key: value frontmatter, nothing more), `sha.mjs`
  (SHA-256 of a file), `rules.mjs` (the skill rules, the league's own copy of
  the standard mirror and the neutrality policy), `ledger.mjs` (evidence and
  freshness of every rung), `retros.mjs` (unconsumed retros per skill). Each
  has a test under `tests/`.
- **The first skill-internal script**, `skills/analyse/scripts/count.mjs`:
  criteria and tests must count equal; exits 1 when they do not; test beside
  it; called from `SKILL.md` by relative path; the analyse ledger's first
  move at rung `script`.
- **Eval records**, `evals/<skill>/<fixture>/<model>.md`: one model's run on
  one fixture, with `model`, `verdict`, `skill_sha`, `fixture` in the
  frontmatter and the output below. The first two are for `analyse` on
  `json-flag`: one from a person's runtime, one from the hosted model.
- **The evals workflow**, `.github/workflows/evals.yml`: fires on an
  `/eval <skill>` comment or a dispatch, never on a push; holds `models:
read`; runs the named skill on each of its fixtures with the hosted model;
  writes the record; commits it.
- **Human moves** in three ledgers: the ask (analyse), the approval
  (architect), the key (operate), at rung `human`, with no candidate.

What changes: `skills/analyse/moves.json` (one move to `script`, one to
`skill`, one human move); `skills/architect/moves.json` and
`skills/operate/moves.json` (one human move each); `skills/analyse/SKILL.md`
(one line calling the script).

## Seams

1. **shell to tool**: in, `node bin/kaal.mjs <command> [root]`; out, exit 0
   with a summary on stdout, or exit 1 with one finding per line on stderr;
   an unknown command exits 1 and prints usage. Owned by the tool on one
   side, the hook and the workflow on the other.
2. **ledger to tool**: in, a `moves.json` with `moves[]` of `{name, rung,
candidate, script, test}`; out, a finding per move whose rung lacks
   evidence. Paths are relative to the skill for rung `script` (`scripts/`
   and its test) and relative to the root for rung `skill` (an eval
   directory). Owned by every skill on one side, `ledger.mjs` on the other.
3. **eval record to tool**: in, a markdown file whose frontmatter carries
   `model`, `verdict` (`pass` or `flag`), `skill_sha` (64 hex), `fixture`;
   out, counted as fresh evidence only when `verdict` is `pass` and
   `skill_sha` equals the current SHA-256 of the skill's `SKILL.md`; a
   record missing any field counts for nothing. Owned by the workflow and
   the person who runs a model on one side, `ledger.mjs` on the other.
4. **skill directory to rules**: in, a directory holding skills; out, one
   finding per broken rule naming the skill and the rule (`name`,
   `description`, `license`, `vendor`, `dash`, `depth`, `budget`). Reads only
   `SKILL.md` and `references/`. Owned by the standard on one side,
   `rules.mjs` on the other.
5. **retros to count**: in, `retros/` and `requirements/`; out, one line per
   skill with its unconsumed count, where a retro is consumed when any
   `requirement.md` names its filename, and `retros/archive/` is not read.
   Owned by `retro-4ls` on one side, `retros.mjs` on the other.

## Fixed and free

- Fixed: the command names and the exit-code contract (criteria 2, 3, 4);
  `skill_sha` is the SHA-256 of the `SKILL.md` bytes (criterion 7 computes
  it); scripted moves live in the skill's `scripts/` and are called from its
  `SKILL.md` (criterion 6); node only, no runtime dependency (constraint);
  the workflow's triggers and permission (criterion 8); the rule names in
  seam 4, because the developer's unit tests will name them.
- Free: the module split under `bin/lib/` beyond the five named; output
  formatting inside the contract; how the workflow calls the hosted model;
  the record body's shape below the frontmatter; the name of the token the
  workflow commits with.

## Decisions

### `bin/lib/`, not `lib/`

- Chosen: the tool's modules live under `bin/lib/`.
- Not taken: `lib/` at the root; a single-file `bin/kaal.mjs`.
- Because: the design reserves `lib/` for scripts shared between skills and
  stamped into them at build; the tool's modules are never stamped anywhere.
  A single file would hold five concerns and five tests in one.
- Reopens if: a tool module is needed inside a skill; then it is shared, it
  moves to `lib/`, and it is stamped.

### A frontmatter parser of one shape

- Chosen: `key: value` lines between `---` fences, values unquoted or in
  double quotes, nothing nested.
- Not taken: a YAML dependency; a regex per caller.
- Because: no runtime dependency is a constraint, and every frontmatter the
  league reads (skills, records, retros) is flat. One parser, tested once.
- Reopens if: a record or skill needs a nested field.

### Rung-relative paths in the ledger

- Chosen: for rung `script`, `script` and `test` are relative to the skill;
  for rung `skill`, `test` is an eval directory relative to the root.
- Not taken: all paths relative to the root; a separate `evals` field.
- Because: a scripted move must travel with the skill, so its paths cannot
  know the root; eval records are the league's evidence and never travel.
  The acceptance tests already read it this way.
- Reopens if: eval records ever ship inside a skill.

### The workflow commits with a token that retriggers

- Chosen: the evals job commits with a secret `EVALS_TOKEN` when present and
  falls back to the workflow token, saying so in its log.
- Not taken: the workflow token alone.
- Because: a push made with the workflow token does not start other
  workflows, so the walls would not run on the commit that carries the
  records and the required check would sit stale (khai met exactly this).
- Reopens if: the walls are posted as a commit status by the same job.

### The rules are the league's own copy

- Chosen: `rules.mjs` mirrors the standard's constraints and the neutrality
  policy in the league, pinned to the spec hash in `kaal.config.json`.
- Not taken: importing khai's guard.
- Because: nothing in KAAL depends on khai (the design's boundary); the copy
  is the price of the dependency pointing the right way.
- Reopens if: the generic rules move out of khai into a package both use.

## Test strategy

| criterion | layer      | kind          | why                                            |
| --------- | ---------- | ------------- | ---------------------------------------------- |
| 1         | acceptance | deterministic | a field in a file                              |
| 2         | contract 2 | deterministic | exit codes on fixture roots                    |
| 3         | contract 4 | deterministic | exit codes on fixture roots                    |
| 4         | contract 5 | deterministic | lines on stdout                                |
| 5         | acceptance | deterministic | files exist and match a pattern                |
| 6         | acceptance | deterministic | a path, a call, a passing test                 |
| 7         | contract 3 | deterministic | the shape and the sha; what the record says is |
|           |            | harnessed     | a model's reading and never gates              |
| 8         | acceptance | deterministic | triggers and a permission in a file            |
| first run | manual     | manual        | a person runs the skill in their own runtime   |

## Handoff

- Task: push-v1
- Seams: 5; contract tests: 5 (equal), in `contracts.test.mjs` beside this
  file, on fixture roots under `fixtures/`
- Red run: all five failing, no tool exists; stand-in green in scratch
- Criteria served: seam 1 serves 2, 3, 4; seam 2 serves 2, 6, 7; seam 3
  serves 7; seam 4 serves 3; seam 5 serves 4
- Fixed for the developer: the list above; start red on all thirteen
  acceptance tests and these five, and build in the order of the seams
- Next: the human approves this drawing; then `code`
