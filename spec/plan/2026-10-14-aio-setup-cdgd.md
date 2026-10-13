# All-In-One-Setup (CDGD プロファイル) 設計

2026-10-14 neco 指示: 「LUDIARS サービスをフルセット入れて Cc で CDGD をやれる環境を整えられる
All-In-One-Setup スクリプトを LUDIARS に用意する」「セットアップで作業が必要なものは簡略化できるようにする」
「流出チェックを使用する全サービスにかけ、他プロジェクトでの利用に影響ないようにする」。

新しい PC で CDGD (Cc のマネジメント層と Cf / Pf / An / Di などの連携) を始めるまでに、人が手で
行っていた準備を、何度実行しても同じ結果になる手順 (冪等) にまとめる。既存の `setup.mjs`
(Infisical 時代の対話セットアップ) は残し、新しい入口を別に置く。

## 入口

```sh
node setup/aio/main.mjs --profile cdgd [--root <dir>] [--only <step,...>] [--skip <step,...>]
                         [--with-native] [--dry-run]
npm run setup:aio -- --profile cdgd
```

- ワークスペースのルートは `--root`、無ければ環境変数 `LUDIARS_ROOT`。どちらも無ければ停止する
  (別パスを試さない、個人のパスを書かない)。
- `--dry-run` は各手順が「何をするか」だけを出し、何も変更しない。
- 各手順は現状を読んでから必要な分だけ行う。済んでいる手順は `skip (already)` と出す。
- 失敗した手順は理由を出して止まる。後続の手順を無言で続けない。

## プロファイル

プロファイルはリポの集合と、手順ごとの追加設定を持つ。`cdgd` は次を含む。

| 役割 | コード (service-map.json) |
|---|---|
| 運用基盤 | Ex (Excubitor), Cc (Concordia), Li (Lictor), Revisor, Actio |
| 設計・解析 | An (Anatomia), Pf (Praeforma), Th (Thaleia), Ag (Augur) |
| CDGD の流れ・議論 | Cf (Conflux), Di (Discutere) |
| 遊び・自動プレイ・攻略 | Lu (Ludus), Ig (Ingenium), Cm (Commentarii) |
| 分析 | Vitia, Om (Omnipotens) |
| 任意 (ネイティブ表示) | Pc (Pictor), Tela (`--with-native` のときだけ) |

リポ名とコードは `service-map.json` を正本とし、プロファイルにはコードだけを書く。
service-map に無いリポ (Revisor・Tela など) はプロファイル側に `owner/name` で書く。

## 手順 (この順に実行)

| # | 手順 id | 内容 | 今回手作業になった理由 |
|---|---|---|---|
| 1 | `prereq` | node / git / gh の有無と版、`gh auth` の `read:packages` スコープ、`NODE_ENV=production` の検出 (警告) | `NODE_ENV=production` で devDependencies が落ちた / GitHub Packages の認証が無かった |
| 2 | `repos` | 不足リポの clone、クリーンな base checkout の fast-forward pull、`git submodule update --init --recursive` | submodule 未初期化でビルド・テストが落ちた |
| 3 | `deps` | `npm ci` (lock が無ければ `npm install`) を `NODE_ENV=development --include=dev` で実行。`@ludiars` の GitHub Packages は `gh auth token` を実行時引数でだけ渡し、ファイルに書かない。lock の差分は元に戻す | 同上 |
| 4 | `build` | プロファイルに書いたビルド (`npm run build` など) | Actio が dist を起動するのに build 手順を持たない |
| 5 | `excubitor` | Excubitor の到達確認 (ポートは Excubitor の catalog から読む)。未起動なら起動手順を案内して止める | — |
| 6 | `vault-defaults` | 秘密でない既定値を Vault に入れる (未登録の名前だけ)。サービスの binding は既存に**追加**し、置き換えない。例: Actio のローカル DB (`DB_DIALECT=sqlite` / `DATABASE_PATH=data/actio.db`)。共有 DB の `DATABASE_URL` が既にある PC では入れない | Actio が初回設定画面で止まった |
| 7 | `actio-db` | SQLite 選択時に DB が無ければ `db:init` を実行 | テーブルが無く 500 になった |
| 8 | `cc-projects` | プロファイルのリポを Cc のプロジェクトコードに登録 (既存は変えない) | 未登録だと delegation が `actio_binding_invalid` で止まった |
| 9 | `revisor` | プロファイルのリポを Revisor に登録。審査テストはリポから決める: `.gitmodules` があれば最初に submodule 初期化、`package.json` があれば `npm ci --include=dev` と存在するスクリプト (`typecheck` / `test`)、PowerShell の検査スクリプトはルートを引数で渡す。既存の登録は `--refresh` のときだけ更新 | submodule 抜け・PowerShell 5.1 の `$PSScriptRoot` で審査が環境要因で落ちた |
| 10 | `services` | CDGD に要るサービスを Excubitor 経由で依存順に起動する。起動前に Cc の testing claim、終了後 release | — |
| 11 | `leak-check` | 流出語ファイル (`REVISOR_CONFIDENTIAL_TERMS_FILE`) の有無と enforcement を確認し、プロファイルの全リポの未 push コミット・未コミット差分を Revisor の検査関数で調べる。出すのは term id と件数だけ | 支援ツールの公開リポに非公開タイトルの名前が入りかけた |
| 12 | `native` (任意) | `--with-native` のとき、vswhere で Build Tools 同梱の CMake を見つけ、Pictor → Tela → Pf の overlay ホストを `<root>/.build/` にビルドする。Build Tools が無ければ winget のコマンドを案内して止める (管理者権限のインストールはしない) | CMake / MSVC の場所が分からず、手で探した |

## 流出させない設計 (名前に依存しないツール)

- スクリプト・プロファイル・テストに、対象プロジェクト (ゲームタイトル等) の名前・ID・内容を書かない。
- スクリプトは対象プロジェクトを登録しない。対象の登録は各ツールの実行時入力とデータフォルダで行う
  (ツール側のリポは変更しない)。
- 手順 11 は値を出力しない。term id・件数・リポ名だけを出す。
- 他プロジェクトへの影響: Vault の binding は追加のみ、Cc / Revisor の既存登録は上書きしない (`--refresh` 時を除く)、
  Revisor 登録で入る pre-push フックは LUDIARS の規約 (main 直 push 禁止・Revisor PR 経由) どおりの挙動。

## 構成 (SRP)

```
setup/aio/
  main.mjs            CLI 引数 → 手順の選択 → 実行 → 要約
  profiles.mjs        プロファイル定義 (コードの集合と手順ごとの設定)
  context.mjs         ルート・service-map・Excubitor / Cc のエンドポイント解決
  lib/exec.mjs        子プロセス実行 (shell 不使用、環境の上書き)
  lib/http.mjs        loopback HTTP (日本語 body は UTF-8 で送る)
  lib/report.mjs      手順ごとの結果 (done / skip / fail) の記録と要約
  steps/<id>.mjs      上表の 12 手順 (1 ファイル 1 手順)
test/aio-*.test.mjs   純粋部分 (プロファイル解決、審査テストの決定、binding の追加、catalog のポート解決) を fixture で検証
```

## 受け入れ条件

- 新しい PC 相当の状態から `--profile cdgd` を 1 回流すと、手順 1〜11 が done か skip になり、
  CDGD のサービスが Excubitor 上で running になる。
- 2 回目の実行では変更を伴う手順がすべて skip になる (冪等)。
- `--dry-run` は何も変更しない。
- 既存の Vault binding・Cc / Revisor 登録を消さない。
- スクリプトとテストに対象プロジェクトの名前・個人のパスが含まれない (手順 11 自身で検査できる)。
