/** 手順 4: プロファイルに書いたビルド。出力があれば飛ばす (--refresh で作り直す)。 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { npm } from "../lib/exec.mjs";

const STEP = "build";

export async function build(ctx) {
  const { root, profile, report } = ctx;
  for (const entry of profile.repos) {
    for (const target of entry.build ?? []) {
      const dir = join(root, entry.dir);
      if (existsSync(join(dir, target.output)) && !ctx.args.refresh) {
        report.skip(STEP, `${entry.name}: ${target.output} あり`);
        continue;
      }
      if (!report.dryRun) npm(["run", target.script], { cwd: dir, env: { NODE_ENV: "development" } });
      report.done(STEP, `${entry.name}: npm run ${target.script}`);
    }
  }
}
