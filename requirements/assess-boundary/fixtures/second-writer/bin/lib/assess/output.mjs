// The one module that may write: the caller named the path.
import { writeFileSync } from "node:fs";

export const write = (path, text) => writeFileSync(path, text);
