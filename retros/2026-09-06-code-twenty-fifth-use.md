# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the twenty-fifth use of the code skill, on
`architecture/applies-here` (one table, asked before anything is read), 6
September 2026.

## Liked

- The acceptance wall caught the collision, not a reviewer and not a
  rerun: the build turned a closed requirement red in the same run that
  turned the new one green, and named the criterion it broke.

## Learned

- Reading the closed requirements before writing means reading their
  criteria, not their fixture roots. The analyst listed code-v2 as a
  constraint and checked that its roots hold what their commands read;
  the criterion that broke was about a root that holds nothing, which is
  exactly the case the new rule changed. Six closed tasks were named and
  the one that mattered was read the wrong way.
- A criterion that contradicts a closed one is the analyst's to give up,
  not the developer's to work around: `kaal fixtures` lists rather than
  judges, so it left the guarded set, and the guarded four are now the
  commands that judge. The narrower claim is the truer one.
- A replacement written against text the formatter has already rewrapped
  silently does nothing. It happened twice in this build, in a module and
  in a contract test, and both times the wall found it. Assert on the
  edit, or read the file back.

## Lacked

- Nothing new.

## Longed for

- Nothing new.

Feeds: `code`.
