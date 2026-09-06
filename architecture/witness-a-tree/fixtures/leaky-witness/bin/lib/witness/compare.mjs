// A witness module that only reads, so the wall names its neighbour and not
// this one. A fixture; never imported by the league.
import { readFileSync } from "node:fs";

export function compare(dir, text) {
  return readFileSync(dir, "utf8") === text ? [] : [{ path: dir }];
}
