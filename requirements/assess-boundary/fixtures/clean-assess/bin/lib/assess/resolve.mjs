// A reader: it opens files and returns text.
import { readFileSync } from "node:fs";

export const read = (path) => readFileSync(path, "utf8");
