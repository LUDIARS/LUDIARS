/**
 * 手順 11: 流出語の検査。Revisor の検査関数を使い、プロファイルの全リポの
 * 未 push コミット (全ブランチ) と未コミット差分を調べる。出すのは term id と件数だけ (値は出さない)。
 * 語ファイルが無い PC では検査できないことを警告する (語を同梱しない設計のため)。
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { run } from "../lib/exec.mjs";

const STEP = "leak-check";

export async function leakCheck(ctx) {
  const { root, profile, report } = ctx;
  const termsFile = process.env.REVISOR_CONFIDENTIAL_TERMS_FILE || join(root, ".claude", "state", "confidential-terms.json");
  if (!existsSync(termsFile)) {
    report.warn(STEP, "流出語ファイルがありません。REVISOR_CONFIDENTIAL_TERMS_FILE に語ファイル (リポ外) を用意してください");
    return;
  }
  const module = await import(pathToFileURL(join(root, "Revisor", "src", "confidential-terms.mjs")).href);
  const policy = module.loadConfidentialPolicy(termsFile);
  let total = 0;
  for (const entry of profile.repos) {
    const dir = join(root, entry.dir);
    if (!existsSync(join(dir, ".git"))) continue;
    const findings = scanRepo(module, policy.terms, dir);
    if (!findings.length) continue;
    total += findings.length;
    const ids = [...new Set(findings)].join(",");
    const enforced = module.isConfidentialTermsEnforced(policy, entry.repo);
    report.fail(STEP, `${entry.repo} [${enforced ? "enforced" : "exempt"}]: ${findings.length} 件 (${ids})`);
  }
  if (!total) report.done(STEP, `${profile.repos.length} リポに所見なし`);
}

/** 未 push コミット (件名・本文・差分) と未コミット差分の所見の term id を返す。 */
function scanRepo(module, terms, dir) {
  const git = (args) => run("git", args, { cwd: dir }).stdout;
  const ids = [];
  const fromDiff = (diff) => module.scanAddedDiffForConfidentialTerms(diff, terms).findings.map((finding) => finding.termId);
  ids.push(...fromDiff(git(["diff", "HEAD"])));
  ids.push(...fromDiff(git(["log", "--branches", "--not", "--remotes", "-p", "--format="])));
  for (const message of git(["log", "--branches", "--not", "--remotes", "--format=%x00%s%n%b"]).split("\0").filter(Boolean)) {
    ids.push(...module.scanTextForConfidentialTerms(message, terms, "[msg]").map((finding) => finding.termId));
  }
  return ids;
}
