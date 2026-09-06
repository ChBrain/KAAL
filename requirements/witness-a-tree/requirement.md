# Requirement: witness-a-tree

_Written in analyse mode. Ask, from Kai: "how can we test external work
mode?", and "go" on a list whose second item was this. The claim we cannot
judge with a rubric is that a skill pointed at a directory writes nothing
there. A model is not deterministic; a filesystem is. This is the script
rung of that claim: record what a directory holds, and later say whether
anything moved._

## Goal

Whoever points a skill at a directory that is not the league's wants a
verdict on whether the guest touched it, one that does not depend on which
model ran or on what the model says it did; they will know when one
command records the directory and the same command, given that record,
exits 0 on an untouched tree and exits 1 naming every file that moved.

## Assumptions

- The manifest is a line per file, `<sha256>  <path>`, sorted by path, the
  shape `sha256sum` prints. A person can then verify it with a tool that
  is not ours, and a manifest diffs like text.
- Paths are relative to the directory witnessed, with `/` as the
  separator on every platform, or a manifest recorded on one machine is
  worthless on another.
- The witness is total: it hides nothing, and it has no ignore list. A
  target that is a git working copy is witnessed by git, which is better
  at it; this command is for trees that are not, which is what a fixture
  copy is.
- Symbolic links and empty directories are not files and are not in the
  manifest. A tree whose only change is an empty directory has changed in
  a way this tool does not see, and the requirement says so rather than
  pretending otherwise.
- The command answers about any directory. It is not in the applicability
  table, because a tree holding nothing of the league can still be
  witnessed: that is the whole point.

## Constraints

- Reads only. The witness must not write into the directory it reads, or
  into anything else, and there is no `--write`.
- No shell and no network (rules, reach): the manifest is read with the
  filesystem, never by spawning a checksum tool.
- Deterministic and offline: no clock in the output, no ordering that
  depends on the filesystem's own order.
- Exit codes follow the league: 0 an answer, 1 findings or usage.

## Acceptance criteria

1. `kaal witness <dir>` prints one line per file under the directory, in
   ascending path order, each `<sha256 of the file's bytes><two
spaces><path relative to the directory, separated by "/">`, and exits 0. A directory holding no files prints nothing and exits 0.
2. `kaal witness <dir> --against <manifest>` exits 0 and says on stdout
   that nothing moved when every file matches the manifest, and exits 1
   otherwise, naming on stdout each path that was added, removed or
   changed, one per line, with which of the three it was.
3. Neither form writes into the directory it reads: a witness of the
   directory taken before the run and one taken after are identical, in
   both forms, including after a run that exits 1.
4. A target that is not a directory, or a manifest that cannot be read or
   does not parse, exits 1 with one line on stderr that names the path at
   fault, and nothing on stdout. A usage line, which names no path, does
   not satisfy this.

## Open questions

- Should a run against a manifest report a file whose bytes are equal but
  whose mode changed, an executable bit set on a script the guest left
  behind?
- Should the manifest carry a header line naming the directory and the
  count, so a person can see what they are comparing, at the cost of the
  `sha256sum` compatibility?
- Empty directories and symbolic links are invisible to this. Is that a
  hole worth closing before the guest fixture uses it?
- Does the guest harness want a third form, `kaal witness <dir> --against
<manifest> --json`, so a workflow can read the verdict without parsing
  lines?

## Handoff

- Task: witness-a-tree
- Criteria: 4; tests: 4 (equal)
- Red run: `node --test --test-timeout=60000 requirements/witness-a-tree/acceptance.test.mjs`;
  all four red, the command does not exist
- Tests: `acceptance.test.mjs`, beside this file; fixtures built in a
  temporary directory by the test, since the tree under witness must be
  written to and this repository's own trees may not be
- Open questions: 4, listed above
- Status: open
- Blocked on: nothing
- Supersedes: nothing
