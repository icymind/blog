---
slug: Generator
date: 20171121
tags: ["es6"]
title: "Generator"
---



es6 的 Generator 可以通过 yield 交出控制权，通过 next(arg) 函数恢复控制权同时接收外部传入的数据。这个特性可以使得 Generator 替代回调函数成为可能。

回顾一下异步流程：
- 执行一些代码
- 执行一些异步代码，并等待数据
- 对取回的数据做一些处理

<!--more-->

其中“对取回的数据进行处理”通常用回调函数的形式进行。比如获取某个网络资源：
```js
// code-list-1
const request = require('request')

function myRequestV0(url ,cb) {
    request(url, (err, res, body) => {
        const code = res.statusCode
        cb(code) // 对取回的数据进行处理
    })
}
```

如果用 Generator 来重新思考这个过程，那么应该是：
- 执行一些代码
- yield 把控制权交给异步代码
- 异步代码执行后，调用 next(data) 方法传入数据，并交回控制权
- 继续执行一些代码

还是用获取网络资源为例子：

```js
// code-list-2
const request = require('request')

function* myGenerator() {
    console.log('before request')
    const code1 = yield myRequestV1('http://qq.com') // 这里把控制权交给异步代码
    console.log(code1)
    const code2 = yield myRequestV1('https://baidu.com') // 这里把控制权交给异步代码
    console.log(code2)
}

const gen = myGenerator()
gen.next()

function myRequestV1(url) {
    request(url, (err, res, body) => {
        gen.next(res.statusCode) // 这里返回数据并交回控制权
    })
}
```
可以看到手动执行比较繁琐，需要手动调用 gen.next 交回控制权。试着改进一下：
1. 改写 myRequest 函数，使得它接收一个回调函数。那么如果我们传入 gen.next， 就可以在取得数据后自动交回控制权了。但是在 myGenerator 内部并没有 gen 变量可用, 也就没法传入 gen.next。
2. 所以还需要迂回一下: 让 myRequest 返回一个函数，将 gen.next 传给它就好了。但是 myGenerator 有多个 yield，因此需要特别关注 gen.next 的每一次执行，如果不保存它的执行结果，我们就没办法向其他 yield 出来的函数传入 gen.next 了。
3. 因此需要包装一下 gen.next

```js
// code-list-3
const request = require('request')

function myRequestV2(url) {
    return function A(cb) {
        request(url, (err, res, body) => {
            cb(res.statusCode) // 如果 cb 是 gen.next, 那么就返回了数据(res.statusCode)并交回控制权
        })
    }
}

function* myGenerator() {
    console.log('before request')
    const code1 = yield myRequestV2('http://qq.com') // myRequest 返回一个函数
    console.log(code1)
    const code2 = yield myRequestV2('https://baidu.com') // myRequest 返回一个函数
    console.log(code2)
}

const gen = myGenerator()
const nextWrapper = (data) => {
    const yieldObj = gen.next(data) // yieldObj.value 即 myRequest 返回的函数
    if (yieldObj.done) return
    yieldObj.value(nextWrapper)
}
nextWrapper() // 第一次执行不传参数
```

以上代码还有一些改进的空间：
- 改写 myRequest 的过程能提取出一些模式吗？这样就可以方便的改写其他函数了
- nextWrapper 执行的过程还可以进一步封装，一遍其他模块调用

```js
// code-list-4
function rewrite(fn) {
    return function (arg) {
        const argArray = Array.from(arguments)
        return function(cb) {
            argArray.push(cb)
            return fn.apply(this, argArray)
        }
    }
}

function* myGenerator() {
    console.log('before request')
    const code1 = yield rewrite(myRequestV0)('http://qq.com')
    console.log(code1)
    const code2 = yield rewrite(myRequestV0)('https://baidu.com')
    console.log(code2)
}

function run(generator) {
    const gen = generator()
    const nextWrapper = (data) => {
        const yieldObj = gen.next(data)
        if (yieldObj.done) return
        yieldObj.value(nextWrapper)
    }
    nextWrapper()
}
```

综上， 就是 es6 的 Generator， 其中 rewrite 函数就是 thunkify 函数， run 就是 co 模块的原理。

Generator 的三个层次：
1. 看山是山

    generator 就是 yield 出控制权， 调用 next() 恢复执行(next 返回的是一个 {value, done} 对象)， next 函数的参数就是 yield 的返回值
2. 看山不是山

    co 模块是如何工作的？和我理解的 generator 好像不太一样
3. 看山还是山

    co 模块的本质还是 yield 和 next


