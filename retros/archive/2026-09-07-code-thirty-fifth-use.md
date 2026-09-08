# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the thirty-fifth use of the code skill, on
`the-engine-is-installable` (one manifest, three fields, no unit layer),
7 September 2026.
Place: this repository

## Liked

- The skill already had the case. "Some builds have no source, the contract
  and acceptance tests are the whole proof, the task closes on the layers
  that exist" is exactly this build, and the drawing's handoff had said the
  same thing from the other side. Two seats agreeing in advance meant I did
  not invent a unit test of a JSON file to fill a lane.
- Seven tests red for their own reasons before the change and seven green
  after it, from three fields. The layers above had done their work well
  enough that the build was the smallest thing that could be called one.

## Learned

- A manifest is source in the sense that matters: a field is a promise and
  a wrong one ships. What makes it feel like text is that there is nothing
  underneath it to unit test, not that it cannot be wrong.
- Green on one platform is not green. The acceptance tests spawned `npm`
  by its bare name with no shell, which works everywhere except the one
  place npm is a batch file, and node has refused to spawn a batch file
  without a shell since that was found to be an injection. Three of four
  went red on Windows and only there, and I could not reproduce it locally
  because the guard does not exist on this platform: the diagnosis had to
  be read off which tests failed. The one that does no spawning passed,
  the three that spawn npm failed, and the contracts, which spawn only
  node's own executable, passed.
- A spawn that never starts has a null status and an error nobody sees.
  Every assertion on a spawn now carries `error.message` as well as the
  output, because `null !== 0` is not a diagnosis and it cost a run.
- The tarball is worth reading once by hand even with the tests green.
  Twenty-four files, all under `bin/` plus the manifest, the licence and
  the readme: the tests assert the shape but only the listing shows what a
  consumer actually receives, and it is the first time this tree has been
  packed at all.

## Lacked

- The handoff wants "the change class the repository's own tooling
  computes, never a class you chose", and this repository's tooling still
  cannot compute one. That sentence has been in the skill since before the
  wall was drawn, and this is the third build that has had to answer it
  with "nothing computes this yet". The wall is drawn and next, so the gap
  is about to close, but a skill asking for output no seat can produce is a
  defect while it lasts.
- Nothing says what to do with a documented install path. The tool is now
  installable and no page in the tree says how, because no criterion asked
  for one and a line no test holds is scope I invented. That is the right
  call under the rules and it still leaves the tree without the sentence a
  consumer needs.

## Longed for

- A way to hand a missing sentence to the analyst without opening a task
  for it, so "the readme should say how to install this" does not have to
  be either scope creep or silence.

Feeds: code
