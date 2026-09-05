# Waivers

A waiver is a human letting a red wall through, visibly, for a stated time.
One file per wall, `waivers/<wall>.md`, with four frontmatter fields:

```
---
wall: format
who: Kai
why: the formatter's next release fixes the fixture it trips on
until: 2026-09-12
---
```

The wall still runs. The board prints `waived <wall> by <who>: <why> (until
<date>)` instead of `FAIL`, and counts it apart from failing walls. An
expired waiver, or one missing a field, counts for nothing and its reason
is printed beside the `FAIL`. A waiver on a green wall is reported as unused
so it gets removed. The file lives in history; that is the audit.
