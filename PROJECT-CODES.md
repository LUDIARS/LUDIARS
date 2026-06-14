# LUDIARS Project Codes

入力の手間を減らすため、LUDIARS プロジェクト名に通しコード (略称) を割り当てている。
チャットや個人メモで以下のコードが出てきたら、対応するプロジェクトを指す。
カテゴリ並びは [Services Dashboard](https://ludiars.github.io/LUDIARS/) と同じ。

## メタ / インフラ

| Code | Project | 役割 |
|------|---------|------|
| L / Ld | [LUDIARS](https://github.com/LUDIARS/LUDIARS) | 組織メタ + サービスダッシュボード |
| In | [infra](https://github.com/LUDIARS/infra) | 共有 PostgreSQL / Redis / MinIO 基盤 |
| Af | [AIFormat](https://github.com/LUDIARS/AIFormat) | レビュー / 設計フォーマット標準 |
| Ao | [All-In-OneTest](https://github.com/LUDIARS/All-In-OneTest) | 統合 CI 用 private monorepo |

## コアエンジン / SDK

| Code | Project | 役割 |
|------|---------|------|
| Ar | [Ars](https://github.com/LUDIARS/Ars) | コンテンツ設計エディタ + ゲームエンジン |
| Eg | [Ergo](https://github.com/LUDIARS/Ergo) | C++ モジュラーフレームワーク |
| Pc | [Pictor](https://github.com/LUDIARS/Pictor) | 下層描画ライブラリ (Vulkan) |
| Lp | [Lapilli](https://github.com/LUDIARS/Lapilli) | LUDIARS 小型共有ツール monorepo (@ludiars/encrypted-config 等) |
| Vg | [Vestigium](https://github.com/LUDIARS/Vestigium) | LUDIARS 横断ログ収集ライブラリ (JSONL writer + 日次ロール + retention) |
| Ci | [Canalis](https://github.com/LUDIARS/Canalis) | 共有データ取込パイプライン (crawl → clean → save、LLM 依存ゼロ) |
| Lc | [Lector](https://github.com/LUDIARS/Lector) | 共有パーサパッケージ |

## 認証 / 通知

| Code | Project | 役割 |
|------|---------|------|
| Cr | [Cernere](https://github.com/LUDIARS/Cernere) | 認証 / WS リレー基盤 |
| Nt | [Nuntius](https://github.com/LUDIARS/Nuntius) | 通知配信基盤 |
| Os | [Ostiarius](https://github.com/LUDIARS/Ostiarius) | 会場 LAN チェックインゲートウェイ (passkey assertion オフライン検証 + attestation 署名) |

## スケジュール / タスク

| Code | Project | 役割 |
|------|---------|------|
| At / A | [Actio](https://github.com/LUDIARS/Actio) | タスク (Task) 管理基盤 |
| Sc | [Schedula](https://github.com/LUDIARS/Schedula) | 予定 (Event) / カレンダー管理基盤 (Actio から分離) |
| Ap | [Actio-PublicModules](https://github.com/LUDIARS/Actio-PublicModules) | 公開モジュール集 |
| As | [Actio-SchoolModules](https://github.com/LUDIARS/Actio-SchoolModules) | 学校系モジュール (curriculum / facility / Cocoiru 等) |
| Ca | [Calicula](https://github.com/LUDIARS/Calicula) | カリキュラム予定管理デスクトップアプリ |
| Ae | [Aedilis](https://github.com/LUDIARS/Aedilis) | 施設予約 + 予定登録/反映 (Schedula / Google Calendar 連携) |
| Di | [Discutere](https://github.com/LUDIARS/Discutere) | Discord-only 自走議論 + Chat-to-Task 自動化 |

## ゲーム

| Code | Project | 役割 |
|------|---------|------|
| AC | [AdventureCube](https://github.com/LUDIARS/AdventureCube) | beat 駆動 rolling-cube ゲーム (Ergo/Pictor 試験アプリ) |
| KS | [KuzuSurvivors](https://github.com/LUDIARS/KuzuSurvivors) | ヴァンサバ風ゲーム (Pictor/Ergo 試験アプリ) |
| Ul | [UniLand](https://github.com/LUDIARS/UniLand) | Web ゲーム (Uni キャラ描画) |
| Lu | [Ludus](https://github.com/LUDIARS/Ludus) | ゲームコンテンツ + game-lexicon / game-template |

## ネットワーク

| Code | Project | 役割 |
|------|---------|------|
| Sy | [Synergos](https://github.com/LUDIARS/Synergos) | P2P コラボ基盤 (Cloudflare Tunnel + QUIC) |
| Te | [Tessera](https://github.com/LUDIARS/Tessera) | モバイルゲーム通信基盤 (設計段階) |
| Cx | [Codex](https://github.com/LUDIARS/Codex) | 署名済イベント検証台帳 |
| Vc | [VTN-Connect](https://github.com/LUDIARS/VTN-Connect) | VTN ネットワーク接続ツール |

## アセット / ツール

| Code | Project | 役割 |
|------|---------|------|
| Cu | [Curare](https://github.com/LUDIARS/Curare) | アセット管理サーバ |
| Cl | [Clio](https://github.com/LUDIARS/Clio) | リソース抽象化 / 自動取得モジュール |
| Si | [Signum](https://github.com/LUDIARS/Signum) | 画像アウトライン → SVG 生成 |
| Iv | [Imperativus](https://github.com/LUDIARS/Imperativus) | 音声コマンドルータ / GPS |
| It | [Iter](https://github.com/LUDIARS/Iter) | C++ コンパイルエラー可視化 (設計段階) |
| Mm | [Memoria](https://github.com/LUDIARS/Memoria) | Web ブックマーキング + RAG + タスク |
| Cs | [Custos](https://github.com/LUDIARS/Custos) | 遠隔テストランナー |
| Su | [Susurrus](https://github.com/LUDIARS/Susurrus) | ローカル先行チャット (Cernere auth + Synergos P2P) |
| Bb | [Bibliotheca](https://github.com/LUDIARS/Bibliotheca) | 本 / 機材 貸出台帳 (ISBN / QR スキャン + admin 返却) |
| Qu | [Quaestor](https://github.com/LUDIARS/Quaestor) | 個人会計自動化 (レシート撮影 + 取込 + 照合) |
| Cn | [Conciliator](https://github.com/LUDIARS/Conciliator) | バイナリ / 非マージファイルの作業衝突検知 + クレバーマージ支援 |
| Pf | [Praeforma](https://github.com/LUDIARS/Praeforma) | 仕様書 ↔ 実装連携 (placeholder + 構造化 spec + asset 差し替え) |
| Tr | [Tirocinium](https://github.com/LUDIARS/Tirocinium) | 面接練習アプリ (ES/ポートフォリオ学習 AI + 音声対話 + 複合 LLM 評価) |
| Li | [Lictor](https://github.com/LUDIARS/Lictor) | Claude Code セッション付き沿いサイドカー (端末タイトル / セッションメタ / sidecar) |
| Hr | [Hora](https://github.com/LUDIARS/Hora) | Desktop Ojisan アプリ (Tauri 2) |
| Ll | [Ludellus-Server](https://github.com/LUDIARS/Ludellus-Server) | ゲームサーバ (Hono + Cernere PASETO + Claude API proxy) |

## Hub / 運用協調

| Code | Project | 役割 |
|------|---------|------|
| Cc | [Concordia](https://github.com/LUDIARS/Concordia) | 複数 AI セッション協調・記録サービス |
| Co | [Corpus](https://github.com/LUDIARS/Corpus) | 汎用 hub フレームワーク (各サービスにコネクタ接続して集約) |
| Ex | [Excubitor](https://github.com/LUDIARS/Excubitor) | サービス監視 + 運用コア + ランチャー |
| Fa | [Famulus](https://github.com/LUDIARS/Famulus) | ローカル LLM スポナー + 黒箱モデル切り替え機 |
| Lg | [Legatus](https://github.com/LUDIARS/Legatus) | 個人 PC 常駐の LUDIARS サービス代理人 (OwnTracks → Actio forwarder) |
| Vh | [VantanHub](https://github.com/LUDIARS/VantanHub) | Vantan 校特化 Hub (Corpus submodule + 5 モジュール + Electron マスコット) |

## Ars プラグイン

| Code | Project | 役割 |
|------|---------|------|
| Am | [Ars-Module](https://github.com/LUDIARS/Ars-Module) | Ars 向け Rust モジュール集 |
| Au | [Ars-Musa](https://github.com/LUDIARS/Ars-Musa) | Ars 向け音声 / UI モジュール (Melpomene 等) |
| Ax | [Ars-PlatformPlugin](https://github.com/LUDIARS/Ars-PlatformPlugin) | Ars エディタ向けプラグイン + 管理ツール |

## 運用ルール

- コードは **入力する側** の省力化を主目的とする。Claude や他者向けの公式
  ドキュメント・PR タイトル・コミットメッセージ等ではフルネームで書く。
- Eg 系は派生 (ergo_bind / ergo_particle / ergo_custos / tools/ergo) があるので
  単独表記は文脈で判断する。
- Cocoiru など repo に紐づかない子モジュールはフルネーム運用。
- C 系が多いので注意: Cc=Concordia / Ci=Canalis / Cl=Clio / Cn=Conciliator /
  Co=Corpus / Cr=Cernere / Cs=Custos / Ca=Calicula / Cu=Curare / Cx=Codex。
- 大文字・小文字を区別する (`At` ≠ `at`、`KS` ≠ `Ks`)。
- 新しい略称を追加するときは PR で本ファイルを更新する。
