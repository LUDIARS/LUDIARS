import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const snapshotsPath = resolve(repoRoot, "docs", "data", "snapshots.json");

test("snapshot catalog keeps a unique, resolvable latest entry", async () => {
  const catalog = JSON.parse(await readFile(snapshotsPath, "utf8"));

  assert.ok(Array.isArray(catalog.snapshots));
  assert.ok(catalog.snapshots.length > 0);

  const dates = catalog.snapshots.map((snapshot) => snapshot.date);
  for (const date of dates) {
    assert.match(date, /^\d{4}-\d{2}-\d{2}$/u, "snapshot dates must use YYYY-MM-DD");
  }
  assert.equal(new Set(dates).size, dates.length, "snapshot dates must be unique");
  assert.deepEqual(dates, [...dates].sort(), "snapshots must be chronological");

  for (const snapshot of catalog.snapshots) {
    assert.ok(
      Number.isFinite(snapshot.weighted_completion)
        && snapshot.weighted_completion >= 0
        && snapshot.weighted_completion <= 100,
      `${snapshot.date}: weighted completion must be a number from 0 to 100`,
    );

    for (const [repo, completion] of Object.entries(snapshot.repos)) {
      assert.match(repo, /\S/u);
      assert.ok(
        Number.isFinite(completion) && completion >= 0 && completion <= 100,
        `${snapshot.date}: ${repo} completion must be a number from 0 to 100`,
      );
    }

    assert.equal(
      snapshot.md,
      `snapshots/${snapshot.date}.md`,
      `${snapshot.date}: Markdown path must match the snapshot date`,
    );
    const markdown = await stat(resolve(repoRoot, "docs", snapshot.md));
    assert.ok(markdown.isFile(), `${snapshot.date}: Markdown path must resolve to a file`);
  }

  const latest = catalog.snapshots.at(-1);
  assert.equal(catalog.latest, latest.date);
  assert.match(latest._calc, /\S/u, "latest snapshot must explain its calculation");

  const latestMarkdown = await readFile(resolve(repoRoot, "docs", latest.md), "utf8");
  assert.match(
    latestMarkdown,
    new RegExp(`^# LUDIARS Services Daily Report — ${latest.date}$`, "mu"),
    "latest Markdown heading must identify the snapshot date",
  );
  for (const section of ["今日の要約", "ワークストリーム別の変更", "集計上の制約", "完成度", "集計ルール"]) {
    assert.match(latestMarkdown, new RegExp(`^## ${section}$`, "mu"));
  }
});
