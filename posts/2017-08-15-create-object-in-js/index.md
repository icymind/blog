+++
title = "各种青年是怎么创建对象的"
tags = ["js"]
+++

{% asset_img create-object-in-js.jpg %}

### 理解对象

对象属性的类型只有两种, 一种是数据属性(可以放值), 另一种是访问器属性.
创建对象的数据属性除了常用的对象字面量和构造函数模式之外, 还可以利用Object的两个方法:

- Object.definePropterty
- Object.definePropterties

创建对象的访问器属性, 只能用 Object 的这两个方法, 无法用字面量方式创建.

除了创建对象属性, Object.definePropterty 和 Object.definePropterties 还可以指定属性的特性. 对于数据属性来说, 特性有:

- [[Configurable]]
- [[Enumerable]]
- [[Writable]]
- [[Value]]

对于访问器属性来说, 特性有:

- [[Configurable]]
- [[Enumerable]]
- [[Get]]
- [[Set]]

访问器属性比较少见, 举个例子:

<!--more-->

```javascript
var book = {
    _year: 2004,
    edition: 1
}

// 注意 "year" 参数的括号!
Object.definePropterty(book, "year", {
    get: function () {
        return this._year
    },
    set: function (newValue) {
        if (newValue > 2004) {
            this._year = newValue
            this.edition += newValue - 2004
        }
    }

})
```

只指定 getter 意味着属性不能写, 尝试写入会被忽略; 只指定 setter 意味不可读, 否则得到 undefined. 严格模式下, 尝试写入/读取没有 setter/getter 的属性会抛出错误.

此外,还有一个 API: Object.getOwnPropertyDescriptor() 可以取得给定属性的描述符.

**IE BUGS**: IE9+才有这些 API

### 创建对象

二逼青年创建多个对象:

```javascript
// 二逼青年,重复 n 次
var p1 = {
    name: "someone",
    age: 20,
    sayName: function () {
        console.log(this.name)
    }
}
```

普通青年把二逼青年的重复代码提取出来:

```javascript
// 普通青年: 工厂模式
function createPerson(name, age) {
    var p = {}
    p.name = name
    p.age = age
    p.sayName = function () {
        console.log(this.name)
    }
    return p
}
var p1 = createPerson("someone", 20)
```

这种普通青年的代码称为"工厂模式", 还有另一种普通青年, 在新建对象的方法上有所不同. 他们通过 `var p2 = new createPerson("someone", 20)` 来构造实例, 称为"寄生构造模式", 这种方法虽然用了接下来要提到的 `new` 关键词, 但是并不能通过 `instanceof` 操作符确定实例的类型.

普通青年的模式仍然有重复代码, 每次都要创建和返回一个对象. 文艺青年把这步也给省略了:

```javascript
// 文艺青年: 构造函数模式
function Person(name, age) {
    // var this = {}
    this.name = name
    this.age = age
    this.sayName = function () {
        console.log(this.name)
    }
    // return this
}
var p1 = new Person("someone", 20)
```

这种方式称为"构造函数模式". 其中, 必须要用 new 关键词告诉 js 引擎, 让引擎帮我们自动创建和返回对象. 否则的话, 直接调用,  this 就指向了全局对象; 如果用call/apply 方式调用, 那this 就指向了绑定的对象.

文艺青年不但精简了代码, 而且构造函数模式可以将实例标识为一种特定的类型:  
`console.log(p1 instanceof Person) // true`

但是文艺青年的代码仍然有提高的空间, 不要忘了, 函数也是对象, 因此每个 sayName 指向的都是一个 Function 对象的实例. 从逻辑角度讲, 其中的  
`this.sayName = function () { console.log(this.name) }`  
可以这样定义:  
`this.sayName = new Function("console.log(this.name)")`

可以验证 Person 的不同实例的同名函数是不相等的:  
`console.log(person1.sayName == person2.sayName) // false`

文艺青年可以这样优化:

```javascript
function sayName() {
    console.log(this.name)
}
function Person(name, age) {
    this.name = name
    this.age = age
    this.sayName = sayName
}
var p1 = new Person("someone", 20)
```

带来的新问题是:

- 全局作用域中定义的函数实际上只能被某个类型的对象使用, 全局函数名不副实.
- 如果对象需要定义很多方法, 那么就要定义很多全局函数, 这个类型没有封装性可言, 同时污染全局空间.

**原型模式**

无论什么时候, 只要创建了一个函数 Demo, 就会同时构造创建一个隶属于它的原型对象.原型对象是 Object 的实例, 而不是构造函数 Demo 的实例, 虽然原型对象的 constructor 指向的是函数 Demo. 原因在于 instanceof 不是依靠 constructor 的指向来判断对象是不是某个类型 Demo 的实例, 而是根据 Demo 的原型对象在不在该实例的原型链上来决定.

```javascript
function Animal(name) { this.name = name }
var person = new Person("someone", 20)
Animal.prototype = Person.prototype
// true
person instanceof Animal
person.__proto__ = new Object()
// false
person instanceof Person
```

原型对象默认只会取得 constructor 属性, 其他属性/方法都是从 Object 继承而来.


ECMAScript 里每个对象(函数也是对象!原型也是对象!)都有的几个属性之2:

- `constructor`: 保存着用于创建当前对象的函数.
- `[[Prototype]]`: 一个内部指针, 指向实例的构造函数的原型对象. 在 Firefox, Safiri 和 Chrome 中, 这个属性可以通过 `__proto__` 属性访问. 也可以通过 `Object.getPrototypeof( person1 )` 来获得.

如果是 Function 对象, 那么还有个 prototype 属性, 指向它的原型对象.

用之前的例子进行说明, 构造函数 Person 的属性, 其原型对象的属性, 其实例的属性以及这三个实例(别忘了函数也是 Function 的一个实例)的关系如下:

{% asset_img prototype.jpg %}

读实例的属性时, 先从实例本身开始搜索, 如果找到了该属性, 则返回值. 否则搜索指针指向的原型对象. 写属性时, 无法通过实例重写原型中的值, 如果在实例中添加了一个属性, 而该属性与实例原型中的一个属性同名, 那么我们就在实例中创建该属性, 该属性将会屏蔽原型中的那个属性.

如何确定一个属性存在于实例中还是存在于原型中?

- `person1.hasOwnProperty("name")` 可以确定一个属性存在于实例中.
- `name in person1` 无论一个属性存在于实例还是原型, 都返回 true
- 因此可以用 `!person1.hasOwnProperty("name") && ("name" in person1)` 来确定一个原型只存在于原型中.

介绍完原型, 就可以知道用原型模式创建对象的方式了:

```javascript
function Person() { }

Person.prototype.name = "simon"
Person.prototype.age = 29
Person.prototype.sayName = function () { console.log(this.name) }
```

每次都写一堆 `Person.prototype`前缀, 还可以更偷懒:

```javascript
function Person() { }

Person.prototype = {
    constructor: Person,
    name: "simon",
    age: 29,
    sayNmae: function () { console.log(this.name) }
}
```

重写原型之后, 新原型对象的 constructor 不再指向Person( 而是指向 Object ), 虽然 constructor 一般也没什么用, 但是如果重要的话, 可以在新原型对象中进行恢复原来的指向.

原型中的属性是被很多实例共享的, 如果这个属性是引用类型的属性, 问题就突出了:

```javascript
function Person() {}
Person.prototype = {
    name: "simon",
    friends: ["some", "other"]
}
```

问题在于某个实例添加了朋友, 其他实例也被同步. 因此都是"组合使用构造函数模式和原型模式", 构造函数用于定义实例属性, 原型模式用于定义方法和共享的属性:

```javascript
// 理科青年: 组合使用构造函数和原型模式
function Person(name, age) {
    this.name = name
    this.age = age
}
Person.prototype.sayName = function () { console.log(this.name) }
```

强迫症早期看到理科青年的代码觉得很难受, 问理科青年: "尼玛方法居然在构造函数外面!", 理科青年表示"我也没办法啊, 封在里面的话每创建一个实例都要对原型进行一次属性赋值, 每次都构建函数实例影响性能呀", 强迫症表示"我要把他们封装到一起!":

```javascript
// 强迫症早期: 动态原型模式
function Person(name, age) {
    this.name = name
    this.age = age

    if (typeof this.sayName != "function") {
        Person.prototype.sayName = function () { console.log(this.name) }
    }
}
```

这下好了, 只有第一次创建实例时才操作原型, 其余的创建都只需要用 typeof 判断一次就行. 强迫症早期满意了, 晚期患者也一样不舒服, "每次构建实例居然都要判断!", 于是改写成这样:

```javascript
// 强迫症晚期: IIFE + 原型模式
var Person = (function() {
    function Person(name, age) {
        this.name = name
        this.age = age
    }
    Person.prototype.sayName = function () { console.log(this.name) }

    return Person
})()
```
### 继承

之前说过, 在原型对象上定义引用类型的属性不可取, 以免被多个实例共享. 然而使用原型链技术进行继承, 即使父类的引用类型定义在实例上, 也会有问题. 原因在于父类的实例成了子类的原型.

```javascript
// 普通青年: 单独使用原型链实现继承
function SuperType() {
    this.colors = ["red", "blue", "green"]
}
function SubType() { }

SubType.prototype = new SuperType()

var sub1 = new SubType()
var sub2 = new SubType()
sub1.colors.push("black")
console.log(sub2.colors)
```

此外, 原型链继承还有另外一个问题: 在创建子类型的实例时, 无法向超类的构造函数传递参数.

文艺青年通过在子类的构造函数里调用父类的构造函数来弥补普通青年的不足:

```javascript
// 文艺青年: 借用构造函数
function SuperType() {
    this.colors = ["red", "blue", "green"]
}
function SubType() {
    SuperType.call(this)
}
```

但是这么做就不能认定 sub1 是 SuperType 的实例了. 而且, 定义在父类原型对象上的方法, 都无法被 SubType 的实例访问, 只能把所有方法都定义在构造函数里, 毫无函数复用可言. 文艺青年的方案和普通青年一样无用.

理科青年比他们都要靠谱, 他的思路和创建对象时一致, 就是组合普通青年和文艺青年的做法, 用原型链实现对原型属性和方法的继承, 同时通过构造函数来实现对实例属性的继承:

```javascript
// 理科青年: 组合继承
function SuperType() {
    this.colors = ["red", "blue", "green"]
}
SuperType.prototype.sayColors = function () { console.log(this.colors) }

function SubType(age) {
    SuperType.call(this)
    this.age = age
}
SubType.prototype = new SuperType()
SubType.prototype.constructor = SubType
SubType.prototype.sayAge = function () { console.log(this.age) }
```

通过以上代码, 虽然子类的原型对象中仍然包含了引用类型 colors, 但是子类的实例中也包含了 colors 属性, 该属性屏蔽了原型中的属性, 从而避免了共享属性的问题. 由于优点明显, 理科青年的方法成为了 js 中最常用的继承方法.

但是懒癌早期患者克罗克福认为, 当我只想从原有的一个对象派生出几个对象的时候, 还需要定义超类构造函数, 子类构造函数, 太啰嗦了. 直接将已有的对象作为新对象的原型对象即可, 并称之为"原型式继承"

```javascript
// 懒癌早期: 原型式继承
var person = {
    name: "simon",
    friends: ["some", "other"]
}

var anotherPerson = Object.create(person)
anotherPerson.name = "maggie"
anotherPerson.sayName = function () { console.log(this.name) }
// true
anotherPerson.__proto__ == person

var yetAnotherPerson = Object.create(person)
yetAnotherPerson.name = "Linda"
yetAnotherPerson.sayName = function () { console.log(this.name) }
yetAnotherPerson.friends.push("Van")

console.log(anotherPerson.friends)
```

虽然"原型式继承"可以偷懒不用定义构造函数, 但是没能解决属性的共享问题.(除非在新对象上新建同名属性, 对原型属性进行屏蔽). 克罗克福到了懒癌晚期, 他觉得每次都在新对象上对 sayName 属性进行赋值很累, 像工厂模式/寄生构造函数一样把 sayName 属性也封装起来吧, 这称为"寄生式继承".

```javascript
// 懒癌晚期: 寄生式继承
function createAnother(original) {
    var clone = Object.create(original)
    clone.sayName = function () { console.log(this.name) }
    return clone
}
```

但是!每个实例都重复定义了一个 sayName 函数, 没有函数复用. 可见懒癌患者的这两种方法远不及组合式继承那么实用.

组合式继承优点很多, 但是也有它自己的缺点:
由于子类原型对象是超类的实例, 因此也拥有超类的实例属性, 同时子类的构造函数调用父类构造函数, 因此也有超类的实例属性, 虽然这样解决了属性共享的问题, 但是对于强迫症来说似乎有点冗余. 如果子类的原型不包含超类的实例属性就好了, "原型对象上只定义方法"这才是最佳的状态. 这种状态可以用"寄生组合式继承"来达到:

```javascript
// 强迫症晚期: 寄生组合式继承
function inheritPrototytype(subType, superType) {
    var prototype = Object.create(superType.prototype)
    prototype.constructor = subType
    subType.prototype = prototype
}

function SuperType() {
    this.colors = ["red", "blue", "green"]
}
SuperType.prototype.sayColors = function () { console.log(this.colors) }

function SubType() {
    SuperType.call(this)
    this.age = 20
}

// 近似等价于: SubType.prototype = Object.create(SubType.prototype)
inheritPrototytype(SubType, SuperType)

SubType.prototype.sayAge = function () { console.log(this.age) }

var sub1 = new SubType()
```

开发人员普遍认为寄生组合式继承是引用类型最理想的继承范式.
