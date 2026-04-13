# LUDIARS サービス構成

## 基盤サービス

| サービス | 役割 | 技術 |
|---------|------|------|
| [Cernere](https://github.com/LUDIARS/Cernere) | 認証基盤 (JWT + WS セッション + OAuth) | TypeScript + uWS / PostgreSQL / Redis |
| [Infra](https://github.com/LUDIARS/Infra) | 共有インフラ (PostgreSQL / Redis / MinIO) | Docker Compose |
| [Nuntius](https://github.com/LUDIARS/Nuntius) | 通知・メッセージング基盤 (SQS/SNS 的、マルチチャネル配信) | TypeScript + Hono / BullMQ |

## アプリケーションサービス

| サービス | 役割 | 技術 |
|---------|------|------|
| [Schedula](https://github.com/LUDIARS/Schedula) | スケジューリング・予約プラットフォーム | TypeScript + Hono + React |
| [Imperativus](https://github.com/LUDIARS/Imperativus) | WebRTC 音声コマンドルータ | Node.js + gRPC + STT |
| [Discutere](https://github.com/LUDIARS/Discutere) | Chat-to-Task 自動化 (Slack/Discord) | TypeScript + Hono |
| [Curare](https://github.com/LUDIARS/Curare) | アセット管理 | TypeScript + MinIO |
| [Ars](https://github.com/LUDIARS/Ars) | コンテンツ構造設計エディタ + ゲームエンジン | Rust (Tauri) + React + C++ |

## クライアントアプリ

| サービス | 役割 | 技術 |
|---------|------|------|
| [Synergos](https://github.com/LUDIARS/Synergos) | クロスプラットフォーム リアルタイムコラボ | Rust + Tokio + QUIC |
| [Pictor](https://github.com/LUDIARS/Pictor) | Data-Driven Rendering Pipeline | C++20 + Vulkan |
| [Ars-Module](https://github.com/LUDIARS/Ars-Module) | Ars モジュール | - |
| [Ars-Musa](https://github.com/LUDIARS/Ars-Musa) | Ars 楽曲モジュール | - |
| [Ars-PlatformPlugin](https://github.com/LUDIARS/Ars-PlatformPlugin) | Ars プラットフォームプラグイン | - |

## ツール・ライブラリ

| リポジトリ | 役割 |
|---------|------|
| [AIFormat](https://github.com/LUDIARS/AIFormat) | AI 出力フォーマット・レビューテンプレート |
| [Ergo](https://github.com/LUDIARS/Ergo) | C++ モジュラーフレームワーク |
| [Clio](https://github.com/LUDIARS/Clio) | リソース管理・自動取得モジュール |

## 計画中・未着手

| リポジトリ | 状態 |
|---------|------|
| [Iter](https://github.com/LUDIARS/Iter) | 計画段階 |
| [Voluptas](https://github.com/LUDIARS/Voluptas) | 未着手 |
| [Educatus](https://github.com/LUDIARS/Educatus) | 未着手 |
| [Ludus](https://github.com/LUDIARS/Ludus) | 未着手 |

---

## サービス間の依存関係

```
       [Cernere]
         ↑ 認証
    ┌────┴────┬─────────┬──────────┬─────────┐
    ↓         ↓         ↓          ↓         ↓
[Schedula] [Imperativus] [Curare] [Discutere] [Ars]
    │         │         │                     │
    └─→ [Nuntius] ←─────┘                   └─→ [Synergos]
        (通知配信)                              (コラボ)
```

---

## 共通基盤ルール

- **認証**: すべてのサービスが Cernere に従う (詳細: [AIFormat/RULE.md](https://github.com/LUDIARS/AIFormat/blob/main/RULE.md))
- **DB**: PostgreSQL 17 (共有インフラ、サービスごとに DB 分離)
- **セッション**: Redis 7
- **環境変数**: `@ludiars/cernere-env-cli` + Infisical
- **マイグレーション**: 冪等性必須 (IF NOT EXISTS / DROP 禁止)
