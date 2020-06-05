---
slug: cross-platform-gui
date: 2018-06-10
tags: ["gui"]
title: "跨平台桌面应用的技术选择"
---



记录一些跨平台桌面应用可以使用的技术和框架


<!--more-->

- [electron](https://electronjs.org/)

优点是主进程可以突破浏览器的沙盒限制, 访问本地的文件系统. 除此之外, 还封装了一些系统的 API, 比如通知/托盘图标/电源事件, 也有成熟的自动升级机制.

最大的缺点, 现代版的 flash ([檄文](http://josephg.com/blog/electron-is-flash-for-the-desktop/), 写出来的 helloworld 可能是世上体积最大的(115M)

- [nwjs](https://nwjs.io/)

对比 electron 的优势是? 知乎有一篇[讨论](https://www.zhihu.com/question/38854224). 特点是对 chromium 的整合更深入, 魔改了 chromium. 早年据说坑很多, 最大的优势可能是兼容 xp, 现在可能坑都填起来了

- [electrino](https://github.com/pojala/electrino)

electron 的瘦身版, 不再附带 chronium, 而是利用 os 自带的浏览器引擎. 也是一个实验性质的产品, 截止 2018-05-20, 已经半年没有开发了.

- [Quark](https://github.com/jscherer92/Quark)

electrino 死了之后, 其他开发者做了 quark, 也是利用 os 自带的浏览器引擎. 目前仍然在开发早期.

- [react native macos](https://github.com/ptmt/react-native-macos)

非跨平台, 只支持 macos. 截止 2018-05-20 仍然是实验性质的产品, 而且已经有半年没有 commit 了

- [MacGap](http://macgapproject.github.io/)

非跨平台, 只支持 macos. 利用 webkitview 来展示页面.

- nodejs + pkg + browser

用pkg打包 nodejs 服务, 然后用浏览器访问这个服务. pkg 可以换成 [node-packer](https://github.com/pmq20/node-packer) 或者 [nexe](https://github.com/nexe/nexe/)

- [proton](https://github.com/kusti8/proton-native)

用类 react 的语法写桌面应用, 其实是一个 [libui](https://github.com/andlabs/libui/) 的 js 绑定. libui 本身截至 2018-05-20, 仍然是 Alpha 3.5 的状态, 但是开发很活跃.

- [vuido](https://github.com/mimecorg/vuido)

用 vue 的语法写桌面应用, 这也是 libui 的一个绑定.

- [sciter](https://sciter.com/)

可嵌入 html/css/script 的超小引擎(<10M), 非开源产品, 但是有一些公司在用, 比如赛门铁克.

- qt

c++ 的 GUI 框架.

- [yue](https://github.com/yue/yue)

C++ 写的 gui 库, 有 js 的绑定. 但是不确定是否 css 写界面. 用它写出来的 slack 才 10M 不到.

