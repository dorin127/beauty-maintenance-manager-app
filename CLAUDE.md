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

- **`generateSeriesPlans(input, seriesId?)`**: 初回日付から12ヶ月先まで繰り返し計画を生成。同一シリーズは共通の `series_id` を持つ。`interval_months=0` の場合は1件のみ生成。
- **`calcNextWeekdayAligned(base, months)`**: 同じ曜日・月内ポジション（第N○曜日）を維持しながら指定月数後の日付を算出。ドリフト防止のため常に初回日から再計算する。
- **禁忌チェック（`MaintenanceForm`）**: スケジュール登録時に `maintenance_menus.cautions[]` を参照し、前後の期間内に相性の悪い施術がある場合に警告を表示。ユーザーが同意した場合のみ保存できる。

## DB 構成

- **`maintenance_menus`**: メニューマスタ。`cautions JSONB[]`（`{menu_name, wait_months, reason}`）で施術後の禁忌設定を管理。`prohibited_with TEXT[]` 列はDB上に残っているがアプリからは未使用。
- **`maintenance_plans`**: 計画レコード。`status` は `planned` / `reserved` / `completed` / `skipped`。`body_part`・`units`・`amount`・`clinic_id` を保持。
- `series_id` で繰り返しシリーズを紐付け。実施完了時は以降の計画を削除し再生成する。

## 将来の拡張

- Google Calendar 連携（`planned_date` → Google Event）
- 同日禁止（`prohibited_with`）の管理UI（現在はDB直接編集のみ）
