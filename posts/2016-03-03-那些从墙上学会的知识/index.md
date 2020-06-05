---
date: 2016-03-03
tags: ["Tech"]
slug: "learn-from-gfw"
title: "那些从墙上学会的知识"
---



>不好好学习计算机网络，就会被国家教育。

## 拓扑图

![topological][topological]

## Shadowsocks怎么穿墙的

### 端口转发
  首先，把SS部署在路由器上，默认情况下是监听1080端口的，所有经过这个端口的数据包都由SS转发到远程服务器上。OpenWrt上的Shadowsocks-libev自带有3个程序，分别是ss-local, ss-redir 和ss-tunnel。这里由ss-redir转发数据到服务器。
在未做配置的情况下，所有的数据都是直接有路由器直接发出去的。怎么才能让数据包多走一步，先发送到1080端口让ss-redir进行再加工呢？这个可以用linux内核内的netfilter框架对进入系统的数据包进行筛选然后端口转发。netfilter在进行端口转发的时候，还会自动维护一些必要的信息，以便做一个回程的逆处理：将服务器返回的数据转回原始的端口。netfilter的配置工具是iptables, 鸟哥那有一些很好的[资料][vbird-netfilter]，也可看看这篇[blog][iptables-blog]。

### 数据传送

ss-redir从1080端口获取原始数据包之后, 根据选择的加密方式对原始数据包进行加工，目的是让墙无法轻易探知数据包的内容从而逃过被宰杀的命运。VPS上运行的ss-server接受到数据后，根据约定的加密方式还原数据，并发到它的真实目的地。
返程也是类似的过程。

<!--more-->

### 验证

#### 场景

假设GFW的黑名单中有一条IP地址: 206.125.164.82, 为了表述方便，姑且给它个代号叫Evil-IP。所有经过GFW的数据包，如果目的地址是这Evil-IP，就会被无情丢弃。

我们通过telnet发起TCP请求，生成发往Evil-IP的数据包:  
`telnet 206.125.164.82 80`  
如果链接成功了，请假装没有看到。毕竟我们假设它被墙了嘛。

#### 添加规则

首先将路由器防火墙的当前规则保存:  
`iptables-save > iptables.rules`  

如果因为规则混乱无法上网了可以通过  
`iptables-restore < iptables.rules`  
直接恢复而无需重启路由器。

添加自定义的规则，将我们的数据包转发到ss-redir监听的端口上:  
`iptables -t nat -A PREROUTING -d 206.125.164.82 -p tcp --dport 80 -j REDIRECT --to-port 1080`  
-t nat表示这条规则添加到nat表，因为端口转发只能在nat表上，所以这里是不能用默认的filter表的。-A PREROUTING表明将这条规则添加到PREROUTING这条规则链的最后。-j REDIRECT是说符合条件的数据包都jump到REDIRECT这个目标，后面的扩展参数--to-port指明了跳转到的端口号。

用`iptables -t nat --list`或者`iptables -t nat -L`命令看看输出，看到Chain PREROUTING上已经显示这条规则了，添加成功。

iptables的各个表的处理顺序，可以看这张图![iptables-flow][iptables]

可以看到，Client发往Evil-IP的数据被防火墙处理的规则路径被红色箭头标示.  
而Router自身发往Evil-IP的数据，依次应用的Chain用蓝色标示。  

因此我们将规则添加到PREROUTING链只能转发Client的数据到1080，如果你还要在Router上做羞羞的事，还要再添加一条规则: `iptables -t nat -A OUTPUT -d 206.125.164.82 -p tcp --dport 80 -j REDIRECT --to-port 1080`。

观察到Client的数据和Router的数据最后都经过nat表的POSTROUTING链才发出，那么将转发规则添加到这个链上不就万事大吉了嘛？我们试试：  
`iptables -t nat -A POSTROUTING -d 206.125.164.82 -p tcp -j REDIRECT --to-port 1080`  
呵呵，添加不成功，提示“ip_tables: REDIRECT target: used from hooks POSTROUTING, but only usable from PREROUTING/OUTPUT”, 至于为什么REDIRECT不能应用在这个链上，直觉上应该是这个链只能用来做SNAT，更严谨的原因我并没有去探究，如果有人知道我顺便知会我一声。

#### 观察

接下来就要观察数据包是否被正确转发了。

一般来说，抓取数据包的活交给tcpdump这种神器最合适不过了，但是我监听1080端口几千年，都没观察到有数据流量，结果自然是大为沮丧. 后来Google后才发现是掉进了端口转发的坑，端口转发是不能被tcpdump捕获到的([原因][tcpdump-nat]). 而且由于路由器上的ss-redir的Verbose mode太安静了，无法观察到什么有用的信息。

我想到的有两个方法来验证数据是否被正确转发(如果有更好的方法请告诉我)：

- 通过服务器端的ss-server观察  

    分别在VPS和路由器上运行ss-server和ss-redir，注意添加-v参数可以看到更多的运行消息.  
    VPS：`/usr/local/bin/ss-server -c /etc/shadowsocks/ching.json -u -v`  
    router: `/usr/bin/ss-redir -c /etc/ching.json -b 0.0.0.0 -v`  
    在Client或者Router上向Evil-IP发送数据：  
    `telnet 206.125.164.82 80`  
    按下会车后应该就可以看到VPS运行的ss-server的工作状态发生了改变，接受了一个连接并向Evil-IP发送了数据。

- nc命令  

    如果只想验证iptables进行端口转发的效果，而不理会Shadowsocks的话。nc命令是一个好工具。关掉Router上运行的ss-redir和uhttpd进程，以释放1080端口和80端口。openwrt自带的nc不能监听端口([原因][openwrt-nc]), 需要安装netcat来补充这个功能:  
    `opkg install netcat`  
    然后在路由器上运行两个nc实例，一个监听80端口：  
    `nc -l -p 80`  
    另外一个监听1080:  
    `nc -l -p 1080`  
    最后我们从Client对Evil-IP的80端口发送数据  
    `nc 206.125.164.82 80`  
    如果是监听1080的实例收到了数据，说明端口转发成功, 事实证明确实转发成功了.

## 转发大量的Evil-IP

如果只有少数几个Evil-IP的话，一个个用iptables添加转发规则也没什么问题，但是如果数量一多，几百几千条的IP，就算添加到规则里不是什么大事，但是每个数据包进出都要做那么多的检查和匹配，时间复杂度是O(n)，效率还能进一步提高，利用IPset可以将时间复杂度变成O(1)

- IP sets  

    [IP sets][IP-sets]是内核里的一个框架,一个IP set可以存储IP、网络、MAC地址等等，查找集合中某元素的的速度极快, 利用ipset工具管理。ipset的的[使用方法][ipset-usage]也很直白，直接验证利用IP sets的结果吧。

- 验证结果  

    建立一个存储IP的集合：SHADOWSOCKS:  
    `ipset -N SHADOWSOCKS hash:ip`  
    向集合中添加Evil-IPs:  
    `ipset add SHADOWSOCKS 206.125.164.82`  
    `ipset add SHADOWSOCKS 74.125.200.113`  
    查看SHADOWSOCKS集合的元素:  
    `ipset list SHADOWSOCKS`  
    还原初始iptables:  
    `iptables-restore < iptables.rules`  
    添加针对IP sets进行匹配的规则：  
    `iptables -t nat -A OUTPUT -p tcp -m set --match-set SHADOWSOCKS dst -j REDIRECT --to-port 1080 `  
    `iptables -t nat -A PREROUTING -p tcp -m set --match-set SHADOWSOCKS dst -j REDIRECT --to-port 1080`  
    最后按上一节的方法进行验证, 可以观察到已经成功通过ss-redir访问这两个Evil-IP。

## 如何得到Evil-IP

浏览网络过程中，比较用域名而言，利用IP上网还是太原始了，而且域名是固定的，而域名对应的IP地址却是可以动态变化，如果能得到动态变化的Evil-IPs那就好了。由于iptables工作在网络协议第三层和第二层，识别IP识别MAC，但是对高层的域名是无察觉的，所以无法用iptables来匹配Evil-Domain，只能先找到Evil-Domain对应的Evil-IP，将这些IP加入IP set，最后才让iptables上场工作。

### dnsmasq-full  

dnsmasq是轻量的DHCP和DNS缓存服务，它有个--ipset选项，可以将指定域名查询到的IP地址加入指定的ip set。但是OpenWrt自带的版本不支持ipset选项，需要安装dnsmasq-full:  
`opkg remove dnsmasq`  
`opkg install dnsmasq`  
`/etc/init.d/dnsmasq restart`  
验证版本，ipset字样表明支持ipset:  
`dnsmasq -v`  

>Dnsmasq version 2.73  Copyright (c) 2000-2015 Simon Kelley  
Compile time options: IPv6 GNU-getopt no-DBus no-i18n no-IDN DHCP DHCPv6 no-Lua TFTP no-conntrack ipset auth DNSSEC loop-detect inotify

以下第一条参数为Evil-Domain指定DNS服务器，这里要注意即使是利用dnsmasq本身发起查询，也需要明确说明，不然是无法解析Evil-Domain的。第二条参数将解析结果加入之前建立的SHADOWSOCKS ip set  
`echo “server=/echowhale.com/127.0.0.1#53” >> /etc/dnsmasq.conf`  
`echo “ipset=/h2byte.com/SHADOWSOCKS” >> /etc/dnsmasq.conf`  
发起DNS查询后，观察SHADOWSOCKS set的变化，可以看到集合里已经多了一条记录，那就是查询到的echowhale.com的IP：  
`nslookup echowhale.com`  
`ipset list SHADOWSOCKS`  

直到这里，我们都是假设DNS一直能返回正确的地址。但是事实往往不尽如人意，由于[DNS投毒][dns-poison]的存在，在访问Evil-Domain时，我们会被虚假的DNS响应带到坑里去。  
当你觉得自己学得够多了的时候，墙总会跳出来给你一巴掌，呵呵哒。

## 解决DNS投毒

要想不被毒粥毒死，有两个思路:

### 一是从毒锅里盛粥，把有毒的米挑出来扔掉  

如果毒米的特征很明显，用这种方法也未尝不可。以前伪DNS响应总是返回固定的若干个假IP，利用iptables匹配53端口的udp数据，再用iptable的u32模块或者string模块找到数据包携带的IP地址，跟我们收集到的伪IP集合对比，发现是有毒的就扔掉就好了。  
可惜墙为了督促我们学习，返回的IP地址已经是随机的了。从毒粥里盛粥喝，既危险又不优雅，不过看看先驱们[怎么做的][iptables-u32]也是一种致敬。

### 二是从安全的锅里盛粥，放心吃  

国外的月亮圆，国外的粥也更好吃。DNS投毒是我们大宋特有的独门暗器，国外的DNS才是干净无毒的。只要能从国外的锅里盛，就能放心吃。怎么盛粥学问太多了，但大致可以分为两大类：一是用Shadowsocks进行udp DNS查询，由于Shadowsocks对DNS请求进行了封装，墙无法知道查询内容所以数据包被放行；二是用TCP进行DNS查询，目前墙还未对TCP查询进行干扰。  
每个类别都有若干种方法，但是只要弄清楚原理，哪里方法都能用得得心应手，以下是几个方法的验证：  

### > 用ss-redir转发UDP DNS查询

按照SS的[ WiKi ][ss-libev]，转发UDP该用ss-tunnel来做，但是通过`/etc/bin/ss-redir -h`查看ss-redir的帮助，可以看到一个-u选项来让SS转发udp数据，姑且先用ss-redir试试。  
让ss-redir支持udp转发：  
`/usr/bin/ss-redir -c /etc/ching.json -b 0.0.0.0 -u -v`  
把/etc/dnsmasq.conf里的server=/echowhale.com/127.0.0.1#53改成server=/echwhale.com/127.0.0.1#1080，意思是告诉dnsmasq让Evil-Domain用本机的1080端口查询  
重启dnsmasq， 当我们用`nslookup echowhale.com`发起DNS查询时，ss-redir提示收到了udp数据：  
>2015-12-24 04:21:55 INFO: [udp] server receive a packet  
>2015-12-24 04:21:55 INFO: [udp] cache miss: 127.0.0.1:1080 <-> 127.0.0.1:17706  
>2015-12-24 04:56:28 INFO: [udp] server receive a packet  
>2015-12-24 04:56:28 INFO: [udp] cache miss: 127.0.0.1:1080 <-> 127.0.0.1:14898  

服务器的ss-server也收到了UDP数据:  
>2015-12-23 23:56:15 INFO: [udp] server receive a packet  
>2015-12-23 23:56:15 INFO: [udp] cache miss: 127.0.0.1:1080 <-> 60.223.238.62:15850  
>2015-12-23 23:56:20 INFO: [udp] server receive a packet  
>2015-12-23 23:56:20 INFO: [udp] cache miss: 127.0.0.1:1080 <-> 60.223.238.62:5488  

从ss-server的输出可以看到：VPS的1080端口在尝试响应DNS查询，并没有像预料的那样把DNS查询包继续往外发送。说明直接配置dnsmasq的方法好像不太对。捋一捋：  
当我们在路由器上发起DNS查询echowhale.com的时候，由于dnsmasq定义的DNS服务器是127.0.0.1#1080，所以upd包的目标地址是127.0.0.1#1080，接着这个包到了1080端口被ss-redir封装发到ss-server，ss-server得到的udp包的目标地址仍然是127.0.0.1#1080。这就解释了为啥VPS的1080在和Router通信。VPS的1080端口并没有DNS查询的服务，鸡同鸭讲，再怎么通信Router也无法从VPS那里得到echowhale.com的IP地址，最后就超时结束了通信。  
捋清楚了还得解决问题，基于这个状况，应该有3个解决方法吧：

- **在VPS的1080端口绑定一个DNS服务。**  

    `yum install dnsmasq #安装`  
    `echo “port=1080” >> /etc/dnsmasq #配置监听的端口`  
    `service dnsmasq start #启动dnsmasq`  
    `dig @127.0.0.1 -p 1080 google.com  #验证dnsmasq已正确工作`  
    最后从Router发起DNS查询Evil-Domain，发现已经能得到正确结果了。

- **在VPS把127.0.0.1#1080重定向到8.8.8.8#53**。  

    CentOS7 默认的防火墙改成了FirewallD，不再是我刚学的iptables了。就不做这个验证了，应该是可以实现的。如果想试试，把防火墙换回iptables的话可以参考这篇[ 教程 ][centos-iptables] 

- **在Router上用8.8.8.8#53查询Evil-Domain，然后用iptables把发往8.8.8.8的包重定向到Router:1080。**  

    先配置dnsmasq用4个8查询Evil-Domain: 把127.0.0.1#1080改为8.8.8.8#53  
    然后再用iptables把发往8.8.8.8的数据包转发给ss-redir:  
    `iptables -t nat -A OUTPUT -p udp --dport 53 -d 8.8.8.8 -j REDIRECT --to-port 1080`  
    然而通过观察，虽然ss-server收到了udp数据，但是udp的目标地址仍然是127.0.0.1#1080。这个方法并不奏效。  
    添加一条规则，试试如果使用TCP查询DNS，ss-server能不能进行正常的DNS解析:  
    `iptables -t nat -A OUTPUT -p tcp --dport 53 -d 8.8.8.8 -j REDIRECT --to-port 1080`  
    再次通过nslookup发起查询，结果观察到ss-server收到数据后成功向8.8.8.8发送请求，并将响应发回了ss-redir。观察到的ss-server的屏显如下：  

        >2015-12-24 02:21:54 INFO: accept a connection  
        >2015-12-24 02:21:54 INFO: connect to: 8.8.8.8:53

        为什么ss-server没能按照预期将udp的查询正确解包呢？或许是ss-redir封包的时候就没能把真实的目标地址包进去吧？这个要弄清楚感觉要好好看网络协议了，暂且挖个坑吧，有人知道也请留言告诉我。


### > 用ss-tunnel转发UDP DNS查询

ss-tunnel可以转发udp，而且几乎不需要做什么配置，要方便多了。但是ss-redir对了解原理更有帮助，所以先说了更麻烦的ss-redir。运行ss-tunnel  
`/usr/bin/ss-tunnel -c /etc/ching.json -b 0.0.0.0 -l 5353 -L 8.8.8.8:53 -u -v`  
找到dnsmasq.conf里的127.0.0.1#1080，把端口号改成5353  

这个方法没什么好说的，懒得折腾其它方法的话用ss-tunnel就好了。  
我在长城宽带这个渣网络下，udp丢包异常地高，浏览器经常卡在"Resoving host..."的状态，得不到解析结果网页都打不开。  
![dns-fail][dns-fail]
这种情况下要做一点优化，可以看文章结尾处我的设置。  

### > iptables + tproxy转发UDP DNS查询

这个方法我没看明白，所以就没打算试了。不懂原理出了问题简直就像傻逼似的, 根本就没法解决。
[Shadowsocks-libev官网][ss-libev]  

### > 用unbound做TCP DNS查询

根据网上一些[博客][unbound-blog]的记录，unbound的延时好像很长。  

### > 用pdnsd做TCP DNS查询

优点是可以设置超长的DNS TTL。
[pdnsd官网][pdnsd]  
[教程][pdnsd-blog]  
[教程][pdnsd-blog-wido]  

## 末

目前我暂时使用的方案是让dnsmasq把Evil-Domain发到ss-redir，让ss转发UDP DNS查询，暂时没有引用ss-tunnel、unbound或者pdnsd处理DNS投毒。引进越多的程序，出了问题Debug就越麻烦，最简单的就是最本质的。  

如果想优化以下网络访问速度，还要了解[TTL][dns-ttl]。默认情况下，dnsmasq的ttl是继承自上游DNS服务器的。  
![dig300][dig300]  
通过dig可以看到google.com的ttl是300，也就是5分钟之内如果重复查询google.com的IP地址，dnsmasq不会向上游服务器递交查询，而是直接从缓存拿老的值给你。
最新的dnsmasq v2.73版本添加了一个--min-cache-ttl选项, 可以自定义ttl的值，根据作者的[说明][dnsmasq2.73]，最长也仅能设置为一个小时。有的网站几十年不换IP，而有的网站IP的调整很频繁，TTL设置多长也是仁者见仁智者见智的问题。如果你不想花时间在域名查询上，出了问题宁愿重启dnsmasq，那么TTL可以设置长一点。我暂时先设置为最长的一个小时(min-cache-ttl=3600).  
![dig3600][dig3600]
进一步优化的话，以下这些选项值得写进dnsmasq.conf：  

- cache-size=65536  #设置缓存大小

- log-queries  #记录DNS查询事件，在openwrt上可以通过logread查看日志，便于观察工作状态

- neg-ttl=3600  #如果上流DNS服务器没有返回TTL，则用这个代替

- log-async     #如果写日志时被阻塞，开启这个选项后可以保证dnsmasq的其它功能正常工作

- server=114.114.114.114    #添加114.114.114.114作为备选上流DNS服务器

- server=119.29.29.29   #添加DNSpod作为备选服务器

- all-servers       #向所有上流服务器发送查询，先返回的结果被采用。

要是还是觉得DNS查询慢，就换pdnsd替代dnsmasq，那玩意据说ttl设为一周都行。要不折腾着自己编译dnsmasq，把一个小时的ttl限制给去掉。  
min-cache-ttl是在2.73版本加入的选项，去作者官网可以浏览代码仓库，在[2.73的仓库][dnsmasq2.73gitlog]搜索ttl，找到添加min-cache-ttl的[那次提交][dnsmasq2.73mincachettl]，就可以看到提交者修改了哪些代码了，3600限制应该是在src/config.h里：  

>define TTL_FLOOR_LIMIT 3600 /\* don't allow --min-cache-ttl to raise TTL above this under any circumstances \*/

我做了个补丁，可以到[github][github-dnsmasq]参考编译过程或者直接下载编译好的ipk文件。最后我把ttl改成了一天：  
![dig1day][dig1day]





[topological]: /images/2016/topological.jpg
[vbird-netfilter]: http://linux.vbird.org/linux_server/0250simple_firewall.php#netfilter
[iptables-blog]: https://blog.coocla.org/207.html
[iptables]:  /images/2016/iptables_line.jpg
[tcpdump-nat]: http://serverfault.com/questions/502003/tcpdump-not-picking-up-traffic-redirected-by-iptables
[openwrt-nc]: https://dev.openwrt.org/ticket/13297
[iptables-domain]: http://serverfault.com/questions/334473/forwarding-packets-from-specific-domain-tld-to-a-certain-machine-in-network-us
[IP-sets]: http://ipset.netfilter.org/index.html
[ipset-usage]: https://intxt.net/block-ip-with-ipset/
[dnsmasq]: http://www.thekelleys.org.uk/dnsmasq/docs/dnsmasq-man.html
[iptables-u32]: https://www.lifetyper.com/2014/06/anti-dns-poison-without-vpn.html
[ss-libev]: https://github.com/shadowsocks/shadowsocks-libev
[centos-iptables]: https://community.rackspace.com/products/f/25/t/4504
[unbound-blog]: https://cokebar.info/archives/246
[pdnsd]: http://members.home.nl/p.a.rombouts/pdnsd/doc.html
[pdnsd-blog]: https://cokebar.info/archives/1053
[pdnsd-blog-wido]: https://wido.me/sunteya/use-openwrt-resolve-gfw-dns-spoofing
[dns-poison]: http://www.williamlong.info/archives/3356.html
[dns-ttl]: http://www.xiaoxiaozi.com/2013/04/23/2409/
[dnsmasq2.73]: http://lists.thekelleys.org.uk/pipermail/dnsmasq-discuss/2015q2/009644.html
[dig300]:  /images/2016/dig300.png
[dig3600]: /images/2016/dig3600.png
[dns-fail]: /images/2016/dns-fail.png
[dnsmasq2.73gitlog]: http://thekelleys.org.uk/gitweb/?p=dnsmasq.git;a=log;h=refs/tags/v2.73
[dnsmasq2.73mincachettl]: http://thekelleys.org.uk/gitweb/?p=dnsmasq.git;a=commitdiff;h=28de38768e2c7d763b9aa5b7a4d251d5e56bab0b
[dnsmasq2.75src]: http://www.thekelleys.org.uk/dnsmasq/dnsmasq-2.75.tar.gz
[github-dnsmasq]: https://github.com/A-Unique-Pig/openwrt-dnsmasq
[dig1day]: /images/2016/dig1day.png

