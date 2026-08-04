#!/usr/bin/env node
// Validates the service map. `service-map.json` is consumed by tooling and
// `ServiceMap.md` is read by people; both are maintained by hand.
//
// Two severities, because they are two different problems:
//
//   failures  — the JSON is unusable (unparseable, wrong shape, empty, an entry
//               with no name or role). Tooling breaks on these, so they exit
//               non-zero.
//   warnings  — an entry present in the JSON but not mentioned in the markdown.
//               Reported, not enforced: adding a repo to the routing source
//               before writing it up is a legitimate intermediate state, and
//               blocking it would only push people to bypass the check.
//
// Tier 1 / 2 entries appear in the markdown as links, Tier 3 and the records
// repos as a plain comma-separated list, so the mention check accepts either.

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const warnings = [];

function read(name) {
  try {
    return readFileSync(join(root, name), "utf8");
  } catch (error) {
    failures.push(`${name} is unreadable: ${error.message}`);
    return null;
  }
}

// A name counts as mentioned when it appears without being glued to a longer
// identifier, so `Ars` is not satisfied by `Ars-Musa`. Names contain `-` and
// `*`, hence the escape.
function isMentioned(markdown, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^A-Za-z0-9-])${escaped}([^A-Za-z0-9-]|$)`).test(markdown);
}

const rawJson = read("service-map.json");
const rawMarkdown = read("ServiceMap.md");

let repos = [];
if (rawJson !== null) {
  let parsed;
  try {
    parsed = JSON.parse(rawJson);
  } catch (error) {
    failures.push(`service-map.json is not valid JSON: ${error.message}`);
  }
  if (parsed !== undefined) {
    if (parsed === null || typeof parsed !== "object" || !Array.isArray(parsed.repos)) {
      failures.push("service-map.json has no repos array");
    } else if (parsed.repos.length === 0) {
      failures.push("service-map.json lists no repos");
    } else {
      repos = parsed.repos;
    }
  }
}

for (const [index, repo] of repos.entries()) {
  if (repo === null || typeof repo !== "object") {
    failures.push(`entry ${index} is not an object: ${JSON.stringify(repo)}`);
    continue;
  }
  if (typeof repo.name !== "string" || repo.name.length === 0) {
    failures.push(`an entry has no name: ${JSON.stringify(repo)}`);
    continue;
  }
  if (typeof repo.role !== "string" || repo.role.length === 0) {
    failures.push(`${repo.name} has no role`);
  }
  if (rawMarkdown !== null && !isMentioned(rawMarkdown, repo.name)) {
    warnings.push(`${repo.name} is in service-map.json but not mentioned in ServiceMap.md`);
  }
}

if (warnings.length > 0) {
  process.stderr.write(`${warnings.join("\n")}\n`);
  process.stderr.write(`${warnings.length} entr(y|ies) drifted between the two sources.\n`);
}

if (failures.length > 0) {
  process.stderr.write(`${failures.join("\n")}\n`);
  process.stderr.write(`${failures.length} service-map problem(s).\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`${repos.length} repo entr(y|ies) are structurally valid.\n`);
}
