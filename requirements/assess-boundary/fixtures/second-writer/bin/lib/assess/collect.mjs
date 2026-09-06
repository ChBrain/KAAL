// A second writer, which the boundary refuses.
import { readFileSync, mkdirSync } from "node:fs";

export const collect = (dir) => {
  mkdirSync(dir, { recursive: true });
  return readFileSync(dir, "utf8");
};
