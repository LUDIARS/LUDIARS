# REVIEW_MISSING_FEATURES — LUDIARS (2026-05-13)

## 評価: C+

`docs/snapshots/2026-05-10.md:50-54` が 5 リポ未登録を自認、 CI は health 4 本のみ、 README 無し。

## 所見

- C: README.md 不在 — PROJECT-CODES.md と ServiceMap.md のどちらが正本か判断不能。
- C+: `services.json:5-23` に Susurrus/Voluptas/Ludus/Educatus/ErgoDLLs 未登録、 placeholder entry で完結。
- B: cross-service auth smoke 未実装 (`INTEGRATION-CI.md:160-167`)。 `integration-auth.{sh,ps1}` で Phase 2。
- C+: `app.js:131-160` の timeline は 3 列、 SVG sparkline で推移可視化。
- B: `integration.yml:128-135` の retention 7 日 + filtering 無し → 1-2 日 + secret filter。
- C: runner registration 手順未文書化、 `2026-05-10.md:97-99` がブロッカー。
- D: 命名見直し / highlights 自動生成。

完成済: SPA / 9 categories / 4 週 snapshot / CI matrix / PROJECT-CODES.md / setup.mjs。
