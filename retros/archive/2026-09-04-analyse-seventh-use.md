# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the seventh use of the analyse skill, on `requirements/status-v2`
(a drawing's contracts judged by its task's status), 4 September 2026.

## Liked

- The second refusal by the hook was the same shape as the first, and the
  requirement was three criteria because status-v1 had done the thinking.

## Learned

- Status belongs to the task, not to an artefact. The first version put the
  line in the requirement and the wall that reads acceptance tests; the
  drawing's contracts needed the same rule and had no line of their own to
  read, which is right: they read the requirement's.
- A stacked pull request merged into its base branch instead of main lands
  nowhere visible; the analyst's requirements for agent-v1 and security-v1
  sat on a branch while the drawings for them were written. Open a stacked
  pull request against main once its base has landed, or retarget before
  merging.

## Lacked

- A wall that notices a merged pull request whose commits are not on main.
  That is a repository question, not a tree question, and the league has no
  wall outside the tree.

## Longed for

- Fewer status rules: the two lookups are one runner now, and a third
  artefact kind would want the same.

Feeds: `analyse`.
