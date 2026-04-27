# LUDIARS Project Codes

入力の手間を減らすため、LUDIARS プロジェクト名に通しコード (略称) を割り当てている。
チャットや個人メモで以下のコードが出てきたら、対応するプロジェクトを指す。

| Code | Project | 役割 |
|------|---------|------|
| At / A | [Actio](https://github.com/LUDIARS/Actio) | スケジュール / カレンダー基盤 |
| Cr | [Cernere](https://github.com/LUDIARS/Cernere) | 認証 / WS リレー基盤 |
| Iv | [Imperativus](https://github.com/LUDIARS/Imperativus) | 音声コマンドルータ / GPS |
| Nt | [Nuntius](https://github.com/LUDIARS/Nuntius) | 通知配信基盤 |
| AC | [AdventureCube](https://github.com/LUDIARS/AdventureCube) | beat 駆動 rolling-cube ゲーム |
| Mm | [Memoria](https://github.com/LUDIARS/Memoria) | Web ブックマーキング + RAG |
| Pc | [Pictor](https://github.com/LUDIARS/Pictor) | 下層描画ライブラリ (Vulkan) |
| Eg | [Ergo](https://github.com/LUDIARS/Ergo) | C++ モジュラーフレームワーク |
| Cs | [Custos](https://github.com/LUDIARS/Custos) | 遠隔テストランナー |
| Ar | [Ars](https://github.com/LUDIARS/Ars) | コンテンツ設計エディタ + ゲームエンジン |

## 運用ルール

- コードは **入力する側** の省力化を主目的とする。Claude や他者向けの公式
  ドキュメント・PR タイトル・コミットメッセージ等ではフルネームで書く。
- Eg 系は派生 (ergo_bind / ergo_particle / ergo_custos / tools/ergo) があるので
  単独表記は文脈で判断する。
- 表に無いプロジェクト (Synergos / Tessera / Codex / Calicula / Discutere /
  Curare / Clio / Signum / Iter / Ars-* / Foundation 等) はフルネーム運用。
- 新しい略称を追加するときは PR で本ファイルを更新する。
