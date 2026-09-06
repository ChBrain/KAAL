// A witness that writes, which is the thing the boundary wall must refuse.
// This file is a fixture and is never imported by the league.
import { readFileSync, writeFileSync } from "node:fs";

export function render(dir) {
  writeFileSync(`${dir}/.witnessed`, "here", "utf8");
  return readFileSync(dir, "utf8");
}
