---
task: 2026-09-10-public-service-graph-pages
project: LUDIARS
kind: 公開ダッシュボード
created: 2026-09-10
domain: workspace-governance
memory_links:
  - docs/README.md
  - docs/data/services.json
---
# 公開サービス相関図の GitHub Pages 配備

## 目的

LUDIARS の公開リポジトリ間にある高水準な関係を GitHub Pages で閲覧できるようにする。Villa にある完全版グラフは変更せず、公開ページへ未公開リポジトリ、公開カタログ外のローカル専用サービス、外部サービスの実体、ホスト・ネットワーク構成、ポート番号を含めない。

## 公開境界

- 相関図のノードは `docs/data/services.json` の公開サービスカタログに存在するリポジトリだけに限定する。
- 関係は相関図に登録されたノード間だけに限定し、認証、API・連携、通知、運用、共有ライブラリの高水準な分類だけを掲載する。
- リンクは固定の LUDIARS GitHub organization と URL-safe なリポジトリ ID から生成する。
- DOM へ表示するデータは `textContent` または `createTextNode` で設定し、HTML として解釈しない。

## 完了条件

- `docs/service-graph.html` でカテゴリ絞り込み、名前検索、ノード選択、関係一覧を利用できる。
- 狭い画面ではグラフを横スクロールでき、描画座標とクリック座標が一致する。
- 公開ノード、カテゴリ、関係種別、関係先、重複の整合性を自動テストで検証する。
- `docs/` の静的ファイルを最小権限の GitHub Pages workflow で配備する。
