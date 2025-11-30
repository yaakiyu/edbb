# 開発ガイド

このドキュメントは、リポジトリ全体 (`easy-bdc-forked`) を対象にした開発者向けの手順と注意点をまとめたものです。

**主なファイル構成**（抜粋）

- `index.html` - フロントエンドのエントリページ（Blockly + UI）
- `script.js` - Blockly ワークスペース設定や UI ロジック
- `blocks.js` - カスタム Blockly ブロック定義（Bot ロジック用ブロック）
- `index.ts` - Cloudflare Worker の簡易ハンドラ（デプロイ用）
- `wrangler.jsonc` - Workers 設定
- `README.md`, `LICENSE` - プロジェクト説明とライセンス

## 前提環境

- Git と任意のエディタ
- （静的サーバで動作させる場合）Python 3 または Node.js（`http-server` など）
- （Cloudflare Workers にデプロイする場合）[Wrangler](https://developers.cloudflare.com/workers/cli-wrangler/)（`wrangler` CLI）
  - workersの設定ではwrangler.dev.tomlを使用するようにしてください。現在のwrangler.tomlから内容をコピーし、workers kvのIDを書き換える必要があります。

## 開発フローの基本

開発は必ず静的サーバで動作させながら行ってください。  
CORF エラーで読み込みがうまく行かないことがあります。

- UI の調整: `index.html` / `style.css` / `script.js`
- ブロック追加・変更: `blocks.js`（ブロック定義）
- カスタムコード生成（Python など）: Blockly の generator 関連の実装を確認・追加

変更を行ったらブラウザをリロードして動作を確認してください。

また、prettier での整形も行ってください。

## 新しいブロックを追加する手順（サンプル）

1. `blocks.js` にブロック定義を追加します。既存の `Blockly.Blocks['...']` の書き方に倣ってください。

2. （必要なら）Blockly のコード生成ロジックを追加します。Python 出力を使う場合は `Blockly.Python['your_block'] = function(block) { ... }` のように定義します。

3. ブラウザでページをリロードして、新しいブロックがツールボックスに表示され、生成コードが期待通りであることを確認します。

ヒント:

- ブロックは「見た目（blocks.js）」と「コード生成（Blockly.Python / 他）」の両方を用意する必要があります。
- 既存ブロックを参考にすれば導入が簡単です。

## 永続化とワークスペース

`script.js` 内で `STORAGE_KEY` のようなキーを使ってワークスペース状態を保存しています。ブラウザの `localStorage` を使う設計になっているため、保存・復元ロジックを変更する場合は `script.js` を編集してください。

## 貢献方法

- Fork & PR のフローを推奨します。
- 変更内容は小さめに分け、動作確認手順を PR に明記してください。

## ライセンス

このプロジェクトは `LICENSE` に記載の通り MIT ライセンスで配布されています。
