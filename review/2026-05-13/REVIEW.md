# REVIEW — LUDIARS meta repo (2026-05-13)

LUDIARS org のメタリポ + GitHub Pages ダッシュボード + All-in-One Integration CI + 略称表 + ServiceMap の総合レビュー。AIFormat 5 テンプレ (DESIGN / VULNERABILITY / IMPLEMENTATION / MISSING_FEATURES / QUALITY) に分割。

## 評価サマリ

| 観点 | 評価 | 主要所見 |
|---|---|---|
| Design | B | 9 カテゴリ JSON ベース構成は素直、 正本が ServiceMap.md / services.json / PROJECT-CODES.md / setup.mjs の 4 箇所に分散しドリフト |
| Vulnerability | B- | ハードコード JWT_SECRET 4 件 + GITHUB_TOKEN URL 埋め込み + self-hosted runner PR トリガーの構造的リスク |
| Implementation | B+ | bash/pwsh ペア + healthcheck wait + escapeHtml 等の品質は高い、 ペア drift と setup.mjs 硬直が減点 |
| Missing Features | C+ | README 欠落 + 未登録 5 リポ + cross-service auth smoke 未実装 |
| Quality | B | コメント密度と .gitattributes は A、 lint/schema 自動化が完全に未整備 |

## 重みづけ

weighted_score = Design(20%) × 80 + Vulnerability(25%) × 70 + Implementation(20%) × 82 + Missing(15%) × 65 + Quality(20%) × 78
= 16.0 + 17.5 + 16.4 + 9.75 + 15.6 = **75.25** → 約 **75**

A=90+, B=70-89, C=50-69, D=<50。
LUDIARS は **B (75)**。

## 全体所見

- **強み**: メタリポとして責務が明確で、 4 週連続の週次 snapshot 運用が定着。 OS 横断 CI matrix + 静的 SPA という枯れた構成で、 新規参加者が読みやすい。 ファイル冒頭コメントの decision log が秀逸。
- **弱み**: ドキュメント正本の分散による drift (Schedula 残存・services.json 5 リポ未登録・依存図が古い)、 CI の hardcoded secret、 README 不在による「正本宣言の不在」。
- **次にやると効くこと (impact 順)**:
  1. README.md 新設 + 正本宣言 (services.json が権威)
  2. compose の JWT_SECRET を env interpolation に変更 + history rewrite は不要だが今後の追加防止
  3. services.json に Susurrus / Voluptas / Ludus / Educatus / ErgoDLLs の placeholder 追加
  4. shellcheck / markdownlint / ajv-cli の CI ワークフロー追加
  5. ServiceMap.md の Schedula → Actio 置換 + 依存図再生成

## 件数

- **Design**: 5 件 (うち C+ 以下 3 件)
- **Vulnerability**: 5 件 (うち C+ 以下 4 件)
- **Implementation**: 5 件 (うち C+ 以下 3 件)
- **Missing Features**: 8 件 (うち C+ 以下 5 件)
- **Quality**: 5 件 (うち C+ 以下 3 件)
- **合計**: 28 件 (C+ 以下 18 件)

## レビュー範囲

- README.md (存在せず) / DESIGN.md (存在せず) / CLAUDE.md (存在せず)
- PROJECT-CODES.md / ServiceMap.md
- docs/README.md / docs/INTEGRATION-CI.md / docs/index.html / docs/assets/app.js / docs/data/services.json / docs/data/snapshots.json / docs/snapshots/2026-05-10.md
- .github/workflows/integration.yml
- compose/all-in-one.yaml
- scripts/fetch-services.{sh,ps1} / integration-{up,wait,test,down}.sh / integration-test.ps1
- setup.mjs / package.json / .gitignore / .gitattributes

## 関連リンク

- ダッシュボード: <https://ludiars.github.io/LUDIARS/>
- AIFormat レビュー雛形: <https://github.com/LUDIARS/AIFormat>
- 統合 CI: `.github/workflows/integration.yml`
