# AUTOFIX — LUDIARS meta repo (2026-05-13)

> 本レビューはソースコード修正を行わない方針 (autofix_count = 0)。
> 以下は将来の手動修正候補としての列挙のみ。 順序は impact / cost 比に基づく推奨度。

## 安全範囲の修正候補 (列挙のみ・実施せず)

### 1. ServiceMap.md の Schedula → Actio 置換

- 対象: `ServiceMap.md:18`, `:55-64`
- 影響: ドキュメント整合性回復、 GitHub 訪問者の混乱解消
- リスク: 低 (markdown のみ、 リンクは生きている)
- 工数: 5 分

### 2. README.md 新設

- 対象: リポルート (新規ファイル)
- 内容案:
  - 1 行 summary
  - ダッシュボード URL
  - ファイル構成図 (8 主要ファイル)
  - 正本宣言: 「services.json が権威カタログ」
  - setup.mjs / 統合 CI / 週次 routine の参照リンク
- リスク: 低
- 工数: 30 分

### 3. services.json に未登録 5 リポを placeholder で追加

- 対象: `docs/data/services.json:25-218`
- 追加候補:
  - Susurrus → category="local" or 新規 "communication"
  - Voluptas → category="game"
  - Ludus → category="infra" (templates)
  - Educatus → category="infra" (placeholder)
  - ErgoDLLs → category="engine"
- リスク: 低 (UI が `repos` 配列で自動拾い、 既存表示には影響しない)
- 工数: 15 分

### 4. compose JWT_SECRET の env interpolation 化

- 対象: `compose/all-in-one.yaml:81`, `:204`, `:269-270`
- 変更案: `JWT_SECRET: "${JWT_SECRET:?required}"` + `.env.example` に CI 用 placeholder
- リスク: 中 (CI に secret 注入が必要、 ワークフロー側修正が連動)
- 工数: 30 分 + CI 側 secrets 追加

### 5. fetch-services の token を URL から extraheader へ

- 対象: `scripts/fetch-services.sh:18-25`, `fetch-services.ps1:18-21`
- 変更案: `git -c http.extraheader="AUTHORIZATION: bearer ${GITHUB_TOKEN}" clone/fetch ...` + `git remote set-url` を生 URL に
- リスク: 中 (token 透過の挙動が変わる、 CI 上で 1 度検証が必要)
- 工数: 20 分

### 6. integration-test の body 検証追加

- 対象: `scripts/integration-test.sh:50-62`, `integration-test.ps1:50-53`
- 変更案: `wget -qO- ... | grep -q '"status":"ok"'` 等の body assert を 1 行追加
- リスク: 低 (現状の status code 経路を保持しつつ強化)
- 工数: 15 分

### 7. lint ワークフロー新設

- 対象: `.github/workflows/lint.yml` (新規)
- 内容: markdownlint-cli2 / ajv-cli (services.json + snapshots.json) / shellcheck / prettier --check
- リスク: 低 (read-only check)
- 工数: 1 時間

### 8. docs/index.html の a11y 改善

- 対象: `docs/index.html:36-40`, `docs/assets/app.js:48-54`
- 変更案: `role="progressbar" aria-valuenow="..." aria-valuemin="0" aria-valuemax="100"` を renderHero で setAttribute
- リスク: 低
- 工数: 10 分

### 9. .gitattributes に追加ファイル拡張子

- 対象: `.gitattributes:1-10`
- 追加: `*.mjs text eol=lf` / `*.json text eol=lf` (setup.mjs と docs/data/*.json の改行を明示)
- リスク: 低
- 工数: 5 分

### 10. integration-down.sh の `set -u +e` を見直し

- 対象: `scripts/integration-down.sh:5`
- 変更案: `set -u` のみに変更 + `docker compose down ... || true` で許容範囲明示
- リスク: 低
- 工数: 5 分

## autofix 適用予定

なし (本レビューはコード修正禁止)。

## 統計

- autofix_count: 0
- autofix_candidates_count: 10
- estimated_total_effort: 約 3 時間
