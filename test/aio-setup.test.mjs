import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseCatalogPort, resolveRoot } from "../setup/aio/context.mjs";
import { parseArgs, selectSteps } from "../setup/aio/main.mjs";
import { resolveProfile } from "../setup/aio/profiles.mjs";
import { planProjectCodes } from "../setup/aio/steps/cc-projects.mjs";
import { deriveTestCases, registerFailure } from "../setup/aio/steps/revisor.mjs";
import { mergeBindingNames, planVaultDefaults } from "../setup/aio/steps/vault-defaults.mjs";

test("resolveRoot は引数、次に LUDIARS_ROOT を使い、どちらも無ければ止まる", () => {
  assert.equal(resolveRoot("/work/ws", {}).replaceAll("\\", "/").endsWith("/work/ws"), true);
  assert.equal(resolveRoot(undefined, { LUDIARS_ROOT: "/work/env" }).replaceAll("\\", "/").endsWith("/work/env"), true);
  assert.throws(() => resolveRoot(undefined, {}), /LUDIARS_ROOT/);
});

test("parseCatalogPort は指定コードの項目のポートだけを読む", () => {
  const yaml = [
    "services:",
    "  - code: viewer",
    "    port: 1001",
    "  - code: main-api",
    "    name: x",
    "    port: 2002",
    "    ports:",
    "      - port: 3003",
  ].join("\n");
  assert.equal(parseCatalogPort(yaml, "main-api"), 2002);
  assert.equal(parseCatalogPort(yaml, "viewer"), 1001);
  assert.equal(parseCatalogPort(yaml, "missing"), null);
});

test("cdgd プロファイルはコードが一意で、native は --with-native のときだけ入る", () => {
  const base = resolveProfile("cdgd");
  const withNative = resolveProfile("cdgd", { withNative: true });
  const codes = withNative.repos.map((entry) => entry.code);
  assert.equal(new Set(codes).size, codes.length);
  assert.equal(base.repos.some((entry) => entry.native), false);
  assert.equal(withNative.repos.length > base.repos.length, true);
  assert.throws(() => resolveProfile("unknown"), /未知のプロファイル/);
});

test("引数の解釈と手順の選択", () => {
  assert.throws(() => parseArgs([]), /--profile/);
  assert.throws(() => parseArgs(["--profile", "cdgd", "--only", "nope"]), /未知の手順/);
  const ids = (argv) => selectSteps(parseArgs(argv)).map(([id]) => id);
  assert.equal(ids(["--profile", "cdgd"]).includes("native"), false);
  assert.equal(ids(["--profile", "cdgd", "--with-native"]).includes("native"), true);
  assert.deepEqual(ids(["--profile", "cdgd", "--only", "revisor,leak-check"]), ["revisor", "leak-check"]);
  assert.equal(ids(["--profile", "cdgd", "--skip", "services"]).includes("services"), false);
});

test("審査テストはリポの中身から決まり、submodule の初期化が最初に来る", () => {
  const cases = deriveTestCases({ hasGitmodules: true, hasLockfile: true, scripts: { typecheck: "tsc", test: "node --test" } });
  assert.deepEqual(cases.map((entry) => entry.name), ["submodules", "install", "typecheck", "test"]);
  assert.deepEqual(cases[1].args, ["ci", "--include=dev"]);
  const ps = deriveTestCases({ hasGitmodules: false, hasLockfile: false, scripts: null },
    { kind: "powershell", script: "scripts/Check.ps1", rootArg: "-RepositoryRoot" });
  assert.deepEqual(ps.map((entry) => entry.name), ["repository"]);
  assert.deepEqual(ps[0].args.slice(-2), ["-RepositoryRoot", "."]);
  // npm も検査スクリプトも無いリポも登録できる (流出語の検査を通すため)。
  const bare = deriveTestCases({ hasGitmodules: false, hasLockfile: false, scripts: null });
  assert.deepEqual(bare.map((entry) => entry.name), ["git-integrity"]);
  const installOnly = deriveTestCases({ hasGitmodules: false, hasLockfile: false, scripts: { build: "tsc" } });
  assert.deepEqual(installOnly.map((entry) => entry.name), ["install", "git-integrity"]);
});

test("Revisor 登録の失敗はリポ名を示し、古いロックには対処を添える", () => {
  const locked = registerFailure("Org/Alpha", "/ws/Alpha", new Error("Another git process seems to be running"));
  assert.match(locked, /^Org\/Alpha の Revisor 登録に失敗/);
  assert.match(locked, /index\.lock が残っています/);
  const other = registerFailure("Org/Beta", "/ws/Beta", new Error("root_path is invalid."));
  assert.match(other, /Org\/Beta/);
  assert.equal(other.includes("index.lock"), false);
});

test("Vault の既定値は既存の名前を書き換えず、binding は追加だけする", () => {
  const defaults = { service: "svc", entries: { A: "1", B: "2" }, unlessPresent: ["SHARED_URL"] };
  const fresh = planVaultDefaults({ entries: [], bindings: {} }, defaults);
  assert.deepEqual(fresh.entries, [["A", "1"], ["B", "2"]]);
  assert.deepEqual(fresh.bindingNames, ["A", "B"]);
  const partial = planVaultDefaults(
    { entries: [{ name: "A" }], bindings: { svc: [{ name: "OTHER", present: true }] } }, defaults);
  assert.deepEqual(partial.entries, [["B", "2"]]);
  assert.deepEqual(partial.bindingNames, ["OTHER", "A", "B"]);
  const shared = planVaultDefaults({ entries: [{ name: "SHARED_URL" }], bindings: {} }, defaults);
  assert.equal(shared.blockedBy, "SHARED_URL");
  assert.deepEqual(mergeBindingNames(["X"], ["X", "Y"]), ["X", "Y"]);
});

test("Cc の登録はコードかパスが一致すれば済みとみなす", () => {
  const repos = [
    { code: "Aa", name: "Alpha", dir: "Alpha" },
    { code: "Bb", name: "Beta", dir: "Beta" },
    { code: "Cx", name: "Gamma", dir: "Gamma" },
  ];
  const plan = planProjectCodes([{ code: "Aa", repo_path: "/ws/Old" }, { code: "Zz", repo_path: "/ws/Beta/" }], repos, "/ws");
  assert.deepEqual(plan.existing.map((entry) => entry.code), ["Aa", "Bb"]);
  assert.deepEqual(plan.register.map((body) => body.code), ["Cx"]);
  assert.equal(plan.register[0].added_by, "aio-setup");
});

test("セットアップのソースに個人のパスを書かない", () => {
  const dir = join(import.meta.dirname, "..", "setup", "aio");
  const files = readdirSync(dir, { recursive: true }).filter((name) => String(name).endsWith(".mjs"));
  for (const file of files) {
    const text = readFileSync(join(dir, String(file)), "utf8");
    assert.equal(/[A-Za-z]:[\\/](Users|Document)[\\/]/i.test(text), false, `${file} に個人のパスがある`);
    assert.equal(/\/home\/[a-z]/.test(text), false, `${file} に個人のパスがある`);
  }
});
