# REVIEW_IMPLEMENTATION — LUDIARS (2026-05-13)

## 評価: B+

実装は素直で各関数が小さい。 6 ペア (bash/pwsh) に drift。

## 所見

- A: `app.js:14-27` の TIER_DEFS + `tierOf()` 全描画共有。
- A: `app.js:162-166` の `escapeHtml` で highlights XSS 対策。
- A: `integration-wait.sh:21-62` で Health/ExitCode/Running 3 状態 fail-fast + tail-100。
- A-: `fetch-services.ps1:9-12` の path forward-slash 正規化で BuildKit 罠回避。
- B-: bash/pwsh ペアの drift — `integration-test.sh:14-24` curl vs `integration-test.ps1:10-25` Invoke-WebRequest、 共通層抽出推奨。
- C+: `integration-test.sh:50-52` smoke は wget exit 0 で成功扱い、 body assert 推奨。
- C: `setup.mjs:21-92` の 7 件は Nuntius/Memoria/Concordia を含まず CI と乖離。
- C: `app.js:147` で snapshot md を raw 開きするため Pages UX 劣化、 blob URL 推奨。
