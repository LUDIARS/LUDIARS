# LUDIARS Services Dashboard (GitHub Pages)

LUDIARS org の全サービスの完成度・進捗を一画面で俯瞰できる静的サイト。
毎週月曜 03:00 JST に `ludiars-status-weekly` routine が走り、新しい
スナップショットを `docs/snapshots/YYYY-MM-DD.md` と
`docs/data/snapshots.json` に追記します。

公開 URL: <https://ludiars.github.io/LUDIARS/> (Pages 有効化後)

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
│   └── snapshots.json      # 時系列の完成度データ (週次追記)
└── snapshots/
    └── YYYY-MM-DD.md       # 生 Markdown のスナップショット (人間向け詳細)
```

## スナップショットを手動で追加するとき

1. `snapshots/YYYY-MM-DD.md` に Markdown を置く
2. `data/snapshots.json` の `snapshots` 配列に新エントリを追加、
   `latest` を更新する
3. commit + push (Pages は自動再デプロイ)

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

## routine 自動化

`ludiars-status-weekly` routine は Claude 側で上記 JSON の更新と md 追加を
まとめて行います。詳細は routine の prompt を参照。
