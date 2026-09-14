#!/usr/bin/env node
import {
  existsSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { isAbsolute, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseFrontmatter } from "./frontmatter.mjs";

const EVIDENCE = join("kaal", "security", "findings.json");
const HASH = /^[0-9a-f]{64}$/;
const object = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const inside = (root, path) => {
  if (!path || isAbsolute(path)) return null;
  const absolute = resolve(root, path);
  const fromRoot = relative(resolve(root), absolute);
  if (
    fromRoot === ".." ||
    fromRoot.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`)
  )
    return null;
  return absolute;
};

/** Read and validate the complete scanner snapshot held in a tree. */
export function readEvidence(root) {
  const path = join(root, EVIDENCE);
  if (!existsSync(path)) return { state: "absent", findings: [] };
  let data;
  try {
    data = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    return {
      state: "invalid",
      findings: [],
      problems: [`security evidence is unreadable: ${error.message}`],
    };
  }

  const problems = [];
  if (!object(data)) problems.push("security evidence is not an object");
  if (data?.schema !== 1) problems.push("security evidence schema is not 1");
  if (typeof data?.scanner !== "string" || !data.scanner.trim())
    problems.push("security evidence has no scanner");
  if (!Array.isArray(data?.findings))
    problems.push("security evidence findings is not an array");

  const findings = [];
  const identities = new Set();
  if (Array.isArray(data?.findings)) {
    for (const [index, raw] of data.findings.entries()) {
      const at = `security finding ${index + 1}`;
      if (!object(raw)) {
        problems.push(`${at} is not an object`);
        continue;
      }
      if (typeof raw.id !== "string" || !raw.id.trim())
        problems.push(`${at} has no id`);
      if (typeof raw.summary !== "string" || !raw.summary.trim())
        problems.push(`${at} has no summary`);
      if (!object(raw.bindings) || !Object.keys(raw.bindings).length)
        problems.push(`${at} has no bindings`);
      for (const [bound, hash] of Object.entries(raw.bindings ?? {})) {
        if (!inside(root, bound))
          problems.push(`${at} binding escapes the root: ${bound}`);
        if (!HASH.test(hash))
          problems.push(`${at} binding has an invalid SHA-256: ${bound}`);
      }
      const finding = `${data?.scanner}/${raw.id}`;
      if (identities.has(finding))
        problems.push(`duplicate security finding: ${finding}`);
      identities.add(finding);
      findings.push({
        finding,
        id: raw.id,
        summary: raw.summary,
        bindings: raw.bindings,
      });
    }
  }
  return problems.length
    ? { state: "invalid", findings, problems }
    : { state: "gathered", scanner: data.scanner, findings };
}

/** SHA-256 of the complete bytes of one regular file inside root. */
export function contentSha(root, path) {
  const absolute = inside(root, path);
  if (!absolute) throw new Error(`binding escapes the root: ${path}`);
  const actual = realpathSync(absolute);
  const fromRoot = relative(realpathSync(root), actual);
  if (
    fromRoot === ".." ||
    fromRoot.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`)
  )
    throw new Error(`binding escapes the root: ${path}`);
  if (!statSync(actual).isFile())
    throw new Error(`binding is not a regular file: ${path}`);
  return createHash("sha256").update(readFileSync(actual)).digest("hex");
}

/** Compare every pinned whole-file hash with the current checkout. */
export function codeState(root, bindings) {
  const changed = [];
  for (const [path, expected] of Object.entries(bindings ?? {}).sort(
    ([a], [b]) => a.localeCompare(b),
  )) {
    try {
      if (contentSha(root, path) !== expected) changed.push(path);
    } catch {
      changed.push(path);
    }
  }
  return { current: changed.length === 0, changed };
}

/** Judge scanner evidence without consulting waivers. */
export function security(root) {
  const evidence = readEvidence(root);
  if (evidence.state === "absent")
    return { ok: false, findings: ["security evidence is absent"] };
  if (evidence.state === "invalid")
    return { ok: false, findings: evidence.problems };
  const findings = evidence.findings.map((finding) => {
    const state = codeState(root, finding.bindings);
    const changed = state.current
      ? ""
      : `; bound code changed: ${state.changed.join(", ")}`;
    return `${finding.finding}: ${finding.summary}${changed}`;
  });
  return { ok: findings.length === 0, findings };
}

const sameBindings = (left, right) => {
  if (!object(left) || !object(right)) return false;
  const entries = (bindings) =>
    Object.entries(bindings).sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(entries(left)) === JSON.stringify(entries(right));
};

/** Read the finding-specific, content-bound governance acceptances. */
export function securityWaiver(root) {
  const evidence = readEvidence(root);
  if (evidence.state !== "gathered")
    return { waiver: null, reason: `security evidence is ${evidence.state}` };
  if (!evidence.findings.length) return { waiver: null, reason: null };

  const directory = join(root, "waivers", "security");
  const records = [];
  if (existsSync(directory)) {
    for (const name of readdirSync(directory)
      .filter((x) => x.endsWith(".md"))
      .sort()) {
      try {
        records.push({
          name,
          data: parseFrontmatter(readFileSync(join(directory, name), "utf8"))
            .data,
        });
      } catch (error) {
        return {
          waiver: null,
          reason: `security waiver ${name} is unreadable: ${error.message}`,
        };
      }
    }
  }

  const accepted = [];
  for (const finding of evidence.findings) {
    const matches = records.filter(
      (record) => record.data.finding === finding.finding,
    );
    if (matches.length !== 1)
      return {
        waiver: null,
        reason: matches.length
          ? `duplicate security waivers for ${finding.finding}`
          : `security waiver missing for ${finding.finding}`,
      };
    const { name, data } = matches[0];
    for (const field of ["kind", "finding", "who", "why", "bindings"])
      if (!data[field])
        return {
          waiver: null,
          reason: `security waiver ${name} missing ${field}`,
        };
    if (data.kind !== "security")
      return {
        waiver: null,
        reason: `security waiver ${name} has another kind`,
      };
    if (Object.hasOwn(data, "wall") || Object.hasOwn(data, "until"))
      return {
        waiver: null,
        reason: `security waiver ${name} uses a dated wall waiver field`,
      };
    if (!sameBindings(data.bindings, finding.bindings))
      return {
        waiver: null,
        reason: `security waiver ${name} bindings do not match`,
      };
    const current = codeState(root, data.bindings);
    if (!current.current)
      return {
        waiver: null,
        reason: `security waiver ${name} bound code changed: ${current.changed.join(", ")}`,
      };
    accepted.push(data);
  }
  return {
    waiver: {
      kind: "security",
      who: [...new Set(accepted.map((x) => x.who))].join(", "),
      why: accepted.map((x) => x.why).join("; "),
    },
    reason: null,
  };
}

const invoked = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href === import.meta.url
  : false;
if (invoked) {
  const result = security(process.cwd());
  for (const finding of result.findings) console.log(finding);
  process.exitCode = result.ok ? 0 : 1;
}
