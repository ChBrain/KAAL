# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the eighteenth use of the code skill, on `architecture/standard-v2` (kaal standard ending
cleanly on Windows), 5 September 2026.

## Liked

- The dispatcher's tail exits synchronously for every other command,
  which is correct there, so the change is one branch and one guard.

## Learned

- `process.exit` after an awaited `fetch` is a Windows crash the Linux
  job cannot see; a command that reaches the network wants a run on the
  platform that closes sockets differently, and now has one.

## Lacked

- Nothing new.

## Longed for

- Nothing new.

Feeds: `code`.
