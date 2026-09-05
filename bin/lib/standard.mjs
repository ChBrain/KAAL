// The pin against the live text. The league mirrors the Agent Skills
// specification as a wall and pins the text it mirrored by hash; this
// compares that hash with the text as it is now, from a local file or from
// the pinned URL, and says unchanged or drift. It never moves the pin:
// re-pinning is a hand edit after reconciling the mirror rule by rule.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

/**
 * @param {string} root a directory holding kaal.config.json
 * @param {string|null} source a local path to hash instead of fetching the url
 * @returns {Promise<{ live: string, pinned: string, same: boolean, from: string }>}
 */
export async function compareSpec(root, source = null) {
  const spec = JSON.parse(readFileSync(join(root, "kaal.config.json"), "utf8"))
    .standard?.spec;
  if (!spec?.sha256 || !spec?.url)
    throw new Error("kaal.config.json names no standard.spec.url and sha256");
  let bytes;
  if (source) bytes = readFileSync(join(root, source));
  else {
    const r = await fetch(spec.url);
    if (!r.ok) throw new Error(`${spec.url}: ${r.status}`);
    bytes = Buffer.from(await r.arrayBuffer());
  }
  const live = sha256(bytes);
  return {
    live,
    pinned: spec.sha256,
    same: live === spec.sha256,
    from: source ?? spec.url,
  };
}
