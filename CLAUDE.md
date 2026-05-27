# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**美容メンテ マネージャーアプリ** — ユーザーが美容に関するメンテナンス（スキンケア、ヘアケア、ネイルなど）の記録・管理・リマインダーを行うためのWebアプリ。

## 技術スタック

- **HTML / CSS / JavaScript**（バニラ、フレームワーク・ライブラリなし）
- バックエンドなし。データは `localStorage` で永続化する想定。

## 開発の進め方

ブラウザで直接 `index.html` を開いて動作確認する（ビルドステップ不要）。

ライブリロードが必要な場合は VS Code の **Live Server** 拡張を使う。

## アーキテクチャ方針

- 単一ページアプリ（SPA ライク）として構成し、画面切り替えは DOM の表示/非表示で制御する。
- JS はモジュール分割（`<script type="module">`）を使い、機能ごとにファイルを分ける。
- スタイルはカスタムプロパティ（CSS変数）でテーマカラーを管理する。
- データモデル（メンテ記録、カテゴリ、リマインダーなど）は `localStorage` の読み書きを担う専用モジュールに集約する。
