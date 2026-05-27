# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**美容メンテ マネージャー** — アラフィフ女性向けの美容メンテナンス計画・管理アプリ。ボトックス・ヒアルロン酸・ハイフなどのメンテナンスを入力すると、1年分の繰り返し計画を自動生成する。

## 技術スタック

- **Next.js** (App Router, TypeScript)
- **Supabase** (PostgreSQL)
- **Tailwind CSS v4** — `globals.css` の `@theme` ブロックで色/フォントを定義（`tailwind.config.ts` は存在しない）
- **Noto Sans JP** — `next/font/google` で `--font-noto-sans-jp` 変数として読み込み

## 開発コマンド

```bash
npm run dev      # 開発サーバー (http://localhost:3000)
npm run build    # ビルド
npm run lint     # ESLint
```

初回セットアップ: `.env.local.example` を `.env.local` にコピーし、SupabaseのURLとanon keyを設定する。

## 画面構成

| パス | 画面 | コンポーネント |
|------|------|---------------|
| `/monthly` | 月間カレンダー（デフォルト） | `MonthlyView` |
| `/annual` | 年間カレンダー | `AnnualView` |
| `/input` | メンテナンス計画の入力 | `MaintenanceForm` |

`/` は `/monthly` へリダイレクト。

## デザイントーン（湘南美容外科カラー）

`globals.css` の `@theme` ブロックで定義。Tailwindクラスとして使用可能：

| トークン | 値 | 用途 |
|---------|-----|------|
| `primary` | `#E4007F` | メインピンク（ボタン・見出し） |
| `primary-light` | `#FFE4F2` | 選択状態・背景 |
| `primary-dark` | `#B5005F` | ホバー状態 |
| `surface` | `#FFF5FA` | ページ背景 |
| `border-pink` | `#F0D0E8` | カード・入力枠のボーダー |

## ビジネスロジック (`src/lib/schedule.ts`)

- **`generateSeriesPlans(input, seriesId?)`**: 初回日付から12ヶ月先まで繰り返し計画を生成。同一シリーズは共通の `series_id` を持つ。
- **`calcNextDate(completedDate, intervalMonths)`**: 実施完了時に `completed_date + interval_months` で次の予定日を算出。将来計画の再計算に使用。
- **禁止処理警告**: `maintenance_menus.prohibited_with[]` に同日追加しようとしたメニューが含まれる場合に警告表示する（実装予定）。

## DB 構成 (`supabase/migrations/0001_initial_schema.sql`)

- `maintenance_menus`: メニューマスタ。シードデータに代表的な美容メニュー9件が含まれる。
- `maintenance_plans`: 計画レコード。`status` は `planned` / `completed` / `skipped`。
- `series_id` で繰り返しシリーズを紐付け。

## 将来の拡張

- Google Calendar 連携（`planned_date` → Google Event）
