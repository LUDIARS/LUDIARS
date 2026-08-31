---
task: register-daily-dashboard-scheduled-task
project: LUDIARS
kind: 雑用
created: 2026-08-31
memory_links:
  - docs/DAILY-REPORT-PROMPT.md
  - https://learn.chatgpt.com/docs/automations
---
# LUDIARS dashboard 日報の Scheduled task 登録

## 目的

リポジトリ内に定義済みの `ludiars-status-daily` を ChatGPT Scheduled task として登録し、LUDIARS の公開サービスダッシュボードを毎日の日報として継続更新できる状態にする。

## 完了条件

- 既存の同名タスクの有無を確認し、なければ `ludiars-status-daily` を作成し、あれば更新して重複を避ける。
- 実行時刻を毎日 03:00、タイムゾーンを Asia/Tokyo に設定する。
- ローカル project `LUDIARS` と isolated worktree を実行対象に設定する。
- 実行プロンプトに `docs/DAILY-REPORT-PROMPT.md` の Prompt 節を使用する。
- Scheduled 一覧で active 状態と次回実行日時を確認する。
- ローカルファイルを扱う実行時は、対象マシンと ChatGPT デスクトップアプリを稼働させておく必要があることを運用者へ明示する。

## Scheduled task 登録作業のスコープ

- ChatGPT Scheduled task の外部設定だけを変更する。
- 登録作業中、LUDIARS リポジトリは `docs/DAILY-REPORT-PROMPT.md` の参照に限り、ファイルを編集しない。
- サービス起動、テスト、merge、auto-merge、main 更新は行わない。
