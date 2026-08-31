# LUDIARS Services Dashboard (GitHub Pages)

LUDIARS org の全サービスの完成度・進捗を一画面で俯瞰できる静的サイト。
毎日 03:00 JST に `ludiars-status-daily` Scheduled task が走り、新しい
スナップショットを `docs/snapshots/YYYY-MM-DD.md` と
`docs/data/snapshots.json` に追記します。

公開 URL: <https://ludiars.github.io/LUDIARS/> (Pages 有効化後)

公開ダッシュボードには GitHub 上で `public` のリポジトリだけを登録します。
カテゴリとロードマップは `services.json` の登録済みリポジトリを表示境界とし、
過去スナップショットに現在非公開のリポジトリ名が残っていても一覧へ再表示しません。

## ディレクトリ

```
docs/
├── .nojekyll               # Jekyll を無効化 (fetch 通信と assets/ 命名を保つため)
├── index.html              # ランディング + dashboard (SPA)
├── assets/
│   ├── app.js              # SPA logic — snapshots.json + services.json を fetch
│   └── style.css           # ダークテーマ
├── data/
│   ├── services.json       # サービスカタログ (カテゴリ / 概要 / icon)
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
