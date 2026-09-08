# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the thirty-third use of the code skill, building
`pointed-elsewhere`: a fixture that ships a tree, a procedure in the
runner's header, a witness reading in the record, and the first build in
three days with actual source in it, 7 September 2026.
Place: this repository

## Liked

- A build with source again, and therefore a unit layer again, and the
  skill's new text told me which case I was in without my having to argue
  it in a pull request.
- The break-it rule, followed rather than described. Both units were
  written after the code, so both modules were broken and both tests
  watched to fail: a witness reading that always returned null, and a
  runner whose header dropped the procedure. Two minutes, and they now
  mean something.

## Learned

- Writing the units after the code is not a defect if the breaking step
  follows. What makes it a defect is trusting them without it, and the
  rule that landed this morning is exactly the difference between the two.
- The fixture is data now, not text: a tree of three files that the eval
  copies before it runs. `kaal fixtures` walks past it in silence, which
  the analyst noticed a day ago and which is still open.

## Lacked

- Nothing tells a developer to check that a new fixture does not disturb
  the walls that sweep every fixture. I checked `kaal fixtures` and the
  runners wall by running them, on a hunch, not because anything said to.
- No guidance on a fixture whose files are a program. The tree here is
  three small files nobody runs; if a fixture ever ships something
  executable, no rule says what may be in it.

## Longed for

- A reading that lists what every wall would see in a fixture I am about
  to add, so a new shape is met before it is committed rather than after.

Feeds: code
