# REVIEW_DESIGN — LUDIARS (2026-05-13)

## 評価: B

責務分離は明瞭、 services.json 駆動の SPA はビルド不要で素直 (`docs/assets/app.js:29-42`)。 ただし正本の境界が曖昧。

## 所見

- 良: カテゴリ宣言集約 (`docs/data/services.json:5-23`)、 OS パリティ方針 (`docs/INTEGRATION-CI.md:68-84`)。
- B-: 正本が ServiceMap.md / PROJECT-CODES.md / services.json / setup.mjs に分散、 README で権威宣言が無い。
- C: `ServiceMap.md:18` の Schedula が services.json の Actio (`docs/data/services.json:86-91`) と齟齬。
- C: `ServiceMap.md:53-64` の依存図が `docs/snapshots/2026-05-10.md:413-439` の最新図と乖離 (Memoria/Concordia/Susurrus 欠落)。
- C+: `setup.mjs:21-92` の 7 件が services.json と独立進化。

推奨: README.md で「services.json = 権威」 宣言、 Schedula→Actio 置換。
