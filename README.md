# 数学キーボード

iPhone Safari向けの個人用数式エディタ。MathLive 0.109.2（MIT）を同梱し、APIキー・有料サービス・ビルド処理なしで動作します。

## 使い方

- 数式の編集したい位置をタップし、下のキーボードで入力します。
- 「数式」タブの指数・分数・根号・積分・総和は編集可能な空欄を挿入します。空欄にも分数などを挿入できます。
- 上下限・分子・分母・指数は直接タップ、矢印、「次の空欄」で移動します。空欄の巡回順はMathLiveに従います。
- 数字、英大小文字、数学記号、集合・論理記号をタブで切り替えます。
- 「LaTeXコピー」で式をコピーします。権限などでコピーできない場合はLaTeX欄を長押ししてコピーできます。
- 全消去直後の「元に戻す」は消去前の式を復元します。式は再読み込みすると消えます。

## GitHub Pages

Settings → Pages → Deploy from a branch → main / (root) を指定します。HTML/CSS/JSと `vendor/` をまとめて公開してください。相対パスのため `/math-tool/` 配下でも動作します。公開時にCDNやAPIへの接続は不要です。初回アクセスには通信が必要です（オフライン再訪の保証はありません）。

## テスト

別の作業ディレクトリに `npm install @playwright/test` し、リポジトリ直下で `python3 -m http.server 8000` を起動後、以下を実行します。

```sh
NODE_PATH=/path/to/node_modules node tests/editor.cjs
```

Chromiumの実行パスは `CHROMIUM_PATH` で指定可能です。結果・制約は [TESTING.md](TESTING.md) を参照してください。

ライブラリとフォントのライセンス: [vendor/LICENSE-mathlive.txt](vendor/LICENSE-mathlive.txt)
