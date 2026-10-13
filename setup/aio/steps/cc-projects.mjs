/**
 * 手順 8: プロファイルのリポを Concordia のプロジェクトコードに登録する。
 * 未登録のリポは delegation が Actio への束縛を作れず止まる。既存の登録は変えない。
 */
import { join } from "node:path";
import { cached, excubitorBase, serviceBase } from "../context.mjs";
import { requestJson } from "../lib/http.mjs";

const STEP = "cc-projects";

export async function ccProjects(ctx) {
  const { root, profile, report } = ctx;
  const exBase = await cached(ctx, "exBase", () => excubitorBase(root));
  const ccBase = await cached(ctx, "ccBase", () => serviceBase(exBase, "concordia"));
  const current = await requestJson(ccBase, "GET", "/v1/project-codes");
  const plan = planProjectCodes(current?.project_codes ?? [], profile.repos, root);
  for (const entry of plan.existing) report.skip(STEP, `${entry.code}: 登録済み`);
  for (const body of plan.register) {
    if (!report.dryRun) await requestJson(ccBase, "POST", "/v1/project-codes", body);
    report.done(STEP, `${body.code}: ${body.project} を登録`);
  }
}

/** 既存のコードとリポの場所のどちらかが一致するものは登録済みとみなす (純粋関数)。 */
export function planProjectCodes(existingCodes, repos, root) {
  const byCode = new Set(existingCodes.map((entry) => entry.code));
  const byPath = new Set(existingCodes.map((entry) => normalize(entry.repo_path)));
  const existing = [];
  const register = [];
  for (const entry of repos) {
    const repoPath = join(root, entry.dir).replaceAll("\\", "/");
    if (byCode.has(entry.code) || byPath.has(normalize(repoPath))) { existing.push(entry); continue; }
    register.push({ code: entry.code, repo_path: repoPath, project: entry.name, added_by: "aio-setup" });
  }
  return { existing, register };
}

function normalize(path) {
  return String(path ?? "").replaceAll("\\", "/").replace(/\/+$/, "").toLowerCase();
}
