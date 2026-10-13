/** 手順 1: node / git / gh と GitHub Packages の読み取り権限、NODE_ENV を確かめる。 */
import { run } from "../lib/exec.mjs";

const STEP = "prereq";
const MIN_NODE_MAJOR = 22;

export async function prereq(ctx) {
  const { report } = ctx;
  const major = Number(process.versions.node.split(".")[0]);
  if (major < MIN_NODE_MAJOR) throw new Error(`Node ${MIN_NODE_MAJOR} 以上が必要です (現在 ${process.versions.node})`);
  for (const tool of ["git", "gh"]) {
    if (run(tool, ["--version"]).code !== 0) throw new Error(`${tool} が見つかりません。インストールして PATH に通してください。`);
  }
  const auth = run("gh", ["auth", "status"]);
  const text = `${auth.stdout}\n${auth.stderr}`;
  if (auth.code !== 0) throw new Error("gh が GitHub にログインしていません。`gh auth login` を実行してください。");
  if (!/read:packages/.test(text)) {
    throw new Error("gh のトークンに read:packages がありません。`gh auth refresh -s read:packages` を実行してください (@ludiars パッケージの取得に必要)。");
  }
  if (process.env.NODE_ENV === "production") {
    report.warn(STEP, "NODE_ENV=production が設定されています。deps 手順は devDependencies を含めて入れます");
  }
  report.done(STEP, `node ${process.versions.node}、git・gh あり、read:packages あり`);
}
