# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the ninety-fifth use of the analyse skill, amending
`an-open-finding-blocks-every-target` so clean security evidence belongs to
the exact candidate judged, 14 September 2026.
Place: this repository

## Liked

- The original five cases stayed intact while eight new reds exposed the
  current-evidence gap and one activation guard stayed green for the stated
  reason.
- Candidate mutation fixtures proved that an empty result can go stale on
  modified, deleted, renamed and added content without choosing a future
  evidence schema.
- The post-rebase naming script gave the retro its ordinal from the same tree
  the branch will carry.

## Learned

- A clean finding list has no file bindings to compare, so finding-local
  hashes cannot detect any candidate change at all.
- A semantic fixture contract can leave commit, tree, manifest and workflow
  choices to architecture while still fixing the red and green outcomes.
- The first throwaway stand-in made the mutation test pass for the wrong
  reason: its unknown scratch directory exited red. Making the stand-in
  recognize and inspect the scratch candidate turned that accidental pass
  into a real green proof.

## Lacked

- The existing security fixture vocabulary has no place to represent
  analysis completion, retrieval failure, collection completeness or the
  candidate the board judges.
- The complete board takes several minutes before it prints any wall result,
  which makes a late unrelated failure expensive to diagnose.

## Longed for

- A standard semantic-fixture vocabulary for producer state and candidate
  identity that acceptance tests can name without inheriting a provider's
  payload shape.
- Per-wall timing evidence from the requirement that just landed on
  `release`, so future board work shows where the wait occurred.

Feeds: analyse
Read: retro-4ls
