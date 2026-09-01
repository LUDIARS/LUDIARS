# Satelles 日報 run が isolated worktree を所有できず commit broker に拒否される

- Date: 2026-09-02
- Status: unresolved
- Area: Concordia delegation / Satelles worktree binding
- Severity: High — scheduled implementation run が commit と Revisor local PR まで完走できない

## Summary

`ludiars-status-daily` は `Git mode: isolated worktree` を正本に持つが、2026-09-02 の delegation run は共有 LUDIARS checkout を `spawn_cwd` として起動され、feature branch と worktree を記録しなかった。手動で専用 worktree を作成して session binding を更新しても、commit broker は run の起動時記録を参照するためコミットを拒否した。isolated-worktree 契約からの回帰である。

## Evidence

- 起動記録では `spawn_cwd` が共有 checkout を指し、`spawn_branch` / `spawn_worktree_path` は未設定、`spawn_worktree_created` は false だった
- 共有 checkout: `main`、既存の未追跡ファイルあり
- 専用 worktree と feature branch を手動作成し、session の `repo_path` / `branch` を実 worktree と一致させた
- commit broker は protected branch 扱いの HTTP 409 を返した
- 引継ぎ run も共有 checkout と未設定の branch / worktree 情報で起動され、同じ所有権不整合を引き継いだ
- 引継ぎ session の binding を専用 worktreeと feature branch へ更新した後も、commit broker は同じ理由で拒否した

## Regression Context

日報プロンプトは専用 worktree での commit と Revisor local PR を完了条件にしており、Scheduled task の Schedule 節も isolated worktree を指定している。run 起動時にこの条件が反映されなかった。

## Cause

commit broker は session の更新済み binding ではなく delegation run の不変な `spawn_cwd` / `spawn_branch` をガード入力に使う。今回の run は spawn 時に worktree を作成・記録していないため、後から正しい session claim を登録しても broker の所有対象が共有 `main` のまま残る。

## Fix Requirements

- `ludiars-status-daily` 起動時に最新 base から feature branch と isolated worktree を作成し、run の `spawn_worktree_path` / `spawn_branch` を記録する。
- Satelles が実 worktreeへ移った場合、明示 claim と run-owned worktree の対応を安全に同期する正式経路を用意する。
- commit broker と completion evidence guard が、同じ run-owned worktree 情報を参照する。
- 共有 checkout の `main` や既存差分を commit 対象にしない現行ガードは維持する。

## Verification

- isolated-worktree 指定の scheduled delegation を起動し、run に非 protected branch と worktree path が記録される回帰テストを追加する。
- session binding 更新後の commit broker が、run 所有権を満たす feature worktreeだけを commitできる統合テストを追加する。
- LUDIARS の snapshot catalog 回帰テストと Anatomia verify は通過した。Concordia 側の worktree 所有権回帰テストは本 run の対象外であり、実行していない。

## Follow-up

本 worktree の日報差分を commit し、Revisor local PR へ提出するには、Concordia 側でこの run の所有 worktree を正式に採用するか、正しい isolated worktree を持つ後続 run へ引き継ぐ必要がある。
