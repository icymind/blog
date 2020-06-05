---
slug: glyphs-versus-content-area
date: 2017-10-13
tags: ["css"]
title: "glyphs VS content-area"
---



CSS权威指南"基本视觉格式化"一章中讲到:
对于行内非替换元素或者匿名文本来说, font-size指定了它们的content area的高度, 由于inline box是由content area加上上下的half-leading构成的, 那么如果元素的leading为0, 在这种情况下, font-size指定了inline box的高度.

```html
<div style="background-color: teal;">
  <span style="font-size: 80px; line-height: 1em; background-color:grey; opacity: 0.7; padding: 0">Lorem maiores atgfyq.</span>
</div>
```

以上的例子, font-size和line-height都设置为80px, 按理说span的inline box就是80px.

但是从开发者工具看, 拥有绿色背景的div的高度才是80px, 不懂为什么span的高度要比80px大呢?

{% asset_img lineheight-issue.jpg %}

<!--more-->

首先, 文字的灰色背景色指示了 span 元素的 content area 的高度. 于是问题转化为:

为什么行内元素的 content area 的高度不等于 font-size 指定的高度呢?

先说答案: 因为 font-size 指定的时字体 em box 的大小. 而 content area 并不一定采用 em box 作为高度.

简单的说, font-size 指定的是字体的 em-square 的高度, em-square 也就是该字体 "M" 的外围的一个框. 除了 em-square, 还有 baseline 的概念, baseline 到顶部的距离为 ascender, baseline 到底部的距离为 descender. 比如 Catamaran 字体:

{% asset_img em-square.png %}


css2.1 规范里写道:

>"the height of the content area should be based on the font, but this specification does not specify how. A user agent may ... use the em box or the maximum ascender and descender of the font."

这句话说明:

1. 如果一个浏览器采用 em box 作为 content area 的高度, 那么 font-size 就是实打实的 content area 高度.
2. 如果采用的是最高的 ascender 和最矮的 descender 的距离作为 content-area 的高度, 那么 content area 就会比 font-size 大/小. 如果某个字体 ascender + descender 的和超出 em-square 的高度很多, 那么它显示出来一定会比 font-size 大很多很多, 比如 zapfino 字体:

{% asset_img zapfino.jpg %}


回到最初的问题, 正是因为浏览器采用的第2种方案, 导致了虽然 em box 和 line-height 都是 80px, 但是 content area 要比 80px 大, 字体的灰色背景指示了 content area, 结果就是灰色背景会超出绿色背景了.

如果想让绘制出来的字体是80px高, 使得它不超出绿色背景. 有两种方案:

1. 放弃用 line-height 指定高度, 用 height, 但是前提是要把 span 的 display 值改为 block/inline-block.
2. 把 font-size 改小一点.

再来思考另一个问题: 把行高设置为 1em 能避免多行文本的重叠吗?

```html
<p style="font-size: 80px; line-height: 1em">
	<span style="background-color: red">Lorem ipsum dolor.</span>
	<br>
	<span style="background-color: yellow; opacity: 0.5">Lorem ipsum dolor.</span>
	<br>
	<span style="background-color: lightblue; opacity: 0.5">Lorem ipsum dolor.</span>	
</p>
```

以上内容会渲染成什么样子呢?

没错, 设置行高为 1em 并不能保证各行的文字不发生重叠. 渲染的结果:

{% asset_img overlap.jpg %}

为什么会这样? 如果把 line box 的高度画出来, 大概就清楚了:

{% asset_img overlap2.jpg %}


参考:

[iamvdo](http://iamvdo.me/en/blog/css-font-metrics-line-height-and-vertical-align)

