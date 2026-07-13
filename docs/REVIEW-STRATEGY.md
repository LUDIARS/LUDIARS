# LUDIARS レビュー戦略 (2026-07-13 改定)

CI テスト戦略とコードレビュー運用の設計書。2026-07-13 の方針決定 (neco) に基づく。
ルーティングの正本は [../service-map.json](../service-map.json)、人間可読ビューは [../ServiceMap.md](../ServiceMap.md)。

---

## 1. 背景 (2026-07-13 時点の実態調査)

### CI の実態

- CI は二層構造: 全リポ共通の **harness ゲート** (`harness.yml` → AIFormat の構造チェック。コードテストではない) + リポ任意の **ci.yml** (実テスト)。
- 中核リポのテストは機能している (Concordia: vitest 244 ファイル / Discutere: 166 / Cernere server: 53 / Synergos: cargo test 51・3 OS / Memoria: 実サーバ smoke / Lictor: sidecar smoke)。「test が echo だけ」「0 件 pass」「テスト本体の continue-on-error」といった形骸化サインは検出されなかった。
- 一方で問題は 3 点:
  1. **harness.yml しか持たないリポが十数個** (Excubitor / Schedula / Corpus / Custos / Signum / Tessera / Fundamentum / Lector / Calicula / Lapilli / Vestigium 等)。CI 緑 = 何もテストしていない。
  2. **テスト資産が CI に乗っていない**: Pagus はテスト 42 ファイル中 CI が回すのは `@pagus/sim` のみ。Cernere の frontend / packages は tsc のみ。
  3. **名目的な薄さ**: Curare (3) / Nuntius (6) / Famulus (2) / Hora (Rust 2)。

### デイリーレビュー (旧 `ludiars-review-daily`) の実態

- claude.ai リモートルーティン (毎朝 5:07 JST) で全リポを AIFormat 5 観点レビューし Castra へ集約。
- 7/3 まで全リポ毎日 → 7/5-7/8 日替わりバッチ (9-14 リポ) → 7/9-7/11 停止 → 7/12 GLAB 単発。**プロジェクト数の増加に耐えられず事実上停止**。
- 検出品質自体は高い (例: Cernere の PASETO 鍵 git 露出を High で継続追跡) が、**指摘を消化させる力がない** (同指摘が 3 日連続で未対応のまま残存)。停止しても誰も気づかない (watchdog 不在)。

### Augur の位置付け (誤解の訂正)

Augur は**テストを実行しない** (仕様の中核設計判断。safety test が `child_process` 等の参照を静的に禁止)。目的 + diff + 失敗ログから「次に何をテストすべきか / どう直すべきか」の計画を返す**上流の計画者**であり、回帰テストの実行・合否判定・結果保存 (Phase 5 未実装) は担えない。回帰テストの代替ではなく、**テスト資産を育てる側**として使う。

---

## 2. 決定事項

| # | 決定 | 内容 |
|---|------|------|
| D1 | CI は「床を敷く」方式 | 全リポに CI 床 (compile + typecheck + harness) を保証。**既存テストは削らない**。配線漏れ (Pagus 全 workspace / Cernere frontend) を修復 |
| D2 | PR 時レビューを新設 (スイッチ付き) | 相互レビュー: Claude 実装 PR → Codex レビュー、Codex 実装 PR → Claude レビュー。リポ単位の ON/OFF は service-map、PR 単位の除外はラベル |
| D3 | デイリーレビューは突合形式に刷新 | claude.ai ルーティンから外し、Morning Tasks と同じ **Concordia Timer Delegation** で **Codex × Claude Opus の独立差分レビュー + 突合**を実行。対象は service-map の Tier 1 のみ |
| D4 | 対象管理はサービスマップ正本 | どのリポがどのレビュー対象かは `service-map.json` が唯一の正本。Tier は 30 日コミット数の実測で月次見直し |

### 役割分担の原則

> **無条件に毎回走るべきものは決定的な機構 (CI / harness) に、判断が要るものは LLM (PR レビュー / 突合レビュー / Augur の計画) に置く。**

- PR レビュー = **浅く・速く・その diff だけ**。規約違反 / 例外握りつぶし / secret 混入 / 回帰の芽。全体整合はここでは見ない (差分単位 PR が 1 日複数本出るため、PR 単位で全体を見ようとすると重複コストで形骸化する)。
- デイリー突合 = **前回レビュー HEAD からの累積 diff** = 昨日マージされた PR 群をまとめて 1 つの差分として見る全体視点。横断的な不整合はここで捕まえる。
- LLM レビューが**繰り返し検出する指摘は、決定的ゲート化の候補**として消費する (例: secret 混入 → gitleaks 等を harness 側へ追加)。

---

## 3. CI 床 (D1)

全リポの最低ライン (Tier 3 含む):

1. **compile / build** (言語相応: tsc --noEmit / cargo check / ビルドスクリプト)
2. **typecheck** (compile と同義の言語では統合可)
3. **harness ゲート** (AIFormat `harness-checks.yml` 再利用 — 既存)

追加原則:

- 既存の test ジョブは維持。**テストの削減・縮退はしない**。
- 配線漏れの修復対象 (判明分): Pagus (sim 以外の workspace テストを CI に追加)、Cernere (frontend / packages のテスト追加検討)。
- テスト追加の優先順位付けは Augur に計画させる (CI 失敗ログ / feature diff を `POST /v1/plans` に渡す)。Augur Phase 3 (CLI) 実装後は PR フローに接続。

## 4. PR 時レビュー (D2)

- **トリガ**: PR opened / synchronize (GitHub Actions)。
- **対象判定**: `service-map.json` の `pr_review` が true のリポのみ。
- **実装者判定**: PR の署名から機械判定 — `Co-Authored-By: Claude` / 「🤖 Generated with Claude Code」→ claude、codex 署名 → codex、無署名 (人間) → unknown。
- **レビュアー振り分け** (`defaults.pr_review.cross_model`): claude → codex、codex → claude、human/unknown → codex。
- **スキップ**:
  - ラベル `skip-review` (PR 単位の手動スイッチ)
  - タイトルパターン: `chore(review):` / `docs(review):` / `chore(pages):` (自動生成・スナップショット系)
  - docs-only diff (変更が *.md のみ)
- **出力**: PR への review コメント (file:line 付き)。ブロッキングにはしない (approve/comment のみ。merge 判断は従来通り CI green + 人間/オートマージ規則)。
- **観点**: 差分内に閉じる — RULE_CODE §7 (例外握りつぶし) / secret 混入 / 明白なバグ / SRP 違反。全体整合・設計妥当性は見ない (デイリー突合の責務)。

## 5. デイリー突合レビュー (D3)

- **対象**: `service-map.json` で `daily_review: true` (= Tier 1、現在 15 リポ)。
- **起動**: Concordia の Timer Delegation `daily-review-reconciliation` が毎朝 05:10 JST にローカル起動する。
- **入力**: リポごとに「前回レビュー時の HEAD → 現 HEAD」の累積 diff + 変更ファイルの周辺コンテキスト。前回 HEAD は `E:\Document\Ars\reviews\<repo>\latest.json` の `head` フィールドに記録 (フィールド追加)。
- **手順**:
  1. Codex と Claude Opus が**独立に**同一入力をレビュー (相互の所見は見せない)。固定フォーマット: `{file, line, severity, category, claim, evidence}`。
  2. **突合**: 両者の所見を機械マージ。file±5 行 & 同 category で一致判定。
     - 両者一致 → 高確度指摘。High 以上は **GitHub Issue を自動作成** (レビュー文書止まりにしない)。
     - 片方のみ → 要判断フラグ。翌日のレビューで再検証 or 人間判断へ。
  3. 出力は `E:\Document\Ars\reviews\<repo>\<YYYY-MM-DD>\` へ累積 + `latest.json` 更新。`reviews/` は Castra の ignore 対象であり、Castra へ commit / push しない。
- **消化トラッキング**: 突合レビューの冒頭タスクは新規指摘の前に「**open な指摘 Issue の再確認**」。未対応 High には放置日数を付けてレポート先頭でエスカレーション。
- **watchdog**: Tier 1 リポの `reviews/<repo>/` に `watchdog_days` (既定 3) 日以上新しい日付が無ければ Excubitor がアラート。**旧ルーティンの無言停止 (7/9-7/11) の再発防止としてレビュー本体とセットで必須**。
- **変更が無い日**: 前回 HEAD == 現 HEAD のリポはスキップし、レポートに「変更なし」とだけ記録 (実行した事実は残す)。

## 6. service-map.json スキーマ

```
version        スキーマ版数
updated        最終更新日 (YYYY-MM-DD)
defaults
  ci_floor                 全リポ共通 CI 床
  pr_review.cross_model    実装者 → レビュアーの対応表
  pr_review.skip_labels    PR 単位除外ラベル
  pr_review.auto_skip_*    自動スキップ条件
  daily_review.reviewers   突合レビュアー (codex / claude-opus)
  daily_review.watchdog_days  停止検知の閾値日数
repos[]
  name / code / org        リポ名・略称 (PROJECT-CODES 正本)・org (省略時 LUDIARS)
  category                 new-era / workflow / data / game / library / infra / meta / records / planned
  role                     1 行の役割
  tier                     1 / 2 / 3 / "records"
  daily_review             デイリー突合対象か
  pr_review                PR レビュー対象か
  activity_30d             直近 30 日コミット数 (updated 時点の実測、参考値)
```

Tier の昇降格は月次: `activity_30d` を再計測し、15 以上を Tier 1 目安、4-15 を Tier 2、3 以下を Tier 3。機械的に固定はせず、リリース前などは実測に関わらず Tier 1 へ手動固定してよい (その場合 `notes` に理由を書く)。

## 7. 未決事項 (次段の実装で決める)

| # | 項目 | 候補 |
|---|------|------|
| O2 | 旧ルーティン停止 | `ludiars-review-daily` (trig_01QHgXWxTbLSsMWXoTHKAUq4) の無効化。新運用の初回成功を確認してから |
| O3 | PR レビュー workflow の実装 | 共有 workflow (AIFormat) として 1 本書き、各リポは `uses` 1 行で参照 (harness.yml と同型) |
| O4 | Excubitor watchdog の実装 | reviews/ の日付監視 + アラート経路 (Nuntius 経由 or Concordia chat) |
| O5 | CI 床の一括展開 | harness-check 同様に共有 workflow 化し、Tier 3 リポへ順次 PR |
| O6 | Augur Phase 3 (CLI) | `augur plan` で git diff から計画出力 → PR フロー接続。テスト資産を育てる経路の本命 |

## 8. 移行手順

1. 本 PR (service-map.json / ServiceMap.md / 本書) をマージ — 対象管理の正本を確立
2. PR レビュー共有 workflow を AIFormat に実装 (O3) → Tier 1 リポから順次有効化
3. Concordia Timer Delegation のデイリー突合レビューを Tier 1 で 1 週間試運転
4. Excubitor watchdog 配線 (O4)
5. 新運用の安定を確認後、旧 `ludiars-review-daily` ルーティンを停止 (O2)
6. CI 床を Tier 3 リポへ展開 (O5)、Pagus / Cernere の配線漏れ修復
