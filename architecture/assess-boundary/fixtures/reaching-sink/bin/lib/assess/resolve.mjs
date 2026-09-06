// A reader beside the sink.
import { readFileSync } from "node:fs";

export const read = (path) => readFileSync(path, "utf8");
