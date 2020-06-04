---
date: 20131113
tags: ["Algorithm"]
slug: "combine-letters"
title: "字母组合问题"
---



## Problem

写一个函数,打印两个string的字母组合,但各个字母必须保留在源字符串的字母顺序.比如:  

    input:str1="AB" str2="C"
    output:  
        ABC
        ACB
        CAB


    input:str1="AB" str2="BC"
    output:
        ABCD
        ACBD
        ACDB
        CABD
        CADB
        CDAB

## Analysis

和普通的全排列不同(话说全排列一直没弄明白),这里的场景需要保留源字符串的字母顺序.昨天在兰亭集势的笔试上没做出来,今天花了时间考虑:  

- 可以利用递归的思路
- 开辟一个足够长的全局数组.维护结果字符串的当前位置.当前字符只能来自str1或者str2.针对这两种情况分别进行递归.
- 当结果字符串的长度等于str1和str2的和时,输出字符串(递归返回)

## Implementation


```c++
const int MAXLEN=26;
int myIndex=0;
char result[MAXLEN-1];
int len=0;
void CombineLetter(const char* index1,const char* index2)
{
    if(myIndex==len)
    {
        result[myIndex+1]='\0';
        printf("%s\n", result);
        return;
    }
    if(*index1!='\0')
    {
        result[myIndex]=*index1;
        myIndex++;
        index1++;
        CombineLetter(index1,index2);

        index1--;
        myIndex--;
    }

    if(*index2!='\0')
    {
        result[myIndex]=*index2;
        index2++;
        myIndex++;
        CombineLetter(index1,index2);
        index2--;
        myIndex--;
    }
}
```

