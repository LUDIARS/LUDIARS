/**
 * 手順 3: npm の依存を devDependencies 込みで入れる。
 * - NODE_ENV=production が環境にあっても devDependencies を落とさない。
 * - @ludiars の GitHub Packages は gh のトークンを実行時引数でだけ渡し、ファイルに書かない。
 * - install が書き換えた lock ファイルは元に戻す (lock の差分をコミットしない規約)。
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { npm, run } from "../lib/exec.mjs";

const STEP = "deps";

export async function deps(ctx) {
  const { root, profile, report } = ctx;
  let token = null;
  for (const entry of profile.repos) {
    for (const sub of entry.installDirs ?? ["."]) {
      const dir = join(root, entry.dir, sub);
      if (!existsSync(join(dir, "package.json"))) continue;
      const label = sub === "." ? entry.name : `${entry.name}/${sub}`;
      if (isInstalled(dir) && !ctx.args.refresh) { report.skip(STEP, `${label}: 導入済み`); continue; }
      if (report.dryRun) { report.done(STEP, `${label}: npm install`); continue; }
      if (needsGithubPackages(dir)) token ??= githubToken();
      install(dir, token, { fresh: !existsSync(join(dir, "node_modules")) });
      restoreLockfile(dir);
      report.done(STEP, `${label}: 導入`);
    }
  }
}

/**
 * node_modules に npm の記録があれば導入済みとみなす。
 * 稼働中のサービスの node_modules を消さないため、lock との時刻比較で入れ直しを決めない
 * (lock を元に戻すと時刻が進み、毎回入れ直しになる)。入れ直しは --refresh で明示する。
 */
export function isInstalled(dir) {
  return existsSync(join(dir, "node_modules", ".package-lock.json"));
}

function needsGithubPackages(dir) {
  const npmrc = join(dir, ".npmrc");
  return existsSync(npmrc) && readFileSync(npmrc, "utf8").includes("npm.pkg.github.com");
}

function githubToken() {
  const result = run("gh", ["auth", "token"]);
  if (result.code !== 0 || !result.stdout.trim()) throw new Error("gh auth token でトークンを取得できません。");
  return result.stdout.trim();
}

/** 未導入なら ci、導入済みの入れ直し (--refresh) は node_modules を消さない install。 */
function install(dir, token, { fresh }) {
  const verb = fresh && existsSync(join(dir, "package-lock.json")) ? "ci" : "install";
  const args = [verb, "--include=dev", "--no-audit", "--no-fund"];
  if (token) args.push(`--//npm.pkg.github.com/:_authToken=${token}`);
  npm(args, { cwd: dir, env: { NODE_ENV: "development" } });
}

function restoreLockfile(dir) {
  const changed = run("git", ["diff", "--quiet", "--", "package-lock.json"], { cwd: dir }).code !== 0;
  if (changed) run("git", ["checkout", "--", "package-lock.json"], { cwd: dir });
}
