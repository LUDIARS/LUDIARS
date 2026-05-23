# LUDIARS scripts

org 横断の orchestration ツール。 各サービスの dev 体験を統一する。

## services.mjs — service registry

`infra/PORT-MAP.md` + `Corpus/server/hub/discovery.ts` と同期した
サービス一覧 (id / repoDir / subDir / port / hasEnvCli 等)。 `infisical.mjs`
等の他スクリプトから import される。

新サービス追加時はここに 1 行 + PORT-MAP 更新。

## infisical.mjs — Infisical 一括操作

各サービスの `env:<op>` (Infisical) を横串で実行する。 単一サービスでの
対話 setup より複数サービス並行管理に向く。

### 通常 op

```sh
npm run infisical -- gen bibliotheca aedilis      # 2 サービスで env:gen
npm run infisical -- initialize --all             # env-cli を持つ全サービス
npm run infisical -- list memoria                 # Memoria の env 一覧
npm run infisical -- set FOO=bar bibliotheca      # 1 key 設定
```

op = `setup / setup-batch / test / gen / list / get / set / initialize`。
通常 op は各サービスの `<repoDir>/<subDir?>` で `npm run env:<op>` を直列実行。

**`initialize` だけは特別**: `env:initialize` (Infisical に defaults 登録) の
直後に `env:gen` (.env 書出) も自動で回す。 単独 env-cli の `initialize` は
登録のみで .env を書かないが、 この wrapper は LUDIARS 一括 bootstrap でよく
使う流れに合わせて連結する。 → 1 コマンドで「Infisical 登録 + 各サービスの
`.env` 生成」 までが完了する。

### setup-batch — 各サービスの ProjectID を 1 config で一括

`env:setup` の対話 5 項目のうち:

| 項目 | per-service / shared |
|------|---------------------|
| `siteUrl` | shared |
| `environment` | shared (override 可) |
| **`projectId`** | **per-service** |
| `clientId` | shared (通常 1 machine identity) |
| `clientSecret` | shared (同上) |

ProjectID だけがサービス毎に違うので、 1 config + 1 コマンドで全サービスに
反映する。

```sh
# 1) テンプレ生成 (LUDIARS/.infisical-batch.json — gitignored)
npm run infisical -- setup-batch --init

# 2) .infisical-batch.json を編集 (各 services.<id>.projectId と
#    defaults.client* を埋める)

# 3) 一括書込 (各サービスの .env.secrets を直接生成、 env-cli の対話を bypass)
npm run infisical -- setup-batch --all

# 4) 接続確認
npm run infisical -- test --all

# 5) 全サービスで .env 生成
npm run infisical -- gen --all
```

### .infisical-batch.json の構造

```json
{
  "defaults": {
    "siteUrl": "https://app.infisical.com",
    "environment": "dev",
    "clientId": "<shared-universal-auth-client>",
    "clientSecret": "<shared-secret>"
  },
  "services": {
    "cernere":     { "projectId": "abc..." },
    "bibliotheca": { "projectId": "def..." },
    "aedilis":     { "projectId": "ghi..." }
    // service 側で defaults を override 可
  }
}
```

`.gitignore` 済 (clientSecret を含むため commit されない)。

### Safety

- 既存 `.env.secrets` は `--force` 無しでは skip — 手動設定済の環境を壊さない
- `--init` は既存ファイルがあれば失敗 (上書きしない)
- 不完全 config (projectId / clientId / clientSecret 欠落) のサービスは
  個別に skip + 警告
