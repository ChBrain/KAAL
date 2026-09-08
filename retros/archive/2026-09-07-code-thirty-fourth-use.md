# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the thirty-fourth use of the code skill, building
`the-surface-is-written-down`: one page, fourteen sections, no code, 7
September 2026.
Place: this repository

## Liked

- The drawing had fixed the heading's shape, the vocabulary's words and
  the citation per promise, so the build was writing prose against a
  contract rather than deciding anything. Six tests red, then green.
- Writing the page found two small errors in my own understanding of the
  tool that no test would have caught: `retros` has no findings path, so
  it ends on 0 or 2 and never 1, and `check` takes a skills directory
  rather than a root. Both are true of the tool and neither was written
  down anywhere until now.

## Learned

- Transcribing a surface is a way of reading a tool that reading its code
  is not. Fourteen sections meant asking fourteen times what a command
  actually promises, and twice the answer was not what I would have said
  from memory.
- The page cites the closed task behind every promise, and assembling
  those citations was the cheapest audit of the tree I have done: every
  promise had a task, which means the surface has never grown without one.

## Lacked

- Sixth build with no source and no unit layer, and the skill now names
  the case, so there is nothing to complain about. Worth noting only that
  the case is common rather than exceptional here.
- Nothing checks that a citation on the page names a requirement that
  exists. A promise citing a task nobody wrote would pass every wall.

## Longed for

- A check that every task named on the surface page is a directory under
  `requirements/`. It is one line and it would make the citations load
  bearing rather than decorative.

Feeds: code
