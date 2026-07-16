#!/usr/bin/env node
/**
 * LUDIARS All-in-One Setup
 *
 * Usage:
 *   node setup.mjs              # インタラクティブセットアップ
 *   node setup.mjs --start      # 全サービス起動ショートカット
 *   node setup.mjs --stop       # 全サービス停止
 */
import { createInterface } from "node:readline/promises";
import { execSync } from "node:child_process";
import { existsSync, writeFileSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE = resolve(__dirname, "..");

// ─── サービス定義 ──────────────────────────────────────

const SERVICES = {
  infra: {
    name: "Infra (PostgreSQL/Redis/MinIO)",
    repo: "LUDIARS/Infra",
    dir: "infra",
    category: "infra",
    required: false,
    hasDocker: true,
    hasEnvCli: false,
    envExample: ".env.example",
  },
  cernere: {
    name: "Cernere (認証基盤)",
    repo: "LUDIARS/Cernere",
    dir: "Cernere",
    category: "backend",
    required: false,
    hasDocker: true,
    hasEnvCli: true,
    envExample: ".env.example",
  },
  schedula: {
    name: "Schedula (スケジューリング)",
    repo: "LUDIARS/Schedula",
    dir: "Schedula",
    category: "backend",
    required: false,
    hasDocker: true,
    hasEnvCli: true,
    envExample: ".env.example",
  },
  curare: {
    name: "Curare (アセット管理)",
    repo: "LUDIARS/Curare",
    dir: "Curare",
    category: "backend",
    required: false,
    hasDocker: true,
    hasEnvCli: false,
    envExample: "curare-server/.env.example",
  },
  ars: {
    name: "Ars (ビジュアルエディタ)",
    repo: "LUDIARS/Ars",
    dir: "ars",
    category: "frontend",
    required: false,
    hasDocker: false,
    hasEnvCli: true,
    envExample: null,
  },
  discutere: {
    name: "Discutere (チャット自動化)",
    repo: "LUDIARS/Discutere",
    dir: "Discutere",
    category: "backend",
    required: false,
    hasDocker: false,
    hasEnvCli: false,
    envExample: ".env.example",
  },
  imperativus: {
    name: "Imperativus (音声コマンド)",
    repo: "LUDIARS/Imperativus",
    dir: "Imperativus",
    category: "backend",
    required: false,
    hasDocker: false,
    hasEnvCli: false,
    envExample: null,
  },
};

// ─── ユーティリティ ─────────────────────────────────────

function servicePath(svc) {
  return resolve(WORKSPACE, svc.dir);
}

function run(cmd, opts = {}) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { stdio: "inherit", ...opts });
}

function cloneIfNeeded(svc) {
  const path = servicePath(svc);
  if (existsSync(path)) {
    console.log(`  ✓ ${svc.dir} — 既にクローン済み`);
    return false;
  }
  console.log(`  ⬇ ${svc.repo} をクローン中...`);
  run(`git clone https://github.com/${svc.repo}.git "${path}"`);
  return true;
}

// ─── インタラクティブ設定 ────────────────────────────────

async function interactiveSetup() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => rl.question(q);
  const yesNo = async (q, def = true) => {
    const ans = await ask(`${q} (${def ? "Y/n" : "y/N"}): `);
    if (!ans.trim()) return def;
    return ans.trim().toLowerCase().startsWith("y");
  };

  console.log();
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║        LUDIARS All-in-One Setup              ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log();
  console.log(`Workspace: ${WORKSPACE}`);
  console.log();

  // Step 1: 環境選択
  console.log("── Step 1: 環境設定 ──────────────────────────");
  console.log();

  const env = (await ask("環境を選択 (dev/prod) [dev]: ")).trim() || "dev";
  const useInfisical = await yesNo("Infisical でシークレット管理しますか?", false);
  const useLocalInfra = await yesNo("Infra (PostgreSQL/Redis) をローカルで起動しますか?", true);
  const externalBackendUrl = useLocalInfra
    ? null
    : (await ask("外部バックエンド/インフラの URL (例: https://api.example.com): ")).trim() || null;

  console.log();

  // Step 2: サービス選択
  console.log("── Step 2: サービス選択 ──────────────────────");
  console.log();

  const selected = {};

  if (useLocalInfra) {
    selected.infra = true;
    console.log("  ✓ Infra — ローカルインフラ起動のため自動選択");
  }

  for (const [key, svc] of Object.entries(SERVICES)) {
    if (key === "infra") continue;
    selected[key] = await yesNo(`  ${svc.name} を使用しますか?`);
  }

  const selectedServices = Object.entries(selected)
    .filter(([, v]) => v)
    .map(([k]) => k);

  console.log();
  console.log(`選択されたサービス: ${selectedServices.map((k) => SERVICES[k].name).join(", ")}`);
  console.log();

  // Step 3: クローン
  console.log("── Step 3: リポジトリクローン ─────────────────");
  console.log();

  for (const key of selectedServices) {
    cloneIfNeeded(SERVICES[key]);
  }

  console.log();

  // Step 4: 依存インストール
  console.log("── Step 4: 依存関係インストール ───────────────");
  console.log();

  for (const key of selectedServices) {
    const svc = SERVICES[key];
    const path = servicePath(svc);
    if (existsSync(resolve(path, "package.json"))) {
      console.log(`  📦 ${svc.dir} — npm install`);
      try {
        run("npm install", { cwd: path });
      } catch {
        console.log(`  ⚠ ${svc.dir} — npm install 失敗（後で手動実行してください）`);
      }
    }
  }

  console.log();

  // Step 5: 環境変数設定
  console.log("── Step 5: 環境変数設定 ──────────────────────");
  console.log();

  if (useInfisical) {
    console.log("Infisical モード:");
    console.log("  各サービスで Infisical プロジェクトを作成し、以下を実行してください:");
    console.log();
    for (const key of selectedServices) {
      const svc = SERVICES[key];
      if (!svc.hasEnvCli) continue;
      const path = servicePath(svc);
      console.log(`  [${svc.name}]`);
      console.log(`    cd ${path}`);
      console.log(`    npm run env:setup        # Infisical 認証設定`);
      console.log(`    npm run env:initialize   # デフォルト値を登録`);
      console.log(`    npm run env:env          # .env 生成`);
      console.log();
    }
  } else {
    console.log(".env ファイルモード:");
    console.log();
    for (const key of selectedServices) {
      const svc = SERVICES[key];
      if (!svc.envExample) continue;
      const path = servicePath(svc);
      const examplePath = resolve(path, svc.envExample);
      const envPath = resolve(dirname(examplePath), ".env");

      if (existsSync(envPath)) {
        console.log(`  ✓ ${svc.dir}/.env — 既に存在`);
      } else if (existsSync(examplePath)) {
        const content = readFileSync(examplePath, "utf-8");
        writeFileSync(envPath, content);
        console.log(`  📝 ${svc.dir}/.env — .env.example からコピーしました`);
        console.log(`     → ${envPath} を編集してください`);
      } else {
        console.log(`  ⚠ ${svc.dir} — .env.example が見つかりません`);
      }
    }

    if (externalBackendUrl) {
      console.log();
      console.log(`  外部バックエンド: ${externalBackendUrl}`);
      console.log("  各 .env の接続先を上記 URL に変更してください。");
    }
  }

  console.log();

  // Step 6: 起動確認
  const shouldStart = await yesNo("サービスを起動しますか?");
  if (shouldStart) {
    await startServices(selectedServices, env);
  } else {
    console.log();
    console.log("後で起動するには:");
    console.log(`  node setup.mjs --start`);
  }

  // 設定を保存
  const config = { selectedServices, env, useInfisical, useLocalInfra, externalBackendUrl };
  writeFileSync(resolve(__dirname, ".setup-config.json"), JSON.stringify(config, null, 2));
  console.log();
  console.log("✓ 設定を .setup-config.json に保存しました。");

  rl.close();
}

// ─── サービス起動/停止 ──────────────────────────────────

async function startServices(services, env) {
  console.log();
  console.log("── サービス起動 ─────────────────────────────");
  console.log();

  // 1. Infra first
  if (services.includes("infra")) {
    const infraPath = servicePath(SERVICES.infra);
    console.log("[Infra] PostgreSQL / Redis / MinIO を起動...");
    run("docker compose up -d", { cwd: infraPath });
    console.log("[Infra] マイグレーション実行...");
    try {
      run("bash migrate.sh", { cwd: infraPath });
    } catch {
      console.log("  ⚠ マイグレーション失敗（DB がまだ準備中の可能性。後で再実行してください）");
    }
    console.log();
  }

  // 2. Backend services
  for (const key of services) {
    const svc = SERVICES[key];
    if (key === "infra" || !svc.hasDocker) continue;

    const path = servicePath(svc);
    const profile = env === "prod" ? "prod" : "dev";

    if (svc.hasEnvCli) {
      console.log(`[${svc.name}] env-cli で起動...`);
      try {
        run(`npm run env:up`, { cwd: path });
      } catch {
        console.log(`  ⚠ env:up 失敗。手動で起動してください。`);
      }
    } else if (existsSync(resolve(path, "docker-compose.yaml"))) {
      console.log(`[${svc.name}] docker compose up -d...`);
      try {
        run(`docker compose --profile ${profile} up -d`, { cwd: path });
      } catch {
        console.log(`  ⚠ docker compose up 失敗。`);
      }
    }
    console.log();
  }

  // 3. Non-docker services
  for (const key of services) {
    const svc = SERVICES[key];
    if (svc.hasDocker || key === "infra") continue;
    const path = servicePath(svc);
    if (existsSync(resolve(path, "package.json"))) {
      console.log(`[${svc.name}] npm run dev で個別に起動してください:`);
      console.log(`  cd ${path} && npm run dev`);
      console.log();
    }
  }

  console.log("✓ 起動完了");
}

async function stopServices() {
  console.log();
  console.log("── サービス停止 ─────────────────────────────");
  console.log();

  const configPath = resolve(__dirname, ".setup-config.json");
  if (!existsSync(configPath)) {
    console.log("設定ファイルが見つかりません。先に setup を実行してください。");
    process.exit(1);
  }
  const config = JSON.parse(readFileSync(configPath, "utf-8"));

  // Stop in reverse order
  const services = [...config.selectedServices].reverse();

  for (const key of services) {
    const svc = SERVICES[key];
    if (!svc) continue;
    const path = servicePath(svc);

    if (key === "infra") {
      console.log(`[Infra] 停止...`);
      try { run("docker compose down", { cwd: path }); } catch { /* ignore */ }
    } else if (svc.hasDocker && existsSync(resolve(path, "docker-compose.yaml"))) {
      console.log(`[${svc.name}] 停止...`);
      try { run("docker compose down", { cwd: path }); } catch { /* ignore */ }
    }
  }

  console.log();
  console.log("✓ 停止完了");
}

// ─── メイン ──────────────────────────────────────────────

const arg = process.argv[2];

if (arg === "--start") {
  const configPath = resolve(__dirname, ".setup-config.json");
  if (!existsSync(configPath)) {
    console.log("設定ファイルが見つかりません。先に node setup.mjs を実行してください。");
    process.exit(1);
  }
  const config = JSON.parse(readFileSync(configPath, "utf-8"));
  await startServices(config.selectedServices, config.env);
} else if (arg === "--stop") {
  await stopServices();
} else {
  await interactiveSetup();
}
