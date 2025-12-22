# Local Development Guide

このプロジェクトはローカル環境（あなたのPC上）に保存されています。チャットの履歴が消えても、ファイルやセットアップは**消えません**。

## 起動方法

もしサーバーが停止した場合は、以下の手順で再開できます：

1. ターミナル（PowerShellなど）を開く
2. プロジェクトのフォルダに移動:
   ```powershell
   cd c:\Users\user\.gemini\antigravity\six-national-strategic
   ```
3. 下記コマンドを実行してサーバーを起動:
   ```powershell
   npm run dev
   ```
4. ブラウザで表示されたURL（例: http://localhost:5173/six-national-strategic/）を開く

## 環境について
- **Node.js**: `C:\Program Files\nodejs\` にインストール済みです。
- **Logo Files**: `public/logos/` に保存されています。
- **Source Code**: `src/` フォルダ内にあります。

## 最近の変更 (Visual Fixes)
- ロゴの修正（背景透過、キャノン・スカパーのSVG化、ソフトバンクの視認性向上など）完了済みです。
