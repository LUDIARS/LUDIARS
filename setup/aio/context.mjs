/**
 * 実行時の文脈: ワークスペースのルート、service-map、Excubitor / Concordia の接続先。
 * ポートの正本は各サービスの excubitor.catalog.yaml と Excubitor の API。ここに番号を書かない。
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { requestJson } from "./lib/http.mjs";

const REPO_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** --root、なければ LUDIARS_ROOT。どちらも無ければ止める (別のパスを推測しない)。 */
export function resolveRoot(argRoot, env = process.env) {
  const root = argRoot ?? env.LUDIARS_ROOT;
  if (!root || !root.trim()) {
    throw new Error("ワークスペースのルートが分かりません。--root <dir> か環境変数 LUDIARS_ROOT を指定してください。");
  }
  return resolve(root.trim());
}

export function loadServiceMap(repoDir = REPO_DIR) {
  return JSON.parse(readFileSync(join(repoDir, "service-map.json"), "utf8"));
}

/** catalog YAML から `code: <code>` の項目の最初の `port:` を読む (簡易な行解析)。 */
export function parseCatalogPort(yamlText, code) {
  const lines = yamlText.split(/\r?\n/);
  let inside = false;
  for (const line of lines) {
    const entry = /^\s*-\s+code:\s*["']?([A-Za-z0-9._-]+)["']?\s*$/.exec(line);
    if (entry) { inside = entry[1] === code; continue; }
    if (!inside) continue;
    const port = /^\s+port:\s*["']?(\d+)["']?\s*$/.exec(line);
    if (port) return Number(port[1]);
  }
  return null;
}

export function excubitorBase(root) {
  const catalog = join(root, "Excubitor", "excubitor.catalog.yaml");
  if (!existsSync(catalog)) throw new Error("Excubitor の catalog が見つかりません。先に repos 手順で Excubitor を取得してください。");
  const port = parseCatalogPort(readFileSync(catalog, "utf8"), "excubitor");
  if (!port) throw new Error("Excubitor の catalog に excubitor のポートがありません。");
  return `http://127.0.0.1:${port}`;
}

/** Excubitor が持つ catalog から、指定サービスの loopback URL を得る。 */
export async function serviceBase(exBase, code) {
  const service = await requestJson(exBase, "GET", `/api/v1/services/${encodeURIComponent(code)}`);
  const port = service?.catalog_snapshot?.port;
  if (!port) throw new Error(`Excubitor の catalog に ${code} のポートがありません。`);
  return `http://127.0.0.1:${port}`;
}

export function createContext({ root, profile, args, report }) {
  return { root, profile, args, report, repoDir: REPO_DIR, cache: new Map() };
}

/** 同じ実行の中で一度だけ解決する。 */
export async function cached(ctx, key, resolveValue) {
  if (!ctx.cache.has(key)) ctx.cache.set(key, await resolveValue());
  return ctx.cache.get(key);
}
