/**
 * セットアップのプロファイル。リポの集合と手順ごとの追加設定を持つ。
 * 対象プロジェクト (ゲームタイトル等) の名前・ID は書かない。ツールは実行時入力で対象を受け取る。
 *
 * repo: GitHub の owner/name。dir: ワークスペース直下のフォルダ名 (省略時は name)。
 * code: Concordia のプロジェクトコード (service-map.json にあればそれと同じ値)。
 * native: --with-native のときだけ扱う。
 */
const CDGD_REPOS = [
  // 運用基盤
  { repo: "LUDIARS/Excubitor", code: "Ex" },
  { repo: "LUDIARS/Concordia", code: "Cc" },
  { repo: "LUDIARS/Lictor", code: "Li" },
  { repo: "LUDIARS/Revisor", code: "Revisor" },
  { repo: "LUDIARS/Actio", code: "At", build: [{ script: "build", output: "dist/src/bootstrap.js" }], installDirs: [".", "frontend"] },
  // 設計・解析
  { repo: "LUDIARS/Anatomia", code: "An", build: [{ script: "build", output: "dist" }] },
  { repo: "LUDIARS/Praeforma", code: "Pf" },
  { repo: "LUDIARS/Thaleia", code: "Th" },
  { repo: "LUDIARS/Augur", code: "Ag" },
  // CDGD の流れ・議論
  { repo: "LUDIARS/Conflux", code: "Cf" },
  { repo: "LUDIARS/Discutere", code: "Di" },
  // 遊び・自動プレイ・攻略
  { repo: "LUDIARS/Ludus", code: "Lu" },
  { repo: "LUDIARS/Ingenium", code: "Ig" },
  { repo: "LUDIARS/Commentarii", code: "Cm" },
  // 分析
  { repo: "LUDIARS/Vitia", code: "Vitia" },
  { repo: "LUDIARS/Omnipotens", code: "Om", reviewCheck: { kind: "powershell", script: "scripts/Test-OmnipotensRepository.ps1", rootArg: "-RepositoryRoot" } },
  // 任意: ネイティブ表示
  { repo: "LUDIARS/Pictor", code: "Pc", native: true },
  { repo: "LUDIARS/Tela", code: "Tela", native: true },
];

/** Excubitor のサービスコード。依存順に起動する。 */
const CDGD_SERVICES = ["concordia", "actio", "anatomia", "praeforma", "conflux"];

/**
 * 秘密でない既定値。unlessPresent のどれかが Vault にあれば (共有 DB を使う PC など) 入れない。
 * binding は既存に追加するだけで、置き換えない。
 */
const CDGD_VAULT_DEFAULTS = [
  {
    service: "actio",
    entries: { DB_DIALECT: "sqlite", DATABASE_PATH: "data/actio.db" },
    unlessPresent: ["DATABASE_URL"],
  },
];

const PROFILES = {
  cdgd: { repos: CDGD_REPOS, services: CDGD_SERVICES, vaultDefaults: CDGD_VAULT_DEFAULTS },
};

export function profileNames() {
  return Object.keys(PROFILES);
}

/** プロファイルを解決し、各リポに dir と name を補う。native は withNative のときだけ含める。 */
export function resolveProfile(name, { withNative = false } = {}) {
  const profile = PROFILES[name];
  if (!profile) throw new Error(`未知のプロファイル: ${name} (使えるもの: ${profileNames().join(", ")})`);
  const repos = profile.repos
    .filter((entry) => withNative || !entry.native)
    .map((entry) => {
      const name = entry.repo.split("/")[1];
      return { ...entry, name, dir: entry.dir ?? name };
    });
  return { name, ...profile, repos };
}
