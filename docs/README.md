# LUDIARS Services Dashboard (GitHub Pages)

LUDIARS org の全サービスの完成度・進捗を一画面で俯瞰できる静的サイト。
毎日 03:00 JST に `ludiars-status-daily` Scheduled task が走り、新しい
スナップショットを `docs/snapshots/YYYY-MM-DD.md` と
`docs/data/snapshots.json` に追記します。

公開 URL: <https://ludiars.github.io/LUDIARS/>

公開ダッシュボードには GitHub 上で `public` のリポジトリだけを登録します。
カテゴリとロードマップは `services.json` の登録済みリポジトリを表示境界とし、
過去スナップショットに現在非公開のリポジトリ名が残っていても一覧へ再表示しません。

## 公開サービス相関図

[`service-graph.html`](./service-graph.html) は、GitHub 上で公開を確認した
リポジトリ間の高水準な関係だけを掲載します。未公開リポジトリ、公開カタログ外の
ローカル専用サービス、外部サービスの実体、ホスト・ネットワーク構成、ポート番号は
掲載しません。Villa の完全版グラフは公開ページと分離して維持します。

2026-09-10 の neco 判断により、公開漏出監査が既存ファイルまたは組織メタデータから
報告するベースライン所見は、この公開図の追加に対する既存例外として受容されます。
この例外は新規・変更ファイルには適用しません。相関図を更新する際は、変更対象ファイルに
所見がないことを確認してください。

## GitHub Pages の配備

[`pages.yml`](../.github/workflows/pages.yml) は `docs/` を静的 artifact として配備します。
`main` への反映で自動実行され、Actions 画面からの手動実行も可能です。リポジトリの
Pages publishing source は **GitHub Actions** に設定します。

## ディレクトリ

```
docs/
├── .nojekyll               # Jekyll を無効化 (fetch 通信と assets/ 命名を保つため)
├── index.html              # ランディング + dashboard (SPA)
├── service-graph.html      # 公開リポジトリだけのサービス相関図
├── assets/
│   ├── app.js              # SPA logic — snapshots.json + services.json を fetch
│   ├── service-graph.js    # 相関図の描画・絞り込み・一覧表示
│   └── style.css           # ダークテーマ
├── data/
│   ├── services.json       # サービスカタログ (カテゴリ / 概要 / icon)
│   ├── public-service-graph.js # 相関図の公開ノード・関係
│   └── snapshots.json      # 時系列の完成度データ (日次追記)
└── snapshots/
    └── YYYY-MM-DD.md       # 生 Markdown のスナップショット (人間向け詳細)
```

## スナップショットを手動で追加するとき

1. `snapshots/YYYY-MM-DD.md` に Markdown を置く
2. `data/snapshots.json` の `snapshots` 配列に新エントリを追加、
   `latest` を更新する
3. commit + push (Pages は自動再デプロイ)

更新前に GitHub の visibility を確認し、private リポジトリや旧リポジトリ名を
`services.json`、`snapshots.json`、公開 Markdown へ追加しないでください。

エントリ形式:

```json
{
  "date": "YYYY-MM-DD",
  "weighted_completion": 55,
  "md": "snapshots/YYYY-MM-DD.md",
  "repos": { "LUDIARS": 70, "infra": 90, ... },
  "highlights": ["..."]
}
```

## 日報の自動化

`ludiars-status-daily` は登録済みリポジトリの `main` に入った直近24時間の
変更を日報としてまとめます。未マージ branch は含めず、根拠がない完成度は
直前値を継承します。設定内容と正本プロンプトは
[`DAILY-REPORT-PROMPT.md`](./DAILY-REPORT-PROMPT.md) を参照してください。
