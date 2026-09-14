// Acceptance tests for a-seat-claims-its-work-before-doing-it. One per
// criterion. Surface only: the operating contract and a provider-neutral
// lifecycle decision over normalized, deterministic repository evidence.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const LEAGUE = join(HERE, "..", "..");
const ROOT = process.env.KAAL_ACCEPTANCE_ROOT || LEAGUE;
const FIXTURES = join(HERE, "fixtures");
const contract = () => readFileSync(join(ROOT, "AGENTS.md"), "utf8");
const cycle = () => {
  const text = contract();
  const marker = text.search(/every (declared )?seat/i);
  assert.notEqual(
    marker,
    -1,
    "the contract does not apply a cycle to every seat",
  );
  const before = text.lastIndexOf("\n## ", marker);
  const after = text.indexOf("\n## ", marker);
  return text.slice(
    before === -1 ? 0 : before,
    after === -1 ? text.length : after,
  );
};
const lifecycle = (name) =>
  spawnSync(
    process.execPath,
    [join(ROOT, "bin", "kaal.mjs"), "lifecycle", join(FIXTURES, name)],
    { cwd: ROOT, encoding: "utf8" },
  );
const said = (r) =>
  `${r.error ? `${r.error.message}: ` : ""}${r.stdout}${r.stderr}`;
const valid = (name) => {
  const r = lifecycle(name);
  assert.equal(r.status, 0, `${name}: ${said(r)}`);
  assert.match(r.stdout, /valid|in[- ]flight/i, `${name}: ${said(r)}`);
  return r;
};
const red = (name) => {
  const r = lifecycle(name);
  assert.equal(r.status, 1, `${name}: ${said(r)}`);
  assert.match(r.stderr, /red|invalid|refus/i, `${name}: ${said(r)}`);
  return r;
};

test("1. one operating contract names the ordered cycle and truth boundaries", () => {
  const text = cycle();
  assert.match(text, /every (declared )?seat/i);
  const positions = ["Plan", "Do", "Check", "Act"].map((name) =>
    text.search(new RegExp(`\\b${name}\\b`, "i")),
  );
  assert.ok(
    positions.every((n) => n >= 0),
    `a step is absent: ${positions}`,
  );
  assert.deepEqual(
    positions,
    [...positions].sort((a, b) => a - b),
  );
  assert.match(text, /Plan[^.]*draft\s+pull\s+request/i);
  assert.match(text, /Plan[^.]*own\s+backlog|own\s+backlog[^.]*Plan/i);
  assert.match(text, /Plan[^.]*before[^.]*Do/i);
  assert.match(text, /Do[^.]*claim/i);
  assert.match(text, /Check[^.]*proof/i);
  assert.match(text, /Check[^.]*board/i);
  assert.match(text, /Check[^.]*retro/i);
  assert.match(text, /Check[^.]*reconcil/i);
  assert.match(text, /Act[^.]*draft[^.]*ready/i);
  assert.match(text, /pull\s+request[^.]*execution\s+container/i);
  assert.match(text, /backlog[^.]*repository-owned\s+claim/i);
  assert.match(text, /merged\s+product\s+content[^.]*truth/i);
  assert.match(text, /unmerged\s+product\s+content[^.]*not[^.]*truth/i);
});

test("2. a draft lane accepts one or many claims from its own seat", () => {
  const one = valid("draft-one.json");
  assert.match(one.stdout, /analyst/i);
  assert.match(one.stdout, /R-1/);
  const many = valid("draft-many.json");
  assert.match(many.stdout, /analyst/i);
  assert.match(many.stdout, /R-1/);
  assert.match(many.stdout, /R-2/);
});

test("3. a claim from another seat is red", () => {
  const r = red("other-seat.json");
  assert.match(r.stderr, /analyst/i);
  assert.match(r.stderr, /architect/i);
});

test("4. a ready lane without its exact backlog claim is red", () => {
  const r = red("ready-without-exact-claim.json");
  assert.match(r.stderr, /310/);
  assert.match(r.stderr, /exact|claim|backlog/i);
});

test("5. a ready lane with any unreconciled item is red", () => {
  const r = red("ready-unreconciled.json");
  assert.match(r.stderr, /R-2/);
  assert.match(r.stderr, /unreconcil|completed|removed|blocked/i);
});

test("6. ready accepts every truthful terminal state and rejects a false block", () => {
  const ok = valid("ready-reconciled.json");
  for (const item of ["R-1", "R-2", "R-3"])
    assert.match(ok.stdout, new RegExp(item));
  const no = red("ready-false-block.json");
  assert.match(no.stderr, /R-3/);
  assert.match(no.stderr, /block/i);
});

test("7. durable order accepts claim before work and rejects its inverse", () => {
  const after = valid("claim-before-work.json");
  assert.match(after.stdout, /claim-1/);
  assert.match(after.stdout, /work-1/);
  assert.match(after.stdout, /before|ancestry|order/i);

  const before = red("work-before-claim.json");
  assert.match(before.stderr, /work-1/);
  assert.match(before.stderr, /claim-1/);
  assert.match(before.stderr, /before|ancestry|order/i);

  const unknown = red("order-not-established.json");
  const out = said(unknown);
  assert.match(out, /not established|cannot be established|unknown/i);
  assert.doesNotMatch(out, /work[^\n]*(before|after)[^\n]*claim/i);
});
