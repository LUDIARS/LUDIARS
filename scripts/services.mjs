// LUDIARS service registry — scripts/infisical.mjs と共有する一覧。
// hasEnvCli=true のサービスのみ収録 (Infisical wrapper 用 subset)。
// org 全体のサービス一覧は PROJECT-CODES.md / docs/data/services.json を参照。
//
// 各サービスは <repoDir>/<subDir?> で npm script を走らせる前提。
// hasEnvCli: ../Cernere/packages/env-cli を経由する Infisical 連携を持つ。

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
