# LUDIARS リポジトリ分類 (用途別)

LUDIARS org の全リポジトリを **作る目的の方向性** で 5 種に分類する。
[PROJECT-CODES.md](./PROJECT-CODES.md) の「カテゴリ並び」 (dashboard 用) とは
直交する軸。 こちらは「なぜそれを作っているのか」 で見る。

> 同じリポでも複数カテゴリに足を出すことがある (例: Ars は新時代の創作プラット
> フォームでもあり、 ゲーム開発の場でもある)。 そういうものは「主目的」 で
> 1 つだけに置く。

---

## 1. 新時代

> 世の中にないサービスを作る。 AI を人間化する試みや、 未来予知もここ。

| Code | Repo | 何を新しくしようとしているか |
|------|------|------------------------------|
| Ar | [Ars](https://github.com/LUDIARS/Ars) | コンテンツ設計エディタ + ゲームエンジン (作家性を AI に拡張する) |
| Sy | [Synergos](https://github.com/LUDIARS/Synergos) | P2P コラボ基盤 (個人 PC を集めて常時 LAN を作る) |
| — | [Hora](https://github.com/LUDIARS/Hora) | Desktop Ojisan アプリ (AI を擬人化して常駐させる) |
| Tr | [Tirocinium](https://github.com/LUDIARS/Tirocinium) | 面接練習 AI (Sonnet 応答 + GPT 深掘り + Opus 評価で「人間に近い面接官」) |
| Ll | [Ludellus](https://github.com/LUDIARS/Ludellus) (旧 UniLand) | 知育 + 擬人化マスコット「うに」 で学びをエンタメ化 |
| Su | [Susurrus](https://github.com/LUDIARS/Susurrus) | ローカル先行 + md 正本のチャット (世にない「会話プロトコル」 の再発明) |
| Di | [Discutere](https://github.com/LUDIARS/Discutere) | Chat-to-Task 自動化 (会話を AI がタスク化する新しい仕事の形) |
| — | Ludus (※未スキャフォールド) | 遊びの辞書 (「使えるデータを持つ者が勝つ」 仮説のうち、 **遊び体験の語彙化** という新時代側の試み) |
| Cl | [Clio](https://github.com/LUDIARS/Clio) | リソース抽象化 / 自動取得 (「データソースに依らず欲しい形でデータが来る」 という新時代インターフェース) |

---

## 2. ワークフロー

> ワークフローとして洗練された形にするために設計を再編する (悪い病気)。
> 統合環境 / 中継系 / 認証系 / 開発支援が該当する。

「悪い病気」 自認の通り、 リポ数が一番膨らみがち。
2 週間に 1 回 [WORKFLOW-OVERENGINEERING-REVIEW.md](./WORKFLOW-OVERENGINEERING-REVIEW.md) を回して
「これは設計過剰では?」 を検証する運用を入れている。

| Code | Repo | ワークフロー上の位置 |
|------|------|----------------------|
| Cr | [Cernere](https://github.com/LUDIARS/Cernere) | 認証 / WS リレー基盤 |
| — | [Corpus](https://github.com/LUDIARS/Corpus) | 汎用 hub フレームワーク (各サービスを集約) |
| — | [Concordia](https://github.com/LUDIARS/Concordia) | 複数 AI agent セッション協調 + 観測 |
| Li | [Lictor](https://github.com/LUDIARS/Lictor) | per-session sidecar (CLI と Concordia を中継) |
| Pf | [Praeforma](https://github.com/LUDIARS/Praeforma) | 仕様書 ↔ 実装連携 |
| Cn | [Conciliator](https://github.com/LUDIARS/Conciliator) | バイナリ / 非マージファイルの作業衝突検知 |
| Cs | [Custos](https://github.com/LUDIARS/Custos) | 遠隔テストランナー |
| At / A | [Actio](https://github.com/LUDIARS/Actio) | タスク管理基盤 |
| Sc | [Schedula](https://github.com/LUDIARS/Schedula) | 予定 / カレンダー基盤 |
| Ae | [Aedilis](https://github.com/LUDIARS/Aedilis) | 施設予約 + 予定登録/反映 |
| Ca | [Calicula](https://github.com/LUDIARS/Calicula) | カリキュラム予定管理 |
| Bb | [Bibliotheca](https://github.com/LUDIARS/Bibliotheca) | 本 / 機材 貸出台帳 |
| Nt | [Nuntius](https://github.com/LUDIARS/Nuntius) | 通知配信基盤 |
| — | [Legatus](https://github.com/LUDIARS/Legatus) | 個人 PC 常駐の LUDIARS サービス代理人 |
| — | [VantanHub](https://github.com/LUDIARS/VantanHub) | Vantan 校特化 hub (Corpus 派生) |
| Eg | [Ergo](https://github.com/LUDIARS/Ergo) | C++ モジュラーフレームワーク (ゲーム開発ワークフローの整備) |
| It | [Iter](https://github.com/LUDIARS/Iter) | C++ コンパイルエラー可視化 (開発ワークフロー支援) |
| Af | [AIFormat](https://github.com/LUDIARS/AIFormat) | レビュー / 設計フォーマット標準 |
| In | [infra](https://github.com/LUDIARS/infra) | 共有 PostgreSQL / Redis / MinIO |
| Ao | [All-In-OneTest](https://github.com/LUDIARS/All-In-OneTest) | 統合 CI monorepo |
| L / Ld | [LUDIARS](https://github.com/LUDIARS/LUDIARS) | 組織メタ + ダッシュボード |

---

## 3. データ

> 「AI 時代には『使えるデータを持っているやつが勝つ』」 仮説に基づくサービス。

| Code | Repo | どのデータを蓄えるか |
|------|------|----------------------|
| Mm | [Memoria](https://github.com/LUDIARS/Memoria) | Web ブックマ + Dig + 日記 + ドメイン辞書 (個人ログ全部) |
| — | [Quaestor](https://github.com/LUDIARS/Quaestor) | レシート + クレカ + 銀行 + Amazon (個人会計データ) |
| Iv | [Imperativus](https://github.com/LUDIARS/Imperativus) | 音声コマンド / GPS / Owntracks (位置・発話の個人ログ) |
| Cu | [Curare](https://github.com/LUDIARS/Curare) | アセット DB + workflow + release pipeline |

---

## 4. ゲーム開発

> Ars の検証や、 自作ゲームエンジン (Pictor / Ergo) を用いた開発を行う。

| Code | Repo | ゲーム内容 |
|------|------|------------|
| AC | [AdventureCube](https://github.com/LUDIARS/AdventureCube) | beat 駆動 rolling-cube ゲーム (LUDIARS org) |
| — | [KuzuSurvivors](https://github.com/MELPOT/KuzuSurvivors) | ヴァンサバ風サバイバー (MELPOT org / Pictor + Ergo の試験アプリ) |
| — | [Project-September](https://github.com/Project-September/Project-September) | Unity Fusion ベース公開ゲーム (外部 org / 6 anti-pattern 検証台) |

> **メモ**: KuzuSurvivors と Project-September は LUDIARS org **外** (それぞれ
> MELPOT / Project-September org) だが、 内部的には Pictor / Ergo / Concordia /
> Lictor 等の LUDIARS スタックの検証対象として運用している。 ライブラリ群の
> ドッグフード環境としての位置付け。

---

## 5. ライブラリ

> どれかのサービス、 または複数のサービスに従属する機能で、
> それ単体では何かをサービスしないもの。

| Code | Repo | 従属先 |
|------|------|--------|
| Pc | [Pictor](https://github.com/LUDIARS/Pictor) | 下層描画 (Vulkan)。 Ergo / AdventureCube / KuzuSurvivors が使う |
| Te | [Tessera](https://github.com/LUDIARS/Tessera) | モバイルゲーム通信 (Synergos 派生) |
| Cx | [Codex](https://github.com/LUDIARS/Codex) | 署名済イベント検証台帳 (Tessera / Synergos 系の light client) |
| — | [Vestigium](https://github.com/LUDIARS/Vestigium) | サービス横断ログ収集ライブラリ |
| — | [Lector](https://github.com/LUDIARS/Lector) | Web HTML → 構造化抽出パーサ (Memoria / Tirocinium 共用) |
| Si | [Signum](https://github.com/LUDIARS/Signum) | 画像アウトライン → SVG 生成 |
| Am | [Ars-Module](https://github.com/LUDIARS/Ars-Module) | Ars 向け Rust モジュール集 |
| Au | [Ars-Musa](https://github.com/LUDIARS/Ars-Musa) | Ars 向け音声 / UI モジュール |
| Ax | [Ars-PlatformPlugin](https://github.com/LUDIARS/Ars-PlatformPlugin) | Ars エディタ向けプラグイン |
| Ap | [Actio-PublicModules](https://github.com/LUDIARS/Actio-PublicModules) | Actio 公開モジュール集 |
| As | [Actio-SchoolModules](https://github.com/LUDIARS/Actio-SchoolModules) | Actio 学校系モジュール |

---

## 統計

| カテゴリ | 件数 | 主な傾向 |
|----------|------|----------|
| 1. 新時代 | 9 | 一番尖った layer。 ここを増やしたい |
| 2. ワークフロー | 21 | 一番太い layer。 「悪い病気」 自認の通り過剰、 隔週レビュー対象 |
| 3. データ | 4 | Memoria を軸に複数 vertical の個人データ蓄積 |
| 4. ゲーム開発 | 3 | LUDIARS 外 2 / 内 1。 Pictor / Ergo の dogfood |
| 5. ライブラリ | 11 | 上の 4 種を支える下層 |

---

## 運用メモ

- 新規 repo を立てる時は **まずこの 5 種のどれに該当するか** を考える。
  - どれにも当てはまらないなら「新時代」 寄りに振っておく (悪い病気は太らせない)
- 「ワークフロー」 が増えそうな時は、 既存の Corpus / Concordia / Actio の
  プラグインや submodule で済まないか検討する。
- 「ライブラリ」 は 1 サービス専用にしない (将来複数サービスから使えるか)。
  単独サービス専用ロジックは元 repo に置く。
- 「ワークフロー」 カテゴリは [隔週レビュー](./WORKFLOW-OVERENGINEERING-REVIEW.md) で
  「これは設計過剰では?」 を 1 件ずつ問い直す。

---

## 改訂履歴

- 2026-05-28 初版 (5 / 20 / 5+α / 3 / 14 = 47)
- 2026-05-28 改訂: Susurrus / Discutere / Ludus / Clio を新時代、 Ergo / Iter を
  ワークフロー、 Ludus を 新時代に格上げ (5 → 9 / 20 → 21 / 5+α → 4 / 3 / 14 → 11)
