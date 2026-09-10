import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  CATEGORY_DEFINITIONS,
  PUBLIC_SERVICE_GRAPH,
  RELATION_LABELS,
} from "../docs/data/public-service-graph.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const servicesPath = resolve(repoRoot, "docs", "data", "services.json");

test("public service graph stays inside the published service catalog", async () => {
  const catalog = JSON.parse(await readFile(servicesPath, "utf8"));
  const publishedIds = new Set(Object.keys(catalog.services));
  const categoryIds = new Set(CATEGORY_DEFINITIONS.map((category) => category.id));
  const nodeIds = PUBLIC_SERVICE_GRAPH.nodes.map((node) => node.id);

  assert.equal(categoryIds.size, CATEGORY_DEFINITIONS.length, "graph category ids must be unique");
  assert.equal(new Set(nodeIds).size, nodeIds.length, "graph node ids must be unique");
  for (const node of PUBLIC_SERVICE_GRAPH.nodes) {
    assert.match(node.id, /^[A-Za-z0-9._-]+$/u, `${node.id}: repository id must be URL-safe`);
    assert.ok(publishedIds.has(node.id), `${node.id}: graph nodes must exist in the public catalog`);
    assert.ok(categoryIds.has(node.category), `${node.id}: graph category must be defined`);
  }
});

test("public service graph relationships reference known nodes and kinds", () => {
  const nodeIds = new Set(PUBLIC_SERVICE_GRAPH.nodes.map((node) => node.id));
  const relationshipKeys = new Set();

  for (const [from, to, kind] of PUBLIC_SERVICE_GRAPH.edges) {
    assert.ok(nodeIds.has(from), `${from}: relationship source must be a graph node`);
    assert.ok(nodeIds.has(to), `${to}: relationship target must be a graph node`);
    assert.ok(Object.hasOwn(RELATION_LABELS, kind), `${kind}: relationship kind must be defined`);

    const key = `${from}\0${to}\0${kind}`;
    assert.ok(!relationshipKeys.has(key), `${from} -> ${to} (${kind}): relationship must be unique`);
    relationshipKeys.add(key);
  }
});
