#!/usr/bin/env node
/**
 * LUDIARS All-In-One-Setup — 何度実行しても同じ結果になるセットアップ。
 * 設計: spec/plan/2026-10-14-aio-setup-cdgd.md
 *
 *   node setup/aio/main.mjs --profile cdgd [--root <dir>] [--only a,b] [--skip a,b]
 *                           [--with-native] [--refresh] [--dry-run]
 */
import { pathToFileURL } from "node:url";
import { createContext, resolveRoot } from "./context.mjs";
import { createReport } from "./lib/report.mjs";
import { resolveProfile } from "./profiles.mjs";
import { actioDb } from "./steps/actio-db.mjs";
import { build } from "./steps/build.mjs";
import { ccProjects } from "./steps/cc-projects.mjs";
import { deps } from "./steps/deps.mjs";
import { excubitor } from "./steps/excubitor.mjs";
import { leakCheck } from "./steps/leak-check.mjs";
import { native } from "./steps/native.mjs";
import { prereq } from "./steps/prereq.mjs";
import { repos } from "./steps/repos.mjs";
import { revisor } from "./steps/revisor.mjs";
import { services } from "./steps/services.mjs";
import { vaultDefaults } from "./steps/vault-defaults.mjs";

export const STEPS = [
  ["prereq", prereq],
  ["repos", repos],
  ["deps", deps],
  ["build", build],
  ["excubitor", excubitor],
  ["vault-defaults", vaultDefaults],
  ["actio-db", actioDb],
  ["cc-projects", ccProjects],
  ["revisor", revisor],
  ["services", services],
  ["leak-check", leakCheck],
  ["native", native],
];

export function parseArgs(argv) {
  const args = { profile: null, root: undefined, only: null, skip: [], withNative: false, refresh: false, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const value = () => {
      const next = argv[++i];
      if (next === undefined || next.startsWith("--")) throw new Error(`${flag} に値がありません`);
      return next;
    };
    if (flag === "--profile") args.profile = value();
    else if (flag === "--root") args.root = value();
    else if (flag === "--only") args.only = value().split(",").map((s) => s.trim()).filter(Boolean);
    else if (flag === "--skip") args.skip = value().split(",").map((s) => s.trim()).filter(Boolean);
    else if (flag === "--with-native") args.withNative = true;
    else if (flag === "--refresh") args.refresh = true;
    else if (flag === "--dry-run") args.dryRun = true;
    else throw new Error(`未知の引数: ${flag}`);
  }
  if (!args.profile) throw new Error("--profile を指定してください (例: --profile cdgd)");
  const known = new Set(STEPS.map(([id]) => id));
  for (const id of [...(args.only ?? []), ...args.skip]) if (!known.has(id)) throw new Error(`未知の手順: ${id}`);
  return args;
}

/** 実行する手順を決める。native は --with-native のときだけ。 */
export function selectSteps(args) {
  return STEPS.filter(([id]) =>
    (id !== "native" || args.withNative)
    && (!args.only || args.only.includes(id))
    && !args.skip.includes(id));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = resolveRoot(args.root);
  const profile = resolveProfile(args.profile, { withNative: args.withNative });
  const report = createReport({ dryRun: args.dryRun });
  const ctx = createContext({ root, profile, args, report });
  console.log(`LUDIARS All-In-One-Setup: profile=${profile.name} root=${root}${args.dryRun ? " (dry-run)" : ""}`);
  for (const [id, step] of selectSteps(args)) {
    try {
      await step(ctx);
    } catch (error) {
      report.fail(id, error instanceof Error ? error.message : String(error));
      break;
    }
  }
  const { counts, failed } = report.summary();
  console.log(`\n要約: ${Object.entries(counts).map(([status, n]) => `${status} ${n}`).join(" / ")}`);
  if (failed.length) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
