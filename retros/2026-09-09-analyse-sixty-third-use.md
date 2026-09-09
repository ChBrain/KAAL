# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the sixty-third use of the analyse skill, on
`requirements/the-publish-carries-a-token` (three criteria, a release run
that cannot publish), 9 September 2026.
Place: this repository

## Liked

- npm answered the question in one line. `npm publish --dry-run` says "This
  command requires you to be logged in to https://npm.pkg.github.com", and
  the registry answers a read with "401 ... authentication token not
  provided". Two runs and the requirement had its facts, with nothing
  published and nothing guessed.
- Checking a plan before working it found the defect. The task was to write
  the steps to 0.0.2, and step one turned out to be a thing that would have
  failed on the asker's own release run, after the tag.

## Learned

- A criterion that says what a thing does and a test that reads where it sits
  are not the same claim, and the second passes for months. "The release
  workflow publishes the version it tagged, after the tag" was proved by
  reading step order. Nothing asked whether the publish step could publish.
  This is the fourth shape of green for the wrong reason this league has
  found in two days, and the first where the criterion's own wording was
  right and only the proof was short.
- A sweep for a secret found the sentence describing the secret. The first
  version of criterion 3 read every file for an authentication line and
  matched the comment in its own source explaining what one looks like. The
  test named itself as the offender, which is the one-letter fixture problem
  in a new suit: a pattern broad enough to catch prose will catch its own.
- The fix was to stop reading text and start reading filenames. What matters
  is whether an `.npmrc` exists, because that is the file npm reads, and
  whether a token shaped literal is anywhere. Neither has a prose hazard.
- Two facts in two places must be compared, not both asserted. The workflow
  says where to sign in and the manifest says where to publish, and a
  criterion that checked each against a hardcoded string would pass while
  they drifted apart. Criterion 2 reads both and compares them.

## Lacked

- Nothing in the skill about a criterion whose verb the test does not reach.
  "Publishes", "installs", "answers": each of those is a capability, and a
  test that reads the arrangement of the parts is testing a different verb.
  The skill asks for one test per criterion and says nothing about the test
  meeting the criterion's own claim.
- No cheap way to prove a capability that costs something to exercise. This
  release publishes once and there is no undo, so all three criteria read
  files. That is the right call and it is also why the defect survived: the
  only honest proof of a publish is a publish.

## Longed for

- A rehearsal that is not the thing. `npm publish --dry-run` is exactly that
  and it is not in the release run, and it would have caught this defect for
  the cost of one command. It is in the requirement as an open question
  rather than a criterion, because it can pass and then the real call fail.
- A reading of every closed criterion against its own test, asking whether
  the test reaches the criterion's verb. I would expect that sweep to find
  more than one.

Feeds: analyse
Read: test
