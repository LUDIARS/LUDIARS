# LUDIARS ゲームポートフォリオ — 目的・コンセプト・チーム

> これまで作ってきたゲームを 1 本ずつ「チーム」として整理する。
> 各ゲームは **コンセプト** (何を遊ばせるか) に加えて **目的** (なぜ作るか) を持ち、
> 優先度は目的によって変わる (資金調達 > テックデモ/検証 > 研究/サンプル)。
> **目的・優先度・チーム編成**の正本はこのファイル。
> 略称は [PROJECT-CODES.md](./PROJECT-CODES.md)、用途別分類は
> [REPO-CLASSIFICATION-BY-PURPOSE.md](./REPO-CLASSIFICATION-BY-PURPOSE.md) が正本。

最終更新: 2026-09-04 (未公開ゲームの秘匿ルールを反映)

---

## 1. 目的の分類と優先度ルール

| 目的カテゴリ | 意味 | 基本優先度 |
|---|---|---|
| 資金調達 | 売上・出資・案件につながるもの | **高** |
| 移植検証 / テックデモ | Pictor / Ergo など自作スタックの実証 | 中 |
| AI/LLM 研究 | LLM をゲーム構造に組み込む実験 | 中 |
| 教育 / 学生サンプル | 学生開発の教材・テンプレ | 低〜中 |
| 知育 (Ludellus 系) | 幼少向け学習体験 | 別枠 (後述) |

優先度は「目的カテゴリ」で決まり、同カテゴリ内は neco の指示で上下させる。
複数目的を持つものは上位の目的で置く。

---

## 2. チーム一覧 (neco 指定)

| # | チーム / Code | 目的 | コンセプト | 優先度 | 技術スタック |
|---|---|---|---|---|---|
| 1 | **AdventureCube** `AC` | Pictor / Ergo のテックデモ | スキル系のローグライト (拍に乗って進む rolling-cube) | 中 | C++ / Vulkan / Pictor / Ergo |
| 2 | 未公開ゲーム A (コード未登録) | 資金調達・移植検証 | 非公開 | 高 | 非公開 |
| 3 | **Pagus** `Pa` | AI/LLM を使用したライバルピーク風ゲームの構築 | のんびり村を再現しよう (村人が自律行動 → 事件 → 裁判 → 教育/改変) | 中 | Web / TS / PixiJS / `claude -p` |
| 4 | 未公開ゲーム B (コード未登録) | 教育・学生サンプル | 非公開 | 低〜中 | 非公開 |

> **コード未登録について**: 上表の未公開ゲームは、公開されるまで
> [PROJECT-CODES.md](./PROJECT-CODES.md) に登録しない。公開後に略称を追加する場合は、
> 同ファイルの運用ルールに従って別 PR で更新する。
>
> **未公開タイトルは本ファイルに名前を書かない。** 公開リポなので、
> タイトル名・コンセプト・略称の割り当て先はいずれも記載対象外とする
> (秘匿ルール 2026-07-27)。 正本は Concordia の `/projects`
> (`GET /v1/project-codes`) を引くこと。

---

## 3. 追加チーム (neco 了承済・目的は仮置き)

neco の指示に含まれていなかったチーム。目的が未指定のものは各リポの README から
仮置きした。**(仮)** が付いた項目は neco の確定待ちで、付いていないものは
既存の正本ドキュメントから確定済み。

| # | チーム / Code | 目的 | コンセプト | 優先度 | 技術スタック |
|---|---|---|---|---|---|
| 5 | **SUPERFAT** `SUPERFAT` | (仮) Pictor native のテックデモ・SLG ジャンル検証 | 草をはやそう — Plague.inc 系「逆侵略」SLG。宇宙人が地球の幸福度を管理し人類を**ほどほどに**間引く | 中 (仮) | C++ / Pictor native |
| 6 | **Ludellus** `Lw`/`Ln`/`Lo`/`Ll` | 知育 (幼少向け学習体験) + 入力動態の学習分析 | マスコット「うに」と遊ぶ知育ゲーム群 (けいさん / おかいもの等の MR あそび)。教育内容を保ったまま入力・ルール・参加者で体験を変える | 別枠 (知育) | Electron + PWA (Web) / C++ Vulkan (Native) / Hono (Server) |

Ludellus は 4 リポ体制 (Core = 概念正本、Web / Native = 媒体、Server = データ正本) を 1 チームとして扱う。

> **UniLand は別チームにしない**: UniLand は Ludellus の**旧名**
> ([REPO-CLASSIFICATION-BY-PURPOSE.md](./REPO-CLASSIFICATION-BY-PURPOSE.md) の
> 「Ludellus (旧 UniLand)」、および `service-map.json` の Ludellus エントリ
> `"role": "知育アプリ (旧 UniLand、マスコット「うに」)"` を参照)。
> 別チームとして数えると同一リポを二重計上することになるため、Ludellus に統合した。
> なお略称 `Ul` は PROJECT-CODES.md では UniLand、`service-map.json` では Ludellus に
> 割り当てられており不整合がある。正本の統一は別 PR で行う。

---

## 4. 優先順 (2026-08-22 時点)

1. 未公開ゲーム A — 資金調達・移植検証
2. AdventureCube / SUPERFAT — Pictor / Ergo テックデモ
3. Pagus — AI/LLM 研究
4. 未公開ゲーム B — 学生サンプル

- Ludellus — 知育枠として別ライン (優先順の比較対象にしない)

---

## 5. 整理対象外 (記録のみ)

| リポ | 位置付け |
|---|---|
| Project-September | Unity Fusion 公開ゲーム (外部 org、anti-pattern 検証台) |
| PrivateGame `KS` | 外部 org の試験アプリ。PROJECT-CODES.md の `KS` はこのリポを指す |
| AR-Menco (AR-Hockey) | プロジェクタ投影 Unity (コード未登録) |
| Ludus `Lu` | ゲームではなく game-lexicon / game-template (分類基盤) |
