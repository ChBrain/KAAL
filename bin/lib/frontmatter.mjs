// One shape of frontmatter: `key: value` lines between `---` fences, values
// bare or in double quotes, and one level of map: a key with no value
// followed by indented `sub: value` lines (the standard's `metadata`). A key
// with no value and nothing indented stays the empty string, so every reader
// (skills, records, waivers, retros) sees what it always saw. One parser,
// tested once, no dependency.

const value = (raw) =>
  /^".*"$/.test(raw) ? raw.slice(1, -1).replace(/\\"/g, '"') : raw;

/**
 * @param {string} text
 * @returns {{ data: Record<string, string | Record<string, string>>, body: string }}
 */
export function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m)
    throw new Error("no frontmatter: expected a `---` fenced block at the top");
  const data = {};
  let open = null;
  for (const line of m[1].split(/\r?\n/)) {
    const sub = open && line.match(/^\s+([A-Za-z_][\w-]*):\s*(.*)$/);
    if (sub) {
      if (data[open] === "") data[open] = {};
      data[open][sub[1]] = value(sub[2].trim());
      continue;
    }
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    data[kv[1]] = value(kv[2].trim());
    open = data[kv[1]] === "" ? kv[1] : null;
  }
  return { data, body: m[2] };
}
