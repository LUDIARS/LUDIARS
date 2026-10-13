/**
 * 手順 7: Actio をこの PC の SQLite で使うとき、DB が無ければ初期化する。
 * 共有 DB (DATABASE_URL) を使う PC では何もしない。
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { cached, excubitorBase, serviceBase } from "../context.mjs";
import { npm } from "../lib/exec.mjs";
import { reachable, requestJson } from "../lib/http.mjs";

const STEP = "actio-db";
const DB_PATH = "data/actio.db";

export async function actioDb(ctx) {
  const { root, report } = ctx;
  const actioDir = join(root, "Actio");
  if (!existsSync(actioDir)) { report.skip(STEP, "Actio がプロファイルに無い"); return; }
  const base = await cached(ctx, "exBase", () => excubitorBase(root));
  const vault = await requestJson(base, "GET", "/api/v1/vault");
  const names = new Set((vault?.entries ?? []).map((entry) => entry.name ?? entry));
  if (names.has("DATABASE_URL")) { report.skip(STEP, "共有 DB を使う設定のため初期化しない"); return; }
  // SQLite 設定で起動した Actio はテーブルが無くても空の DB ファイルを作る。ファイルの有無だけでは
  // 初期化済みと判断せず、Actio が ready を返すときだけ飛ばす (db:init は再実行しても壊れない)。
  if (existsSync(join(actioDir, DB_PATH)) && (await actioReady(base))) { report.skip(STEP, "SQLite の DB あり (Actio ready)"); return; }
  if (!report.dryRun) {
    npm(["run", "db:init"], { cwd: actioDir, env: { NODE_ENV: "development", DB_DIALECT: "sqlite", DATABASE_PATH: DB_PATH } });
  }
  report.done(STEP, "SQLite の DB を初期化");
}

async function actioReady(exBase) {
  try {
    return await reachable(await serviceBase(exBase, "actio"), "/api/ready");
  } catch {
    return false;
  }
}
