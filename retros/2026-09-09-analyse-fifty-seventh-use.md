# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifty-seventh use of the analyse skill, on
`requirements/an-artefact-traces-what-it-came-from` (six criteria, six red
tests), 9 September 2026. Written first as
`a-requirement-names-what-it-supersedes`, one link kind on one artefact, and
rewritten in the same use when the asker named the general concept.
Place: this repository

## Liked

- Counting what the league writes against what it reads took one loop and
  overturned the whole shape of the task. Six link kinds are written; two
  have their values read. That table was the requirement's spine and it cost
  a minute.
- The three fixtures are a flat pair, a requirement and a four line test,
  copied from `a-task-names-its-people`. No tree, no nesting, and the wall's
  verdict comes from the requirement alone. Test 3 went red saying
  `ok closed dangling`, which is the fixture working and the rule missing:
  red for its own reason, on the first run.

## Learned

- I recommended the wrong mechanism and the run said so. Having found that
  the league already writes `Supersedes:` forty-four times, I argued for a
  reader over the body line and against the asker's frontmatter. Then I read
  the twelve values that name something and **none of the twelve is a name a
  script can read**: every one is a sentence, eight wrap onto a second line,
  one names a pull request. A body line reader would have had to parse
  English. The count I had (44 written, 0 read) was true and the conclusion
  I drew from it was wrong, because I counted the lines and never read them.
- Frontmatter's argument is not anchoring, which is what I put to the asker.
  It is that a key forces the value to be a value. The anchoring argument was
  the one I could reach from the tree's structure; the real one needed the
  twelve values on screen.
- I wrote the special case and the asker named the general one. The task
  was `supersedes` on requirements, and the ask that arrived while it was
  being pushed was "an architecture artifact traces back to requirements and
  principles (maybe other things) ... General concept of tracing needed."
  Shipping the special case first would have fixed `supersedes` as a top
  level key that the general shape then had to move, which is the two homes
  defect one level up, paid for by migrating 54 files twice. The rewrite
  cost twenty minutes because nothing had merged.
- The generalisation was cheap for a reason I could have found earlier. The
  frontmatter parser reads one level of map, which is how the standard's
  `metadata` works, so `traces:` with kinds beneath it parses today with no
  change to a module that has five callers. I had read that parser and
  quoted its comment about one level of map in the first requirement, and
  still wrote a flat key. Reading a thing is not the same as asking what it
  makes possible.
- A both ways link is not always available. Criterion 4 reads one direction,
  frontmatter to prose, because the reverse is finding a task name inside
  "two, both in `security-v1` and `operate`". Saying so in an assumption is
  worth more than a criterion that claims a link the board cannot hold.

## Lacked

- No instruction to read the values of a line before proposing a reader for
  it. Section 1 says to read the closed requirements and their tests, which
  is about what is held; nothing says to read what the pages actually say in
  the field the task is about. Counting is not reading, and I did the first
  and called it the second.
- Nothing about a task the ask names in six parts. The skill says to count
  the tasks and take the first, and it does not say how to record the other
  five so they are found again. They went into `Unblocks:` as prose, which
  is the same unreadable line this task exists to fix.
- No step between counting the tasks and writing the first one that asks
  whether the first is an instance of something. Section 1 splits an ask and
  forbids enlarging it, and both were followed; what was missing is the
  question of whether the piece taken is the general shape or one case of
  it, which is a different question from how many tasks there are.

## Longed for

- A way to price a recommendation before making it. The cost of the wrong
  one here was one message; on a bigger fork it is a build.

Feeds: analyse
Read: test
