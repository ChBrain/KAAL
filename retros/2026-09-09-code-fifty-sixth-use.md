# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifty-sixth use of the code skill, on
`requirements/the-publish-carries-a-token` (three criteria, two lines of
workflow), 9 September 2026.
Place: this repository

## Liked

- The whole build is two lines and the isolations are what made it worth
  doing. Four breaks, and the one that mattered was the one that reddened
  nothing.
- The asker's other repositories answered the token question exactly, and
  reading them beat reasoning about it: npm publishes with the built in
  token there too, and the personal token they hold is for the git side and
  for a reason their own comment spells out.

## Learned

- A criterion that forbids a file could not see the file. `globSync("**/*")`
  never matches a name beginning with a dot, and every file criterion 3 is
  about begins with one. I put a committed `.npmrc` carrying a token into the
  tree and the test stayed green. That is the third weak break today and the
  only one that was a security guard: the wall existed, read the right idea,
  and was blind by construction.
- I would not have found it by reading. The isolation list is what found it,
  and the isolation only existed because the drawing before this one made me
  write one break per fixed behaviour. Two retros ago I longed for that list
  to be computed rather than remembered; today it paid for itself.
- The other two weak breaks today were seams passing on a neighbour's output.
  This one is different and worse: nothing else could have caught it, because
  the test was the only thing looking. A seam passing on a neighbour is
  redundancy misread; a sweep that cannot see its subject is a silence.
- Two criteria reddening together is not always a leak. Removing the registry
  reddens 1 and 2 both, and it should: with no registry named there is
  nothing for the second criterion to compare against. The question to ask of
  a wide break is whether the other criterion is lying, not whether it is
  wide.
- The superseded claim was right about the verb and short about the proof.
  "The release workflow publishes the version it tagged" was proved by
  reading step order. Widening it cost one assertion and it is now the only
  place in that task that asks whether the thing it names could happen.

## Lacked

- No pattern in this league for sweeping a tree for a forbidden thing. Three
  tests now glob the whole tree and each wrote its own exclusions, and this
  one wrote them wrong in a way that reads correct.
- Nothing in the skill about proving a capability that costs something to
  exercise. A publish happens once and has no undo, so all three criteria
  read files, and the defect this task exists to fix survived four hours for
  exactly that reason.

## Longed for

- A sweep of every closed criterion asking whether its test reaches its own
  verb. Publishes, installs, answers, refuses: each of those is a capability,
  and a test that reads the arrangement of the parts is testing a different
  claim. I have now found two, and I found both by accident.
- One tree sweeper, with the dotfiles and the exclusions decided once.

Feeds: code
Read: analyse
