---
slug: css-center
date: 20170812
tags: []
title: "<del>茴字</del>元素居中有多少种写法"
---



{% asset_img kongyiji.jpg %}

## 水平居中

### 水平居中: 行内元素

<!--more-->

- 在其父节点上应用`text-align: center`

    <p data-height="269" data-theme-id="0" data-slug-hash="dRMxbo" data-default-tab="result" data-user="icymind" data-embed-version="2" data-pen-title="centering inline element horizontally" class="codepen">See the Pen <a href="https://codepen.io/icymind/pen/dRMxbo/">center</a> by icymind (<a href="https://codepen.io/icymind">@icymind</a>) on <a href="https://codepen.io">CodePen</a>.</p>
    <script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### 水平居中: 块级元素

- 单个块级元素居中:

    令该节点左右margin为auto

    <p data-height="265" data-theme-id="0" data-slug-hash="jwrOEM" data-default-tab="result" data-user="icymind" data-embed-version="2" data-pen-title="centering single block element horizontally" class="codepen">See the Pen <a href="https://codepen.io/icymind/pen/jwrOEM/">centering single block element horizontally</a> by icymind (<a href="https://codepen.io/icymind">@icymind</a>) on <a href="https://codepen.io">CodePen</a>.</p>
    <script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

- 多个块级元素居中:
    - 把这几个元素变成inline-block, 然后在它们的父节点上应用`text-align:center`. 由于块级元素当成行内元素来显示, 因此如果他们之间有空格或者回车的话, 最终他们渲染出来就有了一些间隔, 如以下的前三个方块所示. 如果删去他们之间的回车, 则结果如中间的三个方块所示. 还有很多方法除去前三个方块间的间隙, 可参考[Fighting the Space Between Inline Block Elements](https://css-tricks.com/fighting-the-space-between-inline-block-elements/)

    - 或者在他们的父节点上应用:
        ```css
        .parent {
            display: flex;
            justify-content: center;
        }
        ```

    <p data-height="665" data-theme-id="0" data-slug-hash="MoegZb" data-default-tab="result" data-user="icymind" data-embed-version="2" data-pen-title="centering multiple block element horizontally with display" class="codepen">See the Pen <a href="https://codepen.io/icymind/pen/MoegZb/">centering multiple block element horizontally with display</a> by icymind (<a href="https://codepen.io/icymind">@icymind</a>) on <a href="https://codepen.io">CodePen</a>.</p>
    <script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## 垂直居中
首先, 垂直居中要求父节点有高度, 不然"居中"就没必要了.  
其次, 要求居中的元素要比父节点小.

### 垂直居中: 行内元素

- 如果要居中的内容只有一行:
    - 把父节点上下padding相等且分别占高度的一半, 让它高度变成0. **这个方法改变了原有的高度**. 请看代码示例的图1和图2的高度差.
    - 在父节点上把line-height设为和高度相等

    <p data-height="718" data-theme-id="0" data-slug-hash="owLNOv" data-default-tab="css,result" data-user="icymind" data-embed-version="2" data-pen-title="centering inline element vertical" class="codepen">See the Pen <a href="https://codepen.io/icymind/pen/owLNOv/">centering inline element vertical</a> by icymind (<a href="https://codepen.io/icymind">@icymind</a>) on <a href="https://codepen.io">CodePen</a>.</p>
    <script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

- 如果内容有多行:
    - 和只有一行时一样, 可以把父节点的padding设置为相等且分别为高度的一半. **这个方法会使原有高度变大, 需要调整padding值**
    - 用flex
    - 父元素应用`display: table`, 待居中元素应用`display:table-cell; vertical-align: middle`
    - 用幽灵元素, 通过`::before`伪元素添加一个100%的inline-block, 然后将伪元素和待居中元素的对齐方式设置为`vertical-align: middle`. 因为增加了一个伪元素, 用去了一点点宽度, 因此需要调整待居中元素的宽度, 否则会内容会被移动到父元素外显示, 而且要调整margin-left值, 让它向左移动一点点.

    <p data-height="1196" data-theme-id="0" data-slug-hash="KqMpdO" data-default-tab="css,result" data-user="icymind" data-embed-version="2" data-pen-title="centering multiline inline element vertical" class="codepen">See the Pen <a href="https://codepen.io/icymind/pen/KqMpdO/">centering multiline inline element vertical</a> by icymind (<a href="https://codepen.io/icymind">@icymind</a>) on <a href="https://codepen.io">CodePen</a>.</p>
    <script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### 垂直居中: 块级元素

- flex
- 需要居中的元素高度确定: 父元素设置为relative定位, 待居中元素设置为absolute定位, 定位点在`left:50%`处, 最后应用margin-top为元素高度一半的负值把元素上提.
- 需要居中的元素高度不确定: 定位的设置和高度确定时的情形一样. 但是没法用margin-top把元素上提, 只能用`transform: translateY(-50%)`

<p data-height="679" data-theme-id="0" data-slug-hash="OgXWXP" data-default-tab="css,result" data-user="icymind" data-embed-version="2" data-pen-title="centering multiple block element vertically" class="codepen">See the Pen <a href="https://codepen.io/icymind/pen/OgXWXP/">centering multiple block element vertically</a> by icymind (<a href="https://codepen.io/icymind">@icymind</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## 双向居中

- Absolute Centering. 把待居中元素设置为`display: absolute`, 使其脱离正常流. 在正常流里`margin-top/bottom: auto` auto会被当成0. 但是在绝对定位里, auto则会使得上下margin平分除内容外的剩余高度, 就像水平居中一样. 为了让待居中元素在父元素中充分布局, 还需要设置top, left, right, bottom为0. 如果要居中多个元素, 那么要外包一层并且显式确定尺寸. 将外层声明为`display:inline-block`并不能使其恰好包裹里层元素. 原因可能跟`display`属性有关.
- flex
- 需要居中的元素高度确定
- 需要居中的元素高度不确定

<p data-height="681" data-theme-id="0" data-slug-hash="eRzgyM" data-default-tab="result" data-user="icymind" data-embed-version="2" data-pen-title="centering multiple block element vertically && horizontally" class="codepen">See the Pen <a href="https://codepen.io/icymind/pen/eRzgyM/">centering multiple block element vertically && horizontally</a> by icymind (<a href="https://codepen.io/icymind">@icymind</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>


参考链接:

[Absolute Centering in CSS](https://codepen.io/shshaw/details/gEiDt)

