# LUDIARS ゲームポートフォリオ — 目的・コンセプト・チーム

> これまで作ってきたゲームを 1 本ずつ「チーム」として整理する。
> 各ゲームは **コンセプト** (何を遊ばせるか) に加えて **目的** (なぜ作るか) を持ち、
> 優先度は目的によって変わる (資金調達 > テックデモ/検証 > 研究/サンプル)。
> **目的・優先度・チーム編成**の正本はこのファイル。
> 略称は [PROJECT-CODES.md](./PROJECT-CODES.md)、用途別分類は
> [REPO-CLASSIFICATION-BY-PURPOSE.md](./REPO-CLASSIFICATION-BY-PURPOSE.md) が正本。

最終更新: 2026-08-22 (neco 指示で初版)

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
| 2 | **KuzuSurvivors** (コード未登録) | 資金調達・実用的な Pictor / Ergo の移植検証 | V でサバイバーする (Unity 版 → Pictor/Ergo C++ 移植) | 高 | Unity (原版) / C++ Pictor / Ergo (移植) |
| 3 | **MakaiNui** (魔界ぬい、コード未登録) | 資金調達・AR | ポケ GO を魔界風にする (街で見つけた魔界ぬいを AR で家へ連れ帰る) | **高め (指定)** | Unity 6 / AR Foundation / ARKit / Sentis (iOS) |
| 4 | **Pagus** `Pa` | AI/LLM を使用したライバルピーク風ゲームの構築 | のんびり村を再現しよう (村人が自律行動 → 事件 → 裁判 → 教育/改変) | 中 | Web / TS / PixiJS / `claude -p` |
| 5 | **KonbiniDominant** (コード未登録) | テックデモ・学生開発サンプル用 | コンビニでインクリメンタルゲーム (架空都市 N-KXi を侵略) | 低〜中 | C++20 / Pictor / Ergo / Figmentum (DoD) |

> **コード未登録について**: KuzuSurvivors / MakaiNui / KonbiniDominant は
> [PROJECT-CODES.md](./PROJECT-CODES.md) に未登録。同ファイルの運用ルール
> 「新しい略称を追加するときは PR で本ファイルを更新する」に従い、別 PR で登録する。
> なお `KS` は PROJECT-CODES.md 上では **PrivateGame** に割り当て済みなので、
> KuzuSurvivors に流用しない (§5 参照)。

---

## 3. 追加チーム (neco 了承済・目的は仮置き)

neco の指示に含まれていなかったチーム。目的が未指定のものは各リポの README から
仮置きした。**(仮)** が付いた項目は neco の確定待ちで、付いていないものは
既存の正本ドキュメントから確定済み。

| # | チーム / Code | 目的 | コンセプト | 優先度 | 技術スタック |
|---|---|---|---|---|---|
| 6 | **SUPERFAT** `SUPERFAT` | (仮) Pictor native のテックデモ・SLG ジャンル検証 | 草をはやそう — Plague.inc 系「逆侵略」SLG。宇宙人が地球の幸福度を管理し人類を**ほどほどに**間引く | 中 (仮) | C++ / Pictor native |
| 7 | **Ludellus** `Lw`/`Ln`/`Lo`/`Ll` | 知育 (幼少向け学習体験) + 入力動態の学習分析 | マスコット「うに」と遊ぶ知育ゲーム群 (けいさん / おかいもの等の MR あそび)。教育内容を保ったまま入力・ルール・参加者で体験を変える | 別枠 (知育) | Electron + PWA (Web) / C++ Vulkan (Native) / Hono (Server) |

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

1. MakaiNui — 資金調達・AR (neco 指定で高め)
2. KuzuSurvivors — 資金調達・移植検証
3. AdventureCube / SUPERFAT — Pictor / Ergo テックデモ
4. Pagus — AI/LLM 研究
5. KonbiniDominant — 学生サンプル
- Ludellus — 知育枠として別ライン (優先順の比較対象にしない)

---

## 5. 整理対象外 (記録のみ)

| リポ | 位置付け |
|---|---|
| Project-September | Unity Fusion 公開ゲーム (外部 org、anti-pattern 検証台) |
| PrivateGame `KS` | ヴァンサバ風 (PrivateProject org、KuzuSurvivors の前身的試験アプリ)。PROJECT-CODES.md の `KS` はこのリポを指す |
| AR-Menco (AR-Hockey) | プロジェクタ投影 Unity (コード未登録) |
| Ludus `Lu` | ゲームではなく game-lexicon / game-template (分類基盤) |
