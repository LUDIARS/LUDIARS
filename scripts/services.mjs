// LUDIARS service registry — scripts/infisical.mjs と共有する一覧。
// infra/PORT-MAP.md + Corpus/server/hub/discovery.ts と同期させる。
//
// 各サービスは <repoDir>/<subDir?> で npm script を走らせる前提。
// hasEnvCli: ../Cernere/packages/env-cli を経由する Infisical 連携を持つ。
//
// ── スコープ ──
// 本 registry は「独立した node サーバプロセスを持つ LUDIARS サービス」 のみを
// 列挙する。 PROJECT-CODES.md は全リポジトリ (28+) を対象だが、 以下は意図的に
// 除外している (Infisical 一括処理の対象外のため):
//
//   - C++ / Rust 等のライブラリ・クライアント: Pictor, Ergo, Synergos, Tessera,
//     Codex, Curare, Clio, Signum, Iter, AdventureCube, PrivateGame, Ludellus,
//     Ludellus-Server, Ars 系, infra (docker compose), AIFormat, All-In-OneTest,
//     Foundation, Conciliator
//   - Tauri デスクトップ専用 (host port bind 無し): Hora, Calicula
//   - obsolete: Excubitor (Concordia に統合済み)
//   - npm package のみ (サービス本体無し): Actio-PublicModules, Actio-SchoolModules
//   - 計画段階で未起動: Discutere, Educatus, Ludus, Voluptas
//
// 新規サービスを追加する時は (a) 本 registry に 1 行 + (b) infra/PORT-MAP.md
// 更新 + (c) docs/data/services.json も更新 (dashboard 表示用)。

/**
 * @typedef {Object} ServiceSpec
 * @property {string} id            discover / 引数で使う ID。 manifest.service と一致
 * @property {string} displayName   UI 表示用
 * @property {string} repoDir       LUDIARS repo からの相対パス (= sibling)
 * @property {string} [subDir]      npm script を実行するリポジトリ内サブディレクトリ
 * @property {number} port          PORT-MAP 上のホスト port
 * @property {boolean} needsCernere Cernere SSO に依存
 * @property {boolean} hasEnvCli    env-cli script を持つ (= Infisical 連携あり)
 * @property {string} [note]        --list 用の説明
 */

/** @type {ServiceSpec[]} */
export const SERVICES = [
  {
    id: 'cernere',
    displayName: 'Cernere (auth)',
    repoDir: '../Cernere',
    port: 5000,
    needsCernere: false,
    hasEnvCli: true,
    note: 'OAuth + project token 発行。 他サービスの前提',
  },
  {
    id: 'memoria',
    displayName: 'Memoria',
    repoDir: '../Memoria',
    subDir: 'server',
    port: 5180,
    needsCernere: true,
    hasEnvCli: true,
    note: 'Web bookmark + 日記 + dictionary',
  },
  {
    id: 'actio',
    displayName: 'Actio (タスク)',
    repoDir: '../Actio',
    port: 8888,
    needsCernere: true,
    hasEnvCli: true,
    note: 'タスク管理。 declarative β は /declarative.html',
  },
  {
    id: 'schedula',
    displayName: 'Schedula (予定)',
    repoDir: '../Schedula',
    port: 3000,
    needsCernere: true,
    hasEnvCli: true,
    note: '予定 / カレンダー基盤 (2026-05-20 Actio から再分離)',
  },
  {
    id: 'nuntius',
    displayName: 'Nuntius (通知)',
    repoDir: '../Nuntius',
    port: 3100,
    needsCernere: true,
    hasEnvCli: true,
    note: '統合通知 (Slack / Discord / LINE / Email / SMS)',
  },
  {
    id: 'imperativus',
    displayName: 'Imperativus (GPS/音声)',
    repoDir: '../Imperativus',
    port: 5963,
    needsCernere: true,
    hasEnvCli: true,
    note: 'GPS + 音声コマンド relay。 MQTT broker 同梱',
  },
  {
    id: 'praeforma',
    displayName: 'Praeforma (仕様↔実装)',
    repoDir: '../Praeforma',
    subDir: 'server',
    port: 8889,
    needsCernere: true,
    hasEnvCli: true,
    note: '仕様書 ↔ 実装連携。 placeholder + 構造化 spec + asset 差し替え',
  },
  {
    id: 'legatus',
    displayName: 'Legatus (PC 常駐代理)',
    repoDir: '../Legatus',
    port: 17320,
    needsCernere: false,
    hasEnvCli: true,
    note: '個人 PC 常駐の LUDIARS サービス代理人 (OwnTracks forwarder 等)',
  },
  {
    id: 'concordia',
    displayName: 'Concordia (multi-agent)',
    repoDir: '../Concordia',
    port: 17330,
    needsCernere: false,
    hasEnvCli: false,
    note: 'AI session coordinator (loopback only)',
  },
  {
    id: 'susurrus',
    displayName: 'Susurrus (chat)',
    repoDir: '../Susurrus',
    port: 17370,
    needsCernere: true,
    hasEnvCli: false,
    note: 'ローカルチャット daemon (loopback only)',
  },
  {
    id: 'quaestor',
    displayName: 'Quaestor (会計)',
    repoDir: '../Quaestor',
    port: 17400,
    needsCernere: false,
    hasEnvCli: false,
    note: '個人会計 (loopback only)',
  },
  {
    id: 'bibliotheca',
    displayName: 'Bibliotheca (貸出台帳)',
    repoDir: '../Bibliotheca',
    port: 17501,
    needsCernere: true,
    hasEnvCli: true,
    note: '本 / 機材 貸出。 declarative β は /declarative.html',
  },
  {
    id: 'aedilis',
    displayName: 'Aedilis (施設予約)',
    repoDir: '../Aedilis',
    port: 17502,
    needsCernere: true,
    hasEnvCli: true,
    note: '施設予約 + 日程登録。 Corpus pilot',
  },
  {
    id: 'custos',
    displayName: 'Custos (test runner)',
    repoDir: '../Custos',
    port: 17777,
    needsCernere: false,
    hasEnvCli: false,
    note: '遠隔テストランナー',
  },
  {
    id: 'corpus',
    displayName: 'Corpus (hub framework)',
    repoDir: '../Corpus',
    port: 5187,
    needsCernere: true,
    hasEnvCli: false,
    note: '汎用 hub フレームワーク。 declarative renderer + connector レジストリ。 env は自前 bootstrap',
  },
  {
    id: 'vantanhub',
    displayName: 'VantanHub (EducationPartner 校 hub)',
    repoDir: '../VantanHub',
    port: 5186,
    needsCernere: true,
    hasEnvCli: true,
    note: 'Corpus submodule + 学校特化プラグインパック。 自前 env-cli.config.ts で独立 Infisical project',
  },
];

/**
 * id → spec 検索。 未知は null。
 * @param {string} id
 * @returns {ServiceSpec | null}
 */
export function findService(id) {
  return SERVICES.find((s) => s.id === id) ?? null;
}

/**
 * 引数を id list に解決。 `--all` で全件 (env-cli filter 可)。
 * @param {readonly string[]} args
 * @param {{ requireEnvCli?: boolean }} [opts]
 * @returns {{ ids: string[]; unknown: string[] }}
 */
export function resolveIds(args, opts = {}) {
  const filterFlag = opts.requireEnvCli ?? false;
  if (args.includes('--all')) {
    const all = SERVICES.filter((s) => !filterFlag || s.hasEnvCli).map((s) => s.id);
    return { ids: all, unknown: [] };
  }
  /** @type {string[]} */
  const ids = [];
  /** @type {string[]} */
  const unknown = [];
  for (const a of args) {
    if (a.startsWith('--')) continue;
    if (findService(a)) ids.push(a);
    else unknown.push(a);
  }
  return { ids, unknown };
}
