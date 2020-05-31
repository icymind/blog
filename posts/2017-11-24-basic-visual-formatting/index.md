+++
title = "Basic Visual Formatting"
tags = ["css"]
+++

最近看了看CSS, 看到CSS权威指南第三版已经是十年前出版的了,相比CSS3的内容不会有多少, 于是去搜了一下, 第四版正在出, O社已经有了Early版的PDF卖了, 其实我不想买的, 贵得要死. 奈何搜了半天都找不到哪里有下载, 只好买了一本. 不过还好找了个优惠券, 折价50%. 以下是"基本视觉可视化"一章的读书笔记.

视觉可视化模型是CSS用来处理文档并将文档显示在视觉媒体上的机制. 视觉可视化模型根据CSS盒模型为文档的每个元素生成0, 1或者多个盒子. 然后将这些盒子根据若干规则显示出来.

<!--more-->

## Basic Boxes

- 常规流/Nonreplaced element/Replaced element/Root element/Inline box/Inline-block box
- The Containning Block

    Every element’s box is laid out with respect to its containing block; in a very real way, the containing block is the “layout context” for a box.
    [CSS规范](https://www.w3.org/TR/CSS2/visudet.html#containing-block-details) 对Containning Block是这么定义的:

The position and size of an element's box(es) are sometimes calculated relative to a certain rectangle, called the containing block of the element. The containing block of an element is defined as follows:

1. The containing block in which the root element lives is a rectangle called the initial containing block. For continuous media, it has the dimensions of the viewport and is anchored at the canvas origin; it is the page area for paged media. The 'direction' property of the initial containing block is the same as for the root element.
2. For other elements, if the element's position is 'relative' or 'static', the containing block is formed by the content edge of the nearest block container ancestor box.
3. If the element has 'position: fixed', the containing block is established by the viewport in the case of continuous media or the page area in the case of paged media.
4. If the element has 'position: absolute', the containing block is established by the nearest ancestor with a 'position' of 'absolute', 'relative' or 'fixed', in the following way:
    1. In the case that the ancestor is an inline element, the containing block is the bounding box around the padding boxes of the first and the last inline boxes generated for that element. In CSS 2.1, if the inline element is split across multiple lines, the containing block is undefined.
    2. Otherwise, the containing block is formed by the padding edge of the ancestor.
    3. If there is no such ancestor, the containing block is the initial containing block.

对于常规流里的元素来说, 它的CB就是它最近的block contrainer祖先的box.


像以下这种结构, img的CB是div盒子的内容区.

    ```html
    <div>
        <img src="demo.jpg" alt="">
    </div>
    ```

## Block-Level Elements

### 水平格式化

- box-sizing
- 七大金刚
    {% asset_img seven-properties.jpg %}
    左右margin, 左右border, 左右padding, 元素width

    七大金刚的值, 加起来必须等于它的Containing box的宽度. 通常情况下, CB的宽度也就是父节点的width属性. 七大金刚只有三个(width, margin-left, margin-right)才能设置为auto, 其他值要么默认0, 要么是指定的数值.
- 三大金刚的auto值
    - 三大金刚都设置了明确的值, 那么margin-right会被重置为auto.
    - 如果某个值被设置为auto

        那么可视化模型将根据"当前元素盒子的宽度等于CB的宽度"来计算出auto的值.

    - 如果有多个auto值

        - 左右margin设置为auto, width明确值: 那么左右margin会平分剩下的宽度, 达到一种居中的效果
        - margin之一和width设置为auto: 设置为auto的margin重置为0, width占满剩下的宽度
        - 三个都设置为auto: width则占满整个CB的宽度

- 七大金刚的负值

    七大金刚, 只有margin才能是负值. 当为负值是规则不变, 七大金刚加起来等于CB的宽度就行.

- 百分比的值

    除了border, 其他都可以设置为百分比的值. 计算的规则不变.

- 块级 Replaced Element 的水平格式化

    如果你把上面的规则套到一个div里的display属性为block的img去, 你会发现好像不是那么一回事. 按照规则如果三大金刚都设置为auto, 那么margin被重置为0, width就会占满CB剩下的宽度. 但对于img和其他Replaced Element来说, 如果width设置为auto, 那么auto会被计算为元素的固有宽度. 而且如果高度没做指定的话, 会做相应的调整以满足元素原有的长宽比.

### 垂直格式化

- block的高度比内容所需高度大/小

    如果高度比内容矮, 那么CSS可视化模型会根据overflow属性来决定怎么显示该元素.
- 垂直方向也有七大金刚

    和水平方向的一样, 七大金刚加起来要等于CB的高度. 且只有三大金刚才能设置为auto值. 区别在于, 如果margin设置为auto, 那么它会重置为0. 这就导致了垂直居中没有水平居中那么容易实现.

- 百分比

    如果height设置为百分比, 那么它指的是CB高度的百分比, 如果CB没有明确高度, 那么设置为百分比值得height会被重置为auto. **如果margin-top/bottom设置为百分比, 那么它指的是CB宽度的百分比. 这点容易掉坑里**

- auto height

    如果块级元素的height设置为auto, 那么它的高度就正好是能包裹住它的子元素, 这点和水平方向也不一样, 水平方向的width会尽量占满CB的宽度. height为auto还细分为两种情况:

    - 该元素没有设置任何padding或者border

        那么height会被计算为第一个子元素的border-top到最后一个子元素的border-bottom. 即**不包含子元素的margin**, 这称之为"垂直外边距合并"

    - 该元素设置了某个padding或者border

        那么height会把对应方向的子元素的margin算进来. 如果设置了padding-top/border-top, 就算进第一个元素的margin, 以此类推.
    
    - 但是不对啊, 为什么div里包裹一个img, div总是要比img的底部要矮一点呢? 这跟inline element的摆放有关, 看完行内可视化就明白了.

- Collapsing Vertical Margins

    合并只应用于margin, 没padding和border什么事.

- 负margin的合并

    - 如果两个都是负值, 那么合并的结果取绝对值大的那个负值.
    - 如果是一正一负, 那么合并的结果是两者的和.
    - 如果有多个值, 那么用绝对值最大的负值, 再加上所有正值即可.
    - 如果某个元素的margin-top/bottom为负值, 那么所有跟在它后面的元素都会被上提相应的值.

### 特殊的block element: list items

列表项有个符号, 视觉模型根据`list-style-position`属性来决定是否将符号放入到元素的content区域.

且不论这个属性是inside还是outside值, 列表符号和内容之间都有一个固定的间隔, 这个间隔无法通过css规则进行改写.

## Inline Elements

### 行布局

了解视觉格式化模型怎么处理块级元素后, 我们来看看行内元素. 最简单的情况下, 格式化模型会根据容器的宽度来对行内元素断行, 使得各部分能适应容器的宽度正好放下. 不过, 行内格式化模型远没那么简单.

### 术语和概念

- Anonymous text: 没有含在行内元素里的文本.
- Em box

    也称为character box, 就是包含一个字符的框. 这在字体里定义. 实际的字形可能比em box更高或者更矮. 观察下图字母上下的空白, 它们既不是paddking, 也不是margin, 而是em box的一部分.

    {% asset_img embox.jpg %}

- Content Area

    所有的Em box串在一起就成了Content Area. 对于可替换元素来说, CA是元素的固有高度+padding+border+margin

- Leading

    这是行高和字体大小的差, 分为上下两部分. leading只应用在nonreplaced element上.

- Inline box

    Content Area + Leading的部分就是行内框, 也就是等于行高. 对于replaced elements来说, 就是content area.

    {% asset_img inlinebox.jpg %}

- Line box

    一行内的Inline box可能有高有低. Line box是这么一个框, 它的下边沿在最低的Inline box的下边沿下方, 它的上边沿在最高的上边沿的上方.

    如下图, 一个段落共有三行, 也就有三个line box.

    - 其中前两行每行都有3个inline box, 分别是首尾各一个匿名文本框, 中间一个\<em>/\<strong>框
    - 第二行的line box比其他行要高一点, 因为这行的行框低点在匿名框的下沿, 高点在strong框的上沿. 虽然该行3个inline box高度都一样, 都是12px. 但是因为一些后面会提到的原因,, strong的inline box在垂直位置上比其他两个匿名框要高一点. 结果就是整个line box要高一点.

    ```html
    <p style="font-size: 12px; line-height: 12px;">
        This is text,
        <em>some of which is emphasized</em>,
        plus other text
        <br>
        which is
        <strong style="font-size: 24px;">strongly emphasized</strong>
        and which is
        <br>
         larger than the surrounding text.
    </p>
    ```
    {% asset_img linebox.jpg %}

CSS 还有一组行为:

- 行内元素的背景色应用到内容区+padding
- 行内元素的border包围内容区+padding
- 行内不可替换元素的padding, border, margin没有垂直效果. 也就是不会改变它的inline box的高度, 也就是不会把其他行往垂直方向推开.
- 行内可替换元素的Content Area包含了padding, margin, border, 因此他们会影响到它的inline box的高度. 进而影响到它所在行的line box高度.

视觉格式化模型通过以下步骤确定当前行中各元素inline box的高度:

1. 通过font-size和line-height得到非可替换元素的em box+leadding.
2. 通过垂直方向的七大金刚的值, 得到可替换元素的inline box.
3. 确定非可替换元素的内容区各自超出基线多少. 另外还把可替换元素的底边放在整行的基线上.
4. 根据vertical-align对inline box进行调整.
5. inline box摆放完毕, 得到line box.

### 行内格式化

所有的元素都有line-height属性. 但是这个属性不会直接影响块级元素. 只会对行内元素, 或者块级元素内的行内元素有影响.

CSS规范这么说: 在块级元素上声明line-height会为该块级元素的内容设置一个最小行框高度. (为什么是最小? 因为没有什么办法可以减少行高了, 不可替换元素的padding, margin在垂直方向上没效果. 在可替换元素上设定负margin可以减少行高吗?)

### 行内Nonreplaced Elements

- Building the Boxes

    对于一个非替换元素或者匿名文本来说, font-size决定了content area的高度.

    但好像不是那么一回事, 比如以下的情况:
    ```html
    <div>
        <span>Lorem maiores atgfyq.</span>
    </div>
    ```
    ```css
    div {
      background-color: teal;
    }
    span {
        font-size: 80px;
        line-height: 1em;
        padding: 0;
        margin: 0;
        background-color: grey;
        opacity: 0.7;
    }
    ```

    得到的结果却是下图.
    {% asset_img lineheight-issue.jpg %}

    原因在另一篇[wiki](glyphs-versus-content-area). 应该说font-size决定的不是content area的高度, 而是em box的高度.

    思考以下代码是如何被渲染的:

    ```html
    <p style="font-size: 12px; line-height: 12px;"> This is text, <em>some of which is emphasized</em>, plus other text<br> which is <strong style="font-size: 24px;">strongly emphasized</strong> and which is<br> larger than the surrounding text.
    </p>
    ```

    现在只考虑第二行, 其他行都依次类推.

    - 处理匿名框`which is`

        从font-size得到它em box的高度, 进而从他的字体的设计情况得到它的content area(Times字体的话, CA是12pxx1.15). 因为line-height等于font-size, 所以该匿名框没有half-leading. 于是得到该框的inline box的高度, 宽度则根据字体宽度得到. inline box生成.

    - 处理strong元素

        从font-size得到他的em box的高度, 算出content area(Times的话, CA是24pxx1.15 = 27.6), 因为line-height只有12px, 因此要从content area上下各减去(27.6-12)/2 = 7.8的高度. 得到了inline box, 把它靠在匿名框右边放置. 由于默认vertical-align的值是baseline, 所以该inline box对准匿名框的baseline放置, (结果就是该inline box上提了一点点)

    - 接着同第一步, 处理接下来的匿名框.
    - 所有inline box处理完, 得到line box. 它的高度从strong元素的inline box的上沿到匿名框inline box的下沿. 视觉上的结果是这个line box比第一行第三行都要高.

    {% asset_img inline-boxes-within-a-line.jpg %}
    {% asset_img line-boxes-within-a-p.jpg %}

- Vertical Alignment

    默认情况下, 一行内的inline box对其方式是baseline, 结果是所有字体的baseline都在同一条水平线上. 一个经典的现象如下:

    ```html
    <div style="background-color: teal">
        <img src="demo.jpg" style="width: 100px; border: 1px solid red">
    </div>
    ```
    {% asset_img vertical-align-2.jpg %}

    只所以img底下有一丝缝隙, 是因为baseline. 除了baseline, 还有其他对其方式如下图:

    {% asset_img vertical-align.png %}

- Managing the line-height

可以在css里利用`line-height: 1em`来避免行与行之间的文字重叠到一起. 但是一般情况下, 由于字体çem box和它的字形并不等高, 因此1em的line-height其实没那么管用, 最好还是设置1.2左右, 极端字体会去到3.1. 参考[博文](http://iamvdo.me/en/blog/css-font-metrics-line-height-and-vertical-align)

- Scaling the line-height

    设置line-height时, 最好不要带单位(即`line-height: 1.2`比`line-height:1.2em`更好). 原因在于这个数会成为缩放因子, 该因子会成为继承值而不是计算值.

    ```html
    <div style="font-size: 100px; line-height: 2em">
        <span style="font-size: 50px">Hello world</span>
    </div>
    <div style="font-size: 100px; line-height: 2">
        <span style="font-size: 50px">Hello world</span>
    </div>
    ```

    以上的例子, 第一个line-height是计算值, 即先计算出数值再被子元素继承. 结果是第一个span的line-height是2xdiv的font-size=200px;.
    而第二个line-height是继承值, 即span的高度是2xspan的font-size= 100px;

- Adding Box Properties

    - 行内非替换元素可以应用padding, border以及margin. 但是这些属性都不会影响到inline box的高度, 下图中的大字有padding, 但是padding没有增加inline box的高度, 因此不会把上下两行的字给推开.

        {% asset_img padding-of-inline.jpg %}

        同时我也发现了一个有趣的现象, 上图灰色背景的透明度是1, 结果第三行的字体渲染在了padding之上. 下图我把背景透明度降到1以下, 第三行的字体就跑到padding之下了.

        {% asset_img padding-of-inline-2.jpg %}

    - border包围住的是content area+padding, 而不是包住inline box
    - margin-top/bottom没有影响, 但是margin-left/right会应用到一个元素的首尾. 中间断开的部分不会有margin-left/right的效果

        {% asset_img margin-of-inline.jpg %}

- Changing Breaking Behavior

    上一节讲到margin不会应用到一行中折行的中间部分, 是基于box-decoration-break是默认的值`slice`的前提下说的. 如果设置为`clone`, 情况就如下图的第二段所示(除了观察margin, 还需注意背景图的改变):

    {% asset_img margin-of-inline-2.jpg %}

- Glyphs Versus Content Area

    参加另一篇[wiki](glyphs-versus-content-area)

### 行内Inline Replaced Elements

- Adding Box Properties
- Replaced Elements and the Baseline

### Altering Element Display

第四版的权威指南把这节给打散了, 结构性其实还没有第三版那么好.

- Changing Roles
- Inline-Block Elements
- Run-in Elements

疑问: 什么在div上设置line-height为内部图片的高度, div的高度不等于line-height?

