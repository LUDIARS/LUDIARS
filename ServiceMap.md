# LUDIARS サービスマップ

> **レビュー運用のルーティング正本は [service-map.json](./service-map.json)**。本ファイルはその人間可読ビュー。
> 略称 (project codes) は [PROJECT-CODES.md](./PROJECT-CODES.md)、目的別 5 分類は
> [REPO-CLASSIFICATION-BY-PURPOSE.md](./REPO-CLASSIFICATION-BY-PURPOSE.md)、
> レビュー戦略の設計は [docs/REVIEW-STRATEGY.md](./docs/REVIEW-STRATEGY.md) を参照。

最終更新: 2026-07-13 (30 日コミット数はこの日時点の実測値)

## Tier とレビュー運用

| Tier | 対象 | CI | PR レビュー | デイリー突合レビュー |
|------|------|----|------------|---------------------|
| 1 | 活発な開発対象 (15) | 床 + 既存テスト | ○ (相互レビュー) | ○ (Codex × Opus) |
| 2 | 低頻度開発 (28) | 床 + 既存テスト | ○ (相互レビュー) | — |
| 3 | 休眠 (26+) | 床のみ | — (スイッチで個別 ON 可) | — |
| records | 記録リポ | — | — | — |

- **CI 床** = compile + typecheck + harness ゲート (AIFormat 構造チェック)。全リポ共通の最低ライン。
- **相互レビュー** = Claude 実装 PR は Codex が、Codex 実装 PR は Claude がレビュー。`skip-review` ラベルで PR 単位除外可。
- **デイリー突合** = 前回レビュー HEAD からの累積 diff を Codex と Claude Opus が独立レビューし、所見を突合。
- Tier は 30 日コミット数の実測に基づく。開発再開したら Tier を上げ、沈静化したら下げる (月次で見直し)。

## Tier 1 — デイリー突合 + PR レビュー

| サービス | Code | 役割 | 30d |
|---------|------|------|-----|
| [Concordia](https://github.com/LUDIARS/Concordia) | Cc | マルチ AI エージェントセッション協調 + 観測ダッシュボード | 240 |
| [Anatomia](https://github.com/LUDIARS/Anatomia) | An | 建築規約オラクル (コード解析 / supply→verify) | 113 |
| [Discutere](https://github.com/LUDIARS/Discutere) | Di | Chat-to-Task 自動化 (Slack/Discord) | 94 |
| [Tirocinium](https://github.com/LUDIARS/Tirocinium) | Tr | 面接練習 AI (多モデル合議面接官) | 86 |
| [Pagus](https://github.com/LUDIARS/Pagus) | Pa | AI 村シミュレーション (LLM 駆動創発) | 74 |
| [Excubitor](https://github.com/LUDIARS/Excubitor) | Ex | サービス監視・運用制御 (ports/catalog 正本) | 60 |
| [Peregrinatio](https://github.com/LUDIARS/Peregrinatio) | Pe | 旅のしおり PWA (個人旅行データ) | 60 |
| [Cernere](https://github.com/LUDIARS/Cernere) | Cr | 認証基盤 (JWT / WS セッション / OIDC IdP) | 45 |
| [Lictor](https://github.com/LUDIARS/Lictor) | Li | per-session sidecar (CLI ↔ Concordia 中継) | 43 |
| [Memoria](https://github.com/LUDIARS/Memoria) | Mm | 個人ログ基盤 (ブックマーク / 日記 / タスク / レビュー閲覧) | 40 |
| [Ludellus](https://github.com/LUDIARS/Ludellus) | Ul | 知育アプリ (旧 UniLand、マスコット「うに」) | 29 |
| [Quaestor](https://github.com/LUDIARS/Quaestor) | Qs | 個人会計データ基盤 (レシート / クレカ / 銀行) | 26 |
| [Pictor](https://github.com/LUDIARS/Pictor) | Pc | Data-Driven Rendering Pipeline (C++20 / Vulkan) | 26 |
| [Ergo](https://github.com/LUDIARS/Ergo) | Eg | C++ モジュラーフレームワーク | 23 |
| [Augur](https://github.com/LUDIARS/Augur) | Ag | テスト計画オラクル (目的駆動テスト計画 / 常駐なし CLI) | 17 |

## Tier 2 — PR レビューのみ

| サービス | Code | 役割 | 30d |
|---------|------|------|-----|
| [LUDIARS](https://github.com/LUDIARS/LUDIARS) | L | 組織メタ + ダッシュボード | 21 |
| [EducationHub](https://github.com/VGA-EducationLab/EducationHub) | — | EducationLab (EducationPartner ゲーム制作ラボ) 運営 hub ※org 外 | 16 |
| [Figmentum](https://github.com/LUDIARS/Figmentum) | Fg | 3D 体型モデルの対話的進化 | 15 |
| [AIFormat](https://github.com/LUDIARS/AIFormat) | Af | レビュー / 設計フォーマット標準 + harness ゲート | 15 |
| [Lapilli](https://github.com/LUDIARS/Lapilli) | Lp | 共有パッケージ群 (llm-gateway / encrypted-config / blackbox / log-weaver) | 12 |
| [Thaleia](https://github.com/LUDIARS/Thaleia) | Th | 企画↔実装トレーサビリティ (Praeforma ↔ Anatomia) | 11 |
| [Foedus](https://github.com/LUDIARS/Foedus) | Fd | Cernere↔Hub 連結契約の横断静的チェッカー | 11 |
| [Calliope](https://github.com/LUDIARS/Calliope) | — | PM 秘書オーケストレータ (Actio / Schedula / Memoria 統括) | 11 |
| [Aedilis](https://github.com/LUDIARS/Aedilis) | Ae | 施設予約 + 出席チェックイン | 11 |
| [SUPERFAT](https://github.com/LUDIARS/SUPERFAT) | SUPERFAT | 逆侵略戦略シミュレーション | 10 |
| [Corpus](https://github.com/LUDIARS/Corpus) | Co | 汎用 hub フレームワーク | 10 |
| [Actio](https://github.com/LUDIARS/Actio) | At | タスク管理基盤 | 10 |
| [Praeforma](https://github.com/LUDIARS/Praeforma) | Pf | 仕様書 ↔ 実装連携 | 9 |
| [Schedula](https://github.com/LUDIARS/Schedula) | Sc | 予定 / カレンダー基盤 | 8 |
| [Custos](https://github.com/LUDIARS/Custos) | Cs | 遠隔テストランナー (Unity 自動テスト) | 8 |
| [Vestigium](https://github.com/LUDIARS/Vestigium) | Vg | サービス横断ログ収集 | 7 |
| [Nuntius](https://github.com/LUDIARS/Nuntius) | Nt | 通知配信基盤 | 7 |
| [Ludellus-Server](https://github.com/LUDIARS/Ludellus-Server) | Ll | Ludellus 中央サーバ (Hono + Cernere PASETO) | 7 |
| [Bibliotheca](https://github.com/LUDIARS/Bibliotheca) | Bb | 本 / 機材貸出台帳 | 7 |
| [Ostiarius](https://github.com/LUDIARS/Ostiarius) | Os | 会場 LAN チェックインゲートウェイ | 6 |
| [MemoriaPlugin](https://github.com/LUDIARS/MemoriaPlugin) | — | Memoria プラグインフレームワーク | 6 |
| [Hora](https://github.com/LUDIARS/Hora) | Hr | Desktop Ojisan 常駐アプリ | 6 |
| [Calicula](https://github.com/LUDIARS/Calicula) | Ca | カリキュラム予定管理 | 6 |
| [Synergos](https://github.com/LUDIARS/Synergos) | Sy | P2P リアルタイムコラボ基盤 (Rust / QUIC) | 5 |
| [Signum](https://github.com/LUDIARS/Signum) | Si | 画像アウトライン → SVG 生成 | 5 |
| [Conciliator](https://github.com/LUDIARS/Conciliator) | Cn | バイナリ / 非マージファイルの作業衝突検知 | 5 |
| [Canalis](https://github.com/LUDIARS/Canalis) | Ci | 共有データ取込パイプライン | 5 |
| [Famulus](https://github.com/LUDIARS/Famulus) | Fa | ローカル LLM spawner + モデル switcher | 4 |

## Tier 3 — 休眠 (CI 床のみ)

UnityFoundation (Uf)、Fundamentum (Fm)、Concordia-RWF、Cocoiru、Ars (Ar)、Voluptas、VantanHub (Vh)、Susurrus (Su)、Codex (Cx)、All-In-OneTest (Ao)、Actio-SchoolModules (As)、Iter (It)、Ars-PlatformPlugin (Ax)、Ars-Musa (Au)、Tessera (Te)、Ludus (Lu)、Lector (Lc)、Curare (Cu)、AdventureCube (AC)、Actio-PublicModules (Ap)、Infra (In)、Ars-Module (Am)、Legatus (Lg)、Imperativus (Iv)、Clio (Cl)、Educatus

org 外 dogfood: PrivateGame (KS / PrivateProject)、Project-September (外部 org)

## 記録リポ (レビュー対象外)

Castra (Review 集約 / セッションログ / backups)、roadmap-* (ロードマップ文書群)

---

## 共通基盤ルール

- **認証**: すべてのサービスが Cernere に従う (詳細: [AIFormat/RULE.md](https://github.com/LUDIARS/AIFormat/blob/main/RULE.md))
- **DB**: PostgreSQL 17 (共有インフラ、サービスごとに DB 分離)
- **セッション**: Redis 7
- **ポート正本**: Excubitor catalog / ProcessMap (ハードコード禁止)
- **マイグレーション**: 冪等性必須 (IF NOT EXISTS / DROP 禁止)
- **ブランチ運用**: main 直 push 禁止、変更は PR 経由。AI 実装は 1 PR 集約
