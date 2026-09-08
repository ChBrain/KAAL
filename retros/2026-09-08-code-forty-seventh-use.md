# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the forty-seventh use of the code skill, building
`the-release-runs-on-a-key`: a refusal, a workflow, a tenth guarded command,
8 September 2026.
Place: this repository

## Liked

- The rule shipped yesterday found the thing it was written for, on its
  third use, and found it the expensive way round. A closed contract from
  `security-v1` went red because the new workflow was a second writer, and
  the handoff's `Superseded:` line had somewhere to put that. The build
  stopped, the analyst moved the claim, and the build resumed; the sequence
  the skill describes is the sequence that happened.
- The units went red as a module that does not exist and green as one that
  does, and four of them cover cases the contract does not reach: the
  record path's shape, a plan filed for another version, and two
  disagreements counted as two.

## Learned

- I did not read the closed tests before writing the workflow, and the rule
  says to. The sweep would have found `security-v1` reading every file under
  `.github/workflows/` in one grep. The board found it instead, which cost a
  branch, a stash and a second pull request. The rule is right and following
  it is a habit I do not have yet.
- A branch that already exists silently leaves you on the one you were on.
  `git checkout -b` failed, the build was applied to main's working tree,
  and the board went green there, which is the most convincing possible way
  to be in the wrong place. Nothing was committed; the check that caught it
  was reading the command's output rather than trusting it.

- A path in a message is not a path in a call, and only one of them may
  carry the host's separator. `recordPath` joined with `path.join`, so the
  finding read `deploy/releases/0.0.1.md` on this machine and
  `deploy\releases\0.0.1.md` on Windows, and the criterion fixes the first.
  The wall that found it is the one added two days ago for a different
  runtime, and no other machine in this session could have.
- The unit encoded the defect and looked like a test. It asserted
  `recordPath` equals `join("deploy", "releases", ...)`, which agrees with
  whatever host it runs on and can therefore never disagree. A test written
  in the same terms as the code it tests holds nothing, and the terms here
  were a function call rather than the string a person reads.
- The sweep after the fix answered nothing, and that is worth the minute it
  took. Every other `join` in a finding is an array's, and the one other
  repository relative path is written with literal slashes already, so this
  was the only place the defect could live.

## Lacked

- Nothing tells a build to run the sweep before it writes rather than after
  it fails. The skill says a change to something several seats read carries
  its sweep, and it says it in the section about building, where a reader
  meets it after the code is written.
- The workflow is the only part of this change that nothing here can run,
  and the tree has no way to mark it. `kaal class` reports surface, tool and
  skills moved, and says nothing about a file that only GitHub executes.

## Longed for

- A word in `kaal class` for a change to how the league is built, released
  or verified: three tasks this week have moved something no consumer
  notices and the class wall has had nothing to say about any of them.

Feeds: code
Read: test
