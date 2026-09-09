# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the sixty-second use of the analyse skill, on
`requirements/a-diff-carries-one-seat` (seven criteria, a guard the asker
named after watching a build overwrite a proof), 9 September 2026.
Place: this repository

## Liked

- The measurement decided the shape. Sorting the last twenty commits on main
  by the seat directories they touch answered in one line what the ask was
  about: every `Specify` and every `Draw` touches one seat, every `Build`
  touches three or four, six for six with no exception. The requirement did
  not have to argue that a problem exists.
- The sibling repository had already solved half of it and could be read
  rather than reinvented. Lanes with allow globs, a shared list, and a
  command that computes the lane from the diff instead of letting a model
  choose it.

## Learned

- The rule was already written and nobody had noticed it was not read.
  `AGENTS.md` says one pull request one lane, says a seat declares the paths
  it may change, and says never edit another seat's test. No seat declares
  anything, no command reads a diff, no wall runs one. A contract that
  nothing enforces reads exactly like one that does, which is the vacuous
  pass wearing a page instead of a test.
- And the same page contradicts the rule two paragraphs later: the lane it
  names for a task is "a requirement with its drawing and build", which is
  three seats in one branch by definition. The rule and its own example
  disagreed and both had been read many times.
- The ask looked like two tasks and is one. A lane guard with no escape stops
  every build in this league, because a build legitimately closes its own
  requirement and sometimes legitimately supersedes another task's claim.
  Splitting the ask would have handed over a first task that cannot ship.
  What the ask calls cheating is not the change but the silence, so the
  escape is a declaration and the declaration is the other half of the guard.
- Five claims moved in this session and every one was correct. That is the
  measurement that says the escape must exist, and it is also the reason the
  guard must exist: nothing recorded them but my own choosing to.
- Writing the reds honestly took a second pass. Four of the seven were red
  at an assertion that said something else while the real reason was that
  the command does not exist, and one threw rather than asserted. A test red
  for the wrong reason is a test that will go green for the wrong reason.

## Lacked

- No fixture shape for a git repository. Every criterion here needs a base
  commit and a working diff, and a fixture that is a repository cannot be
  committed inside one, so the tests build them in a temporary directory.
  That is the second kind of fixture this league has and nothing names it.
- Nothing in the skill about an ask that arrives as a diagnosis rather than
  a want. The asker named the mechanism and the two harms; the goal sentence
  had to be recovered from them rather than read off.

## Longed for

- A wall that says a rule in `AGENTS.md` is enforced by nothing. Three
  sentences on that page are enforced today by a person remembering, and the
  page gives no sign of which.
- The measurement I ran to be a command. Which seats does this diff touch is
  the question the whole task is about, and I answered it once with a shell
  loop that will not survive this session.

Feeds: analyse
Read: test
