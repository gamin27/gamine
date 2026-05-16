---
title: '極力JSを使わない縛りを、目次UIで諦めた話'
description: 'Popover APIでJSなしの目次UIを試しつつ、最終的には読む体験を優先して少しだけJavaScriptを使うことにした話。'
pubDate: 'May 16 2026'
tags: ['フロントエンド', 'UI設計', 'JavaScript', 'CSS']
---

## きっかけ

モバイルで目次を表示するとき、いつも記事の一番はじめに表示していたのですが、これ毎回邪魔だなって思ってました。何かいいUIにならないかなーと考えていたところ、ボタンを押して目次が左から出てくるUIにしようと思いました。

## popoverで実現するシンプルな実装

ここでpopoverの出番です。popoverを使えばUIの表示非表示をhtml, cssだけで表現できます。
表現したdemoが以下のリンクの通り。右下のボタンを押してみてください。

https://gamine.blog/demos/toc-popover/

仕組みはとてもシンプルです。

```html
<button popovertarget="toc-popover">目次アイコン</button>
<div id="toc-popover" popover>
	<nav>目次リンク</nav>
</div>
```

```css
#toc-popover {
	transform: translateX(-100%);
}
#toc-popover:popover-open {
	transform: translateX(0);
}
```

これでJSなしで表現できます。美しい...。

## popoverでは実現できなかった理想のUI

しかし、どうしても実装したいUIがありました。それが今実装されているモバイル限定の目次UIです。(PCの人は幅を狭めてみてね) ボタンを押すと記事が右にスライドして下から目次がひょっこり現れるUI。これがこのブログの静けさのあるイメージととてもマッチしているなと思いました。

でもこれはpopoverでは表現できません。popoverは前面にDOMを浮かせることが出来るだけです。
代替としてcheckboxとcssで表現はできるのですが、checkboxを外すときにどうしてもJSを必要とします。

## 思想 vs 体験：選んだのは「体験」

このブログサイトの思想はJSを極力なくし、シンプルな構造で構築するというもの。でも、どうしてもこのUIがいい...！ということで、モバイルの目次は今の実装になりました。

実装のシンプルさよりもブログを読む時の体験を優先した、というお話でした。
