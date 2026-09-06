// The sink, which may write, and reaches the network, which it may not.
import { writeFileSync } from "node:fs";

export const write = async (path, url) => {
  const r = await fetch(url);
  return writeFileSync(path, await r.text());
};
