/**
 * 手順 9: プロファイルのリポを Revisor に登録し、PR の審査 (流出語の検査を含む) を通るようにする。
 * 審査テストはリポの中身から決める。既存の登録は --refresh のときだけ更新する。
 * 登録で入る pre-push フックは LUDIARS の規約 (main 直 push 禁止・Revisor PR 経由) どおりの挙動。
 */
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runOrThrow } from "../lib/exec.mjs";

const STEP = "revisor";

export async function revisor(ctx) {
  const { root, profile, report } = ctx;
  const cli = join(root, "Revisor", "src", "cli.mjs");
  if (!existsSync(cli)) throw new Error("Revisor が見つかりません。repos 手順を先に実行してください。");
  const listed = JSON.parse(runOrThrow(process.execPath, [cli, "repo", "list", "--json"]).stdout || "[]");
  const registered = new Set((listed.repositories ?? listed).map((entry) => entry.repository));
  const work = mkdtempSync(join(tmpdir(), "aio-revisor-"));
  try {
    for (const entry of profile.repos) {
      if (registered.has(entry.repo) && !ctx.args.refresh) { report.skip(STEP, `${entry.repo}: 登録済み`); continue; }
      const dir = join(root, entry.dir);
      const testCases = deriveTestCases(repoFacts(dir), entry.reviewCheck);
      if (!report.dryRun) {
        const file = join(work, `${entry.name}.json`);
        writeFileSync(file, JSON.stringify({ repository: entry.repo, root_path: dir.replaceAll("\\", "/"), base_ref: "main", test_cases: testCases }));
        try {
          runOrThrow(process.execPath, [cli, "repo", "register", "--json-file", file]);
        } catch (error) {
          throw new Error(registerFailure(entry.repo, dir, error));
        }
      }
      report.done(STEP, `${entry.repo}: ${testCases.map((testCase) => testCase.name).join(" → ")}`);
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

/**
 * 登録の失敗にリポ名を付ける。git が途中で落ちて残ったロックが原因らしいときは対処を添える
 * (別の git が本当に動いている可能性があるので、ロックは自動では消さない)。
 */
export function registerFailure(repo, dir, error) {
  const message = error instanceof Error ? error.message : String(error);
  const stale = /index\.lock|Another git process/i.test(message);
  const hint = stale
    ? `\n${dir}/.git/index.lock が残っています。git のプロセスが動いていないことを確かめてから削除し、再実行してください。`
    : "";
  return `${repo} の Revisor 登録に失敗しました: ${message}${hint}`;
}

function repoFacts(dir) {
  const pkgPath = join(dir, "package.json");
  const scripts = existsSync(pkgPath) ? JSON.parse(readFileSync(pkgPath, "utf8")).scripts ?? {} : null;
  return {
    hasGitmodules: existsSync(join(dir, ".gitmodules")),
    hasLockfile: existsSync(join(dir, "package-lock.json")),
    scripts,
  };
}

/**
 * 審査テストを決める (純粋関数)。
 * - submodule があれば最初に初期化する (審査用のコピーでは未初期化のため)。
 * - npm のリポは install と、存在する typecheck / test。
 * - PowerShell の検査スクリプトは、Windows PowerShell 5.1 で $PSScriptRoot が param 既定値に入らないため
 *   リポのルートを引数で渡す。
 */
export function deriveTestCases(facts, reviewCheck) {
  const cases = [];
  const testCase = (name, command, args) => ({ name, command, args, cwd: "." });
  if (facts.hasGitmodules) cases.push(testCase("submodules", "git", ["submodule", "update", "--init", "--recursive"]));
  if (facts.scripts) {
    cases.push(testCase("install", "npm", [facts.hasLockfile ? "ci" : "install", "--include=dev"]));
    for (const script of ["typecheck", "test"]) {
      if (facts.scripts[script]) cases.push(testCase(script, "npm", script === "test" ? ["test"] : ["run", script]));
    }
  }
  if (reviewCheck?.kind === "powershell") {
    cases.push(testCase("repository", "powershell", [
      "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", reviewCheck.script, reviewCheck.rootArg, ".",
    ]));
  }
  // npm も検査スクリプトも無いリポ (スキル集・C++ など) も登録して流出語の検査を通す。
  // Revisor は審査テストを 1 件以上要求するので、軽い整合性検査を置く。
  const hasCheck = cases.some((entry) => !["submodules", "install"].includes(entry.name));
  if (!hasCheck) cases.push(testCase("git-integrity", "git", ["fsck", "--connectivity-only", "--no-progress"]));
  return cases;
}
