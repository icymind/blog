---
date: 2014-02-13
tags: ["Algorithm"]
slug: "difference-cover-modulo-algorithm"
title: "后缀数组DC3构造算法的理解"
---



DC3算法(Difference Cover Modulo 3 Algorithm)最早由Karkkainen在论文[Simple Linear Work Suffix Array Construction](https://www.dropbox.com/s/d0sle7cssfx1l43/simple%20linear%20work%20su%EF%AC%83x%20array%20construction_dc3.pdf)中发表.罗穗骞在[后缀数组-处理字符串的有力工具](https://www.dropbox.com/s/lkh0ca0d55fl5g0/%E5%90%8E%E7%BC%80%E6%95%B0%E7%BB%84%E2%80%94%E2%80%94%E5%A4%84%E7%90%86%E5%AD%97%E7%AC%A6%E4%B8%B2%E7%9A%84%E6%9C%89%E5%8A%9B%E5%B7%A5%E5%85%B7.pdf)一文中做了中文解释,本文在罗穗骞文章的基础上进行理解.

## DC3算法的思想

按照论文中提到的,DC3算法分3步(详情参见原文)：

- 先将后缀分成suffix(i)(i%3!=0)和suffix(i)(i%3==0)两部分，然后对第一部分的后缀排序。
- 利用第一步的结果,对第二部分的后缀排序.
- 将前两步的排序结果进行合并.

对第一部分的后缀进行排序,论文采用的方法是:
>做法是将suffix(1)和suffix(2)连接，如果这两个后缀的长度不是3的倍数，那先各自在末尾添0使得长度都变成3的倍数。然后每3个字符为一组，进行基数排序，将每组字符“合并”成一个新的字符。然后用递归的方法求这个新的字符串的后缀数组在得到新的字符串的sa后，便可以计算出原字符串所有起始位置模3不等于0的后缀的sa。要注意的是，原字符串必须以一个最小的且前面没有出现过的字符结尾，这样才能保证结果正确（请读者思考为什么）。


### 第一个问题:
为什么如此做就可以求出第一部分后缀的顺序了?

以图示(我修正了原文的图,将排序的下标改为从0开始,变得和原文程序一致)讲解:  
![dc3][dc3-pic]

将suffix(1)(补齐3的倍数)和suffix(2)(补齐3的倍数)接在一起后,每3个字符就表示了某个suffix(i)(i%3!=0)的前3个字符,上图的中间部分,从左到右:"aba"表示suffix(1)的前3个字符,"aaa"表示suffix(4)的前3个字符,"ba0"表示suffix(7)的前3个字符,"baa"表示suffix(2)的前3个字符....如上图的下部所示,将3字符长度的排序结果串成新的字符串rn="314520",如果rn中的字符各不相同,那么suffix(i)(i%3!=0)的排序结果即可求出.从rn可以得出这样的信息:suffix(8)<suffix(4)<suffix(5)<suffix(1)<suffix(7)<suffix(2).

如果rn中有相同的字符,比如说rn="314120",表示suffix(4)和suffix(2)还无法比较出大小,那么需要递归求解.

### 第二个问题:
为什么原字符串必须以一个最小的且前面没有出现过的字符结尾，这样才能保证结果正确?

假设字符串从"aabaaaaba0"变为"aabaaaabaa",那么图示将变成:  
![dc3_1][dc3_1-pic]

可以看到,末尾的0变成a后,导致suffix(7)和suffix(2)的前3个字符相等,于是排序后得到的新字符串rn变成"314420",新字符串中suffix_rn(3) < suffix_rn(2).于是rn将视为"315420",可以看到rn的SA数组为{3,1,5,4,2,0}.对应到原始字符串r,suffix(2)将会排到suffix(7)前面,这是错误的顺序.

#### 源码的理解

```c
//Difference Cover modulo 3 Algorithm
#include <cstdio>
using namespace std;

const int maxn=256;
//F(x)由3个字符的排序,计算出新字符串rn
#define F(x) ((x)/3+((x)%3==1?0:tb))

//G(x)是F(x)的逆运算
#define G(x) ((x)<tb?(x)*3+1:((x)-tb)*3+2) 

int wa[maxn],wb[maxn],wv[maxn],ws[maxn]; 

//c0函数判断是否3个字符都相等
int c0(int *r,int a,int b) 
{return r[a]==r[b]&&r[a+1]==r[b+1]&&r[a+2]==r[b+2];} 

//c12函数用于比较suffix(a)(a%3==0)和suffix(b)(b%3!=0)的大小
int c12(int k,int *r,int a,int b) 
{if(k==2) return r[a]<r[b]||r[a]==r[b]&&c12(1,r,a+1,b+1); 
    else return r[a]<r[b]||r[a]==r[b]&&wv[a+1]<wv[b+1];} 

/*
 基数排序.r存放数据,a中存放待排序字符的下标,b存放3长度字符串的首字符下标
*/
void sort(int *r,int *a,int *b,int n,int m) 
{ 
    int i; 
    for(i=0;i<n;i++) wv[i]=r[a[i]]; 
    for(i=0;i<m;i++) ws[i]=0; 
    for(i=0;i<n;i++) ws[wv[i]]++; 
    for(i=1;i<m;i++) ws[i]+=ws[i-1]; 
    for(i=n-1;i>=0;i--) b[--ws[wv[i]]]=a[i]; 
    return; 
}
void dc3(int *r,int *sa,int n,int m)
{
    int i,j,*rn=r+n,*san=sa+n,ta=0,tb=(n+1)/3,tbc=0,p; 
    
    //为排序方便,r[n]=r[n+1]=0
    r[n]=r[n+1]=0; 

    //将第一部分后缀的下标存入wa
    for(i=0;i<n;i++) if(i%3!=0) wa[tbc++]=i; 

    //3长度字符串按第3位做基数排序
    sort(r+2,wa,wb,tbc,m); 
    //3长度字符串按第2位做基数排序
    sort(r+1,wb,wa,tbc,m); 
    //3长度字符串按第1位做基数排序,此部做完,即可得到3长度字符串的大小顺序,存入wb数组.
    sort(r,wa,wb,tbc,m); 

    //由3长度字符串的顺序计算出新字符串rn
    for(p=1,rn[F(wb[0])]=0,i=1;i<tbc;i++) 
        rn[F(wb[i])]=c0(r,wb[i-1],wb[i])?p-1:p++; 

    //若rn中存在相同的字符,进行递归求解.
    if(p<tbc) dc3(rn,san,tbc,p); 
    //否则,可直接得到新字符串的SA数组
    else for(i=0;i<tbc;i++) san[rn[i]]=i;

    //根据san数组,求得第二部分后缀的排序(按照第二关键字排序),将下标存入wb数组.
    for(i=0;i<tbc;i++) if(san[i]<tb) wb[ta++]=san[i]*3; 
    //如果n%3==1,需要做特殊处理.因为san中并不包含suffix(n-1)
    if(n%3==1) wb[ta++]=n-1; 
    
    //对wb数组按第一关键字排序,将第二部分后缀的排序结果存入wa数组
    sort(r,wb,wa,ta,m); 

    //做两部分的合并
    for(i=0;i<tbc;i++) wv[wb[i]=G(san[i])]=i; 
    for(i=0,j=0,p=0;i<ta && j<tbc;p++) 
        sa[p]=c12(wb[j]%3,r,wa[i],wb[j])?wa[i++]:wb[j++]; 
    for(;i<ta;p++) sa[p]=wa[i++]; 
    for(;j<tbc;p++) sa[p]=wb[j++]; 
    return; 
}

void print_str(int* array,int* source,const int n)
{
    for(int i=1;i<n;i++)
    {
        printf("%2d | ",i-1);
        for(int j=array[i];j<n;j++) 
        {
            printf("%c",source[j]);
        }
        printf("\n");
    }
}

int main()
{
    char *str="aabaaaaba$";
    const int strlen=10;
    //source数组和SA数组设置为strlen的三倍,避免在dc3算法中动态申请数组
    int source[strlen*3];
    for(int i=0;i<strlen;i++)
        source[i]=(int) str[i];
    int SA[strlen*3]={0};
    dc3(source,SA,strlen,maxn);
    print_str(SA,source,strlen-1);
    return 0;
}
```

## 参考
[DC3算法理解记录](http://blog.sina.com.cn/s/blog_79dfe12701017566.html)

<!--link-->
[dc3-pic]: /images/2014/dc3.jpg
[dc3_1-pic]: /images/2014/dc3_1.jpg

