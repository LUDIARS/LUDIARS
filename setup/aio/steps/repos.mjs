/**
 * 手順 2: 不足リポの clone、クリーンな base checkout の fast-forward pull、submodule の初期化。
 * 作業中の変更や別ブランチの checkout には触らない。
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { run, runOrThrow } from "../lib/exec.mjs";

const STEP = "repos";

export async function repos(ctx) {
  const { root, profile, report } = ctx;
  for (const entry of profile.repos) {
    const dir = join(root, entry.dir);
    if (!existsSync(join(dir, ".git"))) {
      if (!report.dryRun) runOrThrow("gh", ["repo", "clone", entry.repo, dir, "--", "--quiet"]);
      report.done(STEP, `${entry.name}: clone`);
    } else {
      updateCheckout(entry, dir, report);
    }
    initSubmodules(entry, dir, report);
  }
}

function updateCheckout(entry, dir, report) {
  const branch = run("git", ["branch", "--show-current"], { cwd: dir }).stdout.trim();
  const dirty = run("git", ["status", "--porcelain", "--untracked-files=no"], { cwd: dir }).stdout.trim();
  if (branch !== "main" || dirty) {
    report.skip(STEP, `${entry.name}: ${branch || "detached"} で作業中のため pull しない`);
    return;
  }
  if (report.dryRun) { report.done(STEP, `${entry.name}: fetch と fast-forward`); return; }
  run("git", ["fetch", "--quiet", "origin"], { cwd: dir });
  const behind = Number(run("git", ["rev-list", "--count", "HEAD..origin/main"], { cwd: dir }).stdout.trim() || 0);
  if (behind === 0) { report.skip(STEP, `${entry.name}: 最新`); return; }
  const result = run("git", ["merge", "--ff-only", "--quiet", "origin/main"], { cwd: dir });
  if (result.code !== 0) report.warn(STEP, `${entry.name}: fast-forward できないため手で確認してください`);
  else report.done(STEP, `${entry.name}: ${behind} コミット取り込み`);
}

function initSubmodules(entry, dir, report) {
  if (!existsSync(join(dir, ".gitmodules"))) return;
  const status = run("git", ["submodule", "status", "--recursive"], { cwd: dir }).stdout;
  if (!status.split(/\r?\n/).some((line) => line.startsWith("-"))) return;
  if (!report.dryRun) runOrThrow("git", ["submodule", "update", "--init", "--recursive"], { cwd: dir });
  report.done(STEP, `${entry.name}: submodule を初期化`);
}
