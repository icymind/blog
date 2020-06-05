---
date: 2016-01-29
tags: ["Tech"]
slug: "esc-in-vim-auto-change-to-eng-im"
title: "按下ESC时让VIM自动切换为英文输入法"
---



- 思路是用 [ karabiner ][ karabiner ] 软件，如果当前运行的程序是VIM，那么将ESC映射为：首先执行ESC的功能，然后切换到英文输入法。缺点是当按下 i 进入插入模式时处于英文输入状态，需要打中文的话还需要自己手动切换一次。

- 新建一个 karibiner 的xml配置文件

    ```xml
    <?xml version="1.0"?>
    <root>
    </root>
    ```

- 在新建的配置文件 root 标签内配置切换输入法、对应的虚拟按键，以及对应的应用名称及ID。更多的详情，可以看[官方文档][ documents ]

    ```xml
    <vkchangeinputsourcedef>
        <name>KeyCode::VK_CHANGE_INPUTSOURCE_ICYMIND_ENG</name>
        <inputsourceid_equal>com.apple.keylayout.US</inputsourceid_equal>
    </vkchangeinputsourcedef>

    <appdef>
        <appname>iTerm</appname>
        <equal>com.googlecode.iterm2</equal>
    </appdef>
    <appdef>
        <appname>MacVim</appname>
        <equal>org.vim.MacVim</equal>
    </appdef>
    ```

<!--more-->

-  映射ESC

    ```xml
    <item>
        <name>Esc: Esc and Switch to ENG IM</name>
        <identifier>private.esc-esc and switch eng im</idendifier>
        <app_only>Atom, MacVim, iTerm, Xcode, android_studio, Spotlight</app_only>
        <autogen>
            __KeyToKey__
            KeyCode::ESCAPE,
            KeyCode::ESCAPE,
            KeyCode::VK_CHANGE_INPUTSOURCE_ICYMIND_ENG
        </autogen>
    </item>
    ```

- 在private.xml 中 include 刚新建的xml文件：

    ```xml
    <?xml version="1.0"?>
    <root>
        <include path="{{ ENV_HOME }}/Dropbox/Code/Script/karabiner.xml" />
    </root>
    ```
-  最后在 karabiner 中勾选刚配置的选项就好了

[ karabiner ]: https://pqrs.org/osx/karabiner/
[ documents ]: https://pqrs.org/osx/karabiner/xml.html.en#vkchangeinputsourcedef

