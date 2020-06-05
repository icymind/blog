---
date: 2013-11-12
tags: ["Algorithm"]
slug: "trie-tree"
title: "Trie树(字典树)"
---



## 引出问题

以前面试的时候接触过一道题:如何统计全国有多少个人的名字是重复的?  
本质上这是一道词频统计问题.当时我是用了很暴力的方法做的(掩面):直接将数据分块,输入hadoop集群,用map-reduce模型就可以输出结果了.  
当然我的方法效率是非常低的,单机可以完成的东西,偏要用集群.事实上用字典树可以很优雅地解决这个问题.  

## 什么是字典树

字典树也是一棵树,可以看图:
![trie][trie-tree-pic]
图示是一颗包含了b，abc，abd，bcd，abcd，efg，hii这6个单词的字典树. 由图可以看出字典树的一些性质:

- 根节点表示空字符串.
- 从根节点到某一节点,路径上的字符链接起来,为该字符对应的字符串.
- 每个节点的所有字节点的字符串不相同.

按照我的理解,字典树中,字符的信息是包含在路径上的,而不是在节点中.网络上的很多图示把字符画在节点中,不是很严谨.

节点中存储的信息根据不同的问题而定.如果是词频统计,那么可以存储该节点表示的字符串的计数值.如果是单词搜索,那么节点中可以存储该节点表示的字符串是否是一个单词.

比如在图示的字典树中查找ab,那么找到b节点后,就可查看b节点的额外信息,了解到该节点表示的字符串ab不是树中的单词.从而判定查找失败:  

```c
#define MAX 26
typedef struct TrieNode               //Trie结点声明 
{
    bool isStr;                     //标记该结点处是否构成单词 
    struct TrieNode *next[MAX];      //儿子分支 
}Trie;
```

## 字典树的分析

假设单词的平均长度是m.

### 1.时间分析
字典树插入和查找,最多只需要对比m个字符,因此时间负责度为O(m).  
一般来说很少单独删除某个节点(应用场景所限).
### 2.空间分析
字典树所消耗的空间的非常大的,一颗单词长度为m的树,节点数为:  
26^0+26^1+26^2+...+26^m  
而每个节点仅存储子分支的地址就需要26个地址,每个地址4字节.共104字节.如果再算上节点中额外的信息,26^m的节点消耗的空间非常大.
抛开应用场景就说"字典树因为不重复存储公共前缀,因此省空间",这是不负责任的.
## 和hash的对比

考虑到hash表也可以快速地完成字符串的计数,不免需要对比两者的优劣.  
假设单词个数为n,单词平均长度为m.则:  

- 时间
hash插入需要对字符串遍历以产生其对应的index值,因此插入是O(m).  
hash查找最优情况下是O(1),最差情况下是O(n).平均是O(1+a),其中a是均匀程度.  
可以看到hash的时间效率是不稳定的(依赖于优秀的hash函数),而字典树的效率就很稳定.  
hash表删除某个节点非常容易,将其地址对应的值置空即可.  
- 空间
每个输入都要对应一个地址,因此空间复杂度至少是O(n).由于考虑到冲突的影响,hash表的装载因子要设置得小一些,因此实际上hash的空间复杂度是大于O(n)的.


## 字典树的实现

只朴素地进行了实现.  

- 节点定义

    ```c++
    const short int MAX=26;
    const short int MAXLEN=16;
    struct Node
    {
        int count;
        Node* Sons[MAX];
        Node()
        {
            count=0;
            memset(Sons,0,sizeof(Sons));
        }
    };
    ```


- 类定义

    ```c++
    class Trie
    {
    public:
        Trie();
        ~Trie();
        void clear(Node* node);
        int insert(const char* word);
        int search(const char* word);
        void print(Node* root);
        void print();
    private:
        Node* root;
    };
    ```

- 插入数据

    ```c++
    int Trie::insert(const char* word)
    {
        int index=0;
        if(root==NULL)
            root=new Node();
        Node* current=root;
        while(*word!='\0')
        {
            if(*word>='a'&&*word<='z')
                index=*word-'a';
            else if(*word>='A'&&*word<='Z')
                index=*word-'A';
            else
                return -1;
            if(current->Sons[index]==NULL)
            {
                current->Sons[index]=new Node();
            }
            word++;
            current=current->Sons[index];
        }
        current->count++;
    }
    ```

- 查找数据

    ```c++
    int Trie::search(const char* word)
    {
        int index=0;
        if(root==NULL)
            return -1;
        Node* current=root;
        while(*word!='\0')
        {
            if(*word>='a'&&*word<='z')
                index=*word-'a';
            else if(*word>='A'&&*word<='Z')
                index=*word-'A';
            else
                return -1;
            if(current->Sons[index]==NULL)
            {
                return -1;
            }
            word++;
            current=current->Sons[index];
        }
        return 1;
    }
    ```

- 输出

    ```c++
    void Trie::print(Node* node)
    {
        static char str[MAXLEN+1];
        static int index=0;
        if(node==NULL)
            return;
        if(node->count)
        {
            str[index]='\0';
            cout<<str<<' '<<node->count<<endl;
        }
        for(int i=0;i<26;i++)
        {
            str[index++]='a'+i;
            print(node->Sons[i]);
            index--;
        }
    
    }
    void Trie::print()
    {
            print(root);
    }
    ```


## 知识延伸

以下引用转载自[结构之法 算法之道](http://blog.csdn.net/v_JULY_v/article/details/6897097)

- 有一个1G大小的一个文件，里面每一行是一个词，词的大小不超过16字节，内存限制大小是1M。返回频数最高的100个词。
- 1000万字符串，其中有些是重复的，需要把重复的全部去掉，保留没有重复的字符串。请怎么设计和实现？
- 一个文本文件，大约有一万行，每行一个词，要求统计出其中最频繁出现的前10个词，请给出思想，给出时间复杂度分析。
- 寻找热门查询：
搜索引擎会通过日志文件把用户每次检索使用的所有检索串都记录下来，每个查询串的长度为1-255字节。假设目前有一千万个记录，这些查询串的重复读比较高，虽然总数是1千万，但是如果去除重复和，不超过3百万个。一个查询串的重复度越高，说明查询它的用户越多，也就越热门。请你统计最热门的10个查询串，要求使用的内存不能超过1G。
(1) 请描述你解决这个问题的思路；
(2) 请给出主要的处理流程，算法，以及算法的复杂度。


## 参考资料

[资料一](http://www.cnblogs.com/dolphin0520/archive/2011/10/11/2207886.html)  
[资料二](http://www.cnblogs.com/tanky_woo/archive/2010/09/24/1833717.html)

<!--links-->
[trie-tree-pic]: /images/2013/trie-tree.jpg

