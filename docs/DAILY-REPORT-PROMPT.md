# LUDIARS dashboard daily report prompt

ChatGPT Scheduled task で毎日実行するための正本プロンプト。

## Schedule

- Name: `ludiars-status-daily`
- Cadence: daily at 03:00 Asia/Tokyo
- Project: `LUDIARS`
- Git mode: isolated worktree

## Prompt

```text
LUDIARS の公開サービスダッシュボードを日報として更新してください。

1. docs/data/services.json に登録済みの公開リポジトリを対象にする。
2. 各ローカル checkout の main だけを調べ、直近24時間に main へ入った変更をワークストリーム別に要約する。未マージ branch、worktree 内だけの変更、private リポジトリは含めない。
3. docs/snapshots/YYYY-MM-DD.md を追加し、docs/data/snapshots.json の snapshots に同日エントリを追加して latest を更新する。
4. 完成度は明確な定量的根拠がある場合だけ変更し、それ以外は直前値を継承して _calc と Markdown に明記する。
5. 同日のスナップショットが既にある場合は重複追加せず、その内容を更新する。
6. ユーザーから明示されない限りテスト、サービス起動、merge、auto-merge、main 更新は行わない。
7. 実 checkout branch と Cc claim を確認し、専用 worktree で commit した後、Revisor local PR を作成したら停止する。
8. main 更新が0件でも「変更なし」の日報を作成する。
```
