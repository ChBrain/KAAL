// One shape of frontmatter: `key: value` lines between `---` fences, values
// bare or in double quotes, nothing nested. Every frontmatter the league reads
// (skills, records, retros) is flat, so one parser, tested once, no dependency.

/**
 * @param {string} text
 * @returns {{ data: Record<string, string>, body: string }}
 */
export function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m)
    throw new Error("no frontmatter: expected a `---` fenced block at the top");
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    const raw = kv[2].trim();
    data[kv[1]] = /^".*"$/.test(raw)
      ? raw.slice(1, -1).replace(/\\"/g, '"')
      : raw;
  }
  return { data, body: m[2] };
}
