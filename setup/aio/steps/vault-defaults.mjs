/**
 * 手順 6: 秘密でない既定値を Excubitor の Vault に入れる。
 * - 既にある名前は書き換えない。unlessPresent のどれかがある PC (共有 DB を使う等) では入れない。
 * - binding は既存に追加するだけで、置き換えない (他の用途の binding を消さない)。
 */
import { cached, excubitorBase } from "../context.mjs";
import { requestJson } from "../lib/http.mjs";

const STEP = "vault-defaults";

export async function vaultDefaults(ctx) {
  const { profile, report } = ctx;
  const base = await cached(ctx, "exBase", () => excubitorBase(ctx.root));
  for (const defaults of profile.vaultDefaults ?? []) {
    const vault = await requestJson(base, "GET", "/api/v1/vault");
    const plan = planVaultDefaults(vault, defaults);
    if (plan.blockedBy) { report.skip(STEP, `${defaults.service}: ${plan.blockedBy} があるため既定値を入れない`); continue; }
    if (!plan.entries.length && !plan.bindingChanged) { report.skip(STEP, `${defaults.service}: 設定済み`); continue; }
    if (!report.dryRun) {
      for (const [name, value] of plan.entries) {
        await requestJson(base, "PUT", `/api/v1/vault/entries/${encodeURIComponent(name)}`, { value });
      }
      if (plan.bindingChanged) {
        await requestJson(base, "PUT", `/api/v1/vault/bindings/${encodeURIComponent(defaults.service)}`, { names: plan.bindingNames });
      }
    }
    report.done(STEP, `${defaults.service}: ${plan.entries.map(([name]) => name).join(", ") || "binding"} を設定`);
  }
}

/** Vault の現状と既定値から、書く名前と binding の結果を決める (純粋関数)。 */
export function planVaultDefaults(vault, defaults) {
  const present = new Set((vault?.entries ?? []).map((entry) => entry.name ?? entry));
  const blockedBy = (defaults.unlessPresent ?? []).find((name) => present.has(name)) ?? null;
  if (blockedBy) return { blockedBy, entries: [], bindingNames: [], bindingChanged: false };
  const entries = Object.entries(defaults.entries).filter(([name]) => !present.has(name));
  const current = (vault?.bindings?.[defaults.service] ?? []).map((binding) => binding.name ?? binding);
  const bindingNames = mergeBindingNames(current, Object.keys(defaults.entries));
  return { blockedBy: null, entries, bindingNames, bindingChanged: bindingNames.length !== current.length };
}

export function mergeBindingNames(current, additions) {
  const names = [...current];
  for (const name of additions) if (!names.includes(name)) names.push(name);
  return names;
}
