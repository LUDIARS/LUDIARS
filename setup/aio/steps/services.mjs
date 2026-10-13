/**
 * 手順 10: CDGD に要るサービスを Excubitor 経由で依存順に起動する。
 * 起動前に Concordia の testing claim を出し、終わったら release する (交通整備)。
 * 起動済みのサービスは触らない (再起動しない)。
 */
import { cached, excubitorBase, serviceBase } from "../context.mjs";
import { requestJson } from "../lib/http.mjs";

const STEP = "services";
const WAIT_MS = 90_000;

export async function services(ctx) {
  const { root, profile, report } = ctx;
  const exBase = await cached(ctx, "exBase", () => excubitorBase(root));
  const actor = process.env.LICTOR_SESSION_ID || "aio-setup";
  for (const code of profile.services ?? []) {
    const state = await serviceState(exBase, code);
    if (state === "running") { report.skip(STEP, `${code}: 起動済み`); continue; }
    if (report.dryRun) { report.done(STEP, `${code}: 起動`); continue; }
    const ccBase = code === "concordia" ? null : await cached(ctx, "ccBase", () => serviceBase(exBase, "concordia"));
    if (ccBase) await requestJson(ccBase, "POST", "/v1/testing/claim", { session_id: actor, service: code, note: "All-In-One-Setup による起動" });
    try {
      await requestJson(exBase, "POST", `/api/v1/services/${encodeURIComponent(code)}/control`, { action: "start" },
        { headers: { "x-excubitor-actor": actor }, timeoutMs: 600_000 });
      if (!(await waitRunning(exBase, code))) throw new Error(`${code} が ${WAIT_MS / 1000} 秒以内に running になりません。Excubitor のログを確認してください。`);
      report.done(STEP, `${code}: 起動`);
    } finally {
      if (ccBase) await requestJson(ccBase, "POST", "/v1/testing/release", { session_id: actor }).catch(() => {});
    }
  }
}

async function serviceState(exBase, code) {
  const service = await requestJson(exBase, "GET", `/api/v1/services/${encodeURIComponent(code)}`);
  return service?.state ?? "unknown";
}

async function waitRunning(exBase, code) {
  const deadline = Date.now() + WAIT_MS;
  while (Date.now() < deadline) {
    if ((await serviceState(exBase, code)) === "running") return true;
    await new Promise((resolve) => setTimeout(resolve, 3_000));
  }
  return false;
}
