// A test beside the modules: it writes to a temporary directory, which is
// not a breach of the boundary, and the wall never reads it.
import { mkdtempSync, writeFileSync } from "node:fs";

mkdtempSync("probe-");
writeFileSync("probe.txt", "x");
