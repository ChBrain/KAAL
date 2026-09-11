# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the seventy third use of the analyse skill, declaring what shipping
the method supersedes: three closed tasks, each in one clause, 11 September 2026.
Place: this repository

## Liked

- The supersede names a clause and not a task. All three of these tasks are
  still right about everything else they claim, and the escape this league
  has is coarse: a trace says `supersedes: <name>` and the reader has to find
  out which part moved. Writing the clause into the prose line makes the
  answer readable without a diff, and the wall that refuses a line of bare
  names is what forced it.
- Proving the whole chain before pushing any of it. Four diffs stacked on one
  branch, the board run over all of them, and the state that matters checked:
  every one of the six criteria true, and the three superseded tasks passing
  their amended proofs.

## Learned

- Two of the three contradictions were visible from the manifest change and
  the third was not. `the-tag-installs-offline` installs the package from git
  into a scratch tree and reads what arrived, so nothing but running it could
  have found it. I declared a supersede over two, and it was the board that
  said three.
- So the cost of guessing a supersede's reach is a red main two diffs later.
  Had the analyst diff gone up when it was written, it would have been green
  on its own branch and turned main red the moment the manifest landed. The
  only thing between those two states was running the board on the whole
  chain, which took one command and four minutes.
- Two walls can make opposite demands of one line. The trace wall reads
  `- Supersedes:` as a single physical line and needs every declared name on
  it; `an-artefact-traces-what-it-came-from` criterion 6 refuses a line that
  is only names, because a line repeating the trace says nothing a reader
  could not compute. Both are right and the line has to carry the names and
  the claim together. I met that by wrapping the line and going red twice.

## Lacked

- A supersede declares a task and not a claim, and this is the second record
  in two days saying so. Three tasks are superseded here and none of them is
  retired: one clause moved in each. The trace carries the task name, the
  prose carries the clause, and only the prose is readable.
- Nothing tells an analyst which tasks a change will contradict. I found
  three by making the change and reading the board, which works and is the
  expensive order. The claims are in the criteria, in words, and nothing
  reads them against each other.

## Longed for

- A supersede that names a criterion rather than a task: `supersedes:
the-tag-installs-offline#2`. The tree already pins a region by sha, so it
  knows where a criterion begins and ends, and the wall that checks the prose
  could then check that the clause named is the clause that moved.
- The manage skill, again, and this is the sixth record in two days pointing
  at the same gap. The question here is one line: what else claims something
  about what I am about to change.

Feeds: analyse
Read: architect
