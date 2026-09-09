# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifty-seventh use of the analyse skill, on
`requirements/a-requirement-names-what-it-supersedes` (six criteria, six red
tests), 9 September 2026.
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

## Longed for

- A way to price a recommendation before making it. The cost of the wrong
  one here was one message; on a bigger fork it is a build.

Feeds: analyse
Read: test
