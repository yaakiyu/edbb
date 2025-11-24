# Easy Discord Bot Builder (EDBB)

![Discord](https://badgen.net/discord/members/CmEGugrsje)  
![MIT](https://badgen.net/static/license/MIT/blue)  
Easy Discord Bot Builder は、ブラウザ上でブロックを組み合わせて、誰でも簡単に Discord Bot を作成できるビジュアルプログラミングツールです。

## 🚀 概要

プログラミングの専門知識がなくても、パズルのようにブロックを繋ぎ合わせるだけで Bot のロジックを構築できます。
作成した bot は Python コード (`discord.py`) として出力されるため、そのままご自身の環境で実行したり、学習用途に活用したりすることができます。

## ✨ 特徴

- **ビジュアルプログラミング**: 直感的なドラッグ＆ドロップ操作で開発可能。
- **豊富な機能ブロック**:
  - メッセージ受信時の応答
  - スラッシュコマンド (`/command`) の作成
  - 埋め込みメッセージ (Embed) の作成
  - プレフィックスコマンド (`!ping` など)
  - その他多数機能を搭載
- **Python コード生成**: 業界標準のライブラリに対応したコードを自動生成。
- **モダンな UI**: Tailwind CSS による洗練されたデザインと、ダークモード対応。
- **拡張性**: 任意の Python コードを直接記述できるブロックも搭載。

## 🛠️ 使い方

1. **ロジックを組む**: 左側のメニューからブロックを選び、ワークスペースに配置します。
2. **イベントを設定**: 「Bot が起動したとき」や「メッセージを受信したとき」などのイベントブロックを配置し、その中に処理ブロックを繋げます。
3. **コードを確認**: 生成された Python コードを確認・コピーします。
4. **Bot を動かす**: コピーしたコードを Python 環境で実行し、Discord Bot として動作させます。

### 技術スタック

- **Frontend**: HTML, JavaScript, CSS (Tailwind CSS)
- **Core Library**: [Google Blockly](https://developers.google.com/blockly)
- **Icons**: [Lucide](https://lucide.dev/)
- **Hosting**: Cloudflare Workers / Pages

### ローカルでの実行

リポジトリをクローンし、`index.html` をブラウザで開くだけで基本的な機能を利用できます。

```bash
git clone https://github.com/yuz-mc/easy-bdc-forked.git
cd easy-bdc-forked
# index.html をブラウザで開く
```

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## 💻 貢献するためには?

1. 開発者に金を貢ぎましょう。ドメイン代って高いんですよ。
2. issue を送り付けましょう。仕事が増えます。
3. 開発に協力してみましょう。

ko-fiはこちら
https://ko-fi.com/himais0giiiin