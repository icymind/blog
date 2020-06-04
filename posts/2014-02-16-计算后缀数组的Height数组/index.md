---
date: 20140216
tags: ["Algorithm"]
slug: "calculate-height-array"
title: "计算后缀数组的Height数组"
---



定义height[i]为suffix(sa[i-1])和suffix(sa[i])的最长公共前缀.对于j和k,假设rank[j]<rank[k],则:

suffix(j)和suffix(k)的最长公共前缀为height[rank[j]+1],height[rank[j]+2],height[rank[j]+3],...,height[rank[k]]中的最小值.

今天的要记录的是:如何快速地求出height数组的值.

## h数组

为了高效地求出height数组,引入h数组的定义:  
h[i]=height[rank[i]],即h[i]为suffix(i)和排名在它前一名的后缀的最长公共前缀.
那么h数组有一个重要的性质:  
`h[i]>=h[i-1]-1`

证明如下:  
假设suffix(k)是排在suffix(i-1)前一名的后缀,那么根据h数组的定义,他们的最长公共前缀为h[i-1].如果:  
①h[i-1]<=1,那么h[i]>=1-1=0成立.
②h[i-1]=1,那么表示suffix(k)和suffix(i-1)有至少有两个公共前缀字符.因此suffix(k+1)必定排在suffix(i)的前面.而且他们的公共前缀为h[i-1]-1.也就是h[i-1]-1是height[rank[k+1]+1],height[rank[k+1]+2],...height[rank[i]]之间的最小值,所以suffix(i)和在它前一名的后缀的最长后缀至少为h[i-1]-1.

## 代码实现

因为rank数组和SA数组互逆,因此由h[i]=height[rank[i]]可以得到height[i]=h[SA[i]].不用保存h数组就可以算出height数组:  

```c++
void CalHeight(int *SA,int *height,int n)
{
    int i,j,k=0;
    for(i=1;i<=n;i++)
        rank[sa[i]=i;
    for(i=0;i<n;i++)
    {
        if(k!=0)
            k=k-1;
        else
            k=0;
        j=sa[rank[i]-1]; //suffix(j)排在suffix(i)前一名
        while(r[i+k]==r[j+k])
            k++;
        height[rank[i]]=k;
    }
}
```

## 精简的代码

```c++
void CalHeight(int *source,int *SA,int *rank,int *height,int n)
{
    int i,j,k=0;
    for(i=1;i<=n;i++)   rank[SA[i]]=i;
    for(i=0;i<n;height[rank[i++]]=k)
        for(k?k--:0,j=SA[rank[i]-1];source[i+k]==source[j+k];k++);
    return;
}
```

## 参考:

[后缀数组-处理字符串的有力工具](https://www.dropbox.com/s/lkh0ca0d55fl5g0/%E5%90%8E%E7%BC%80%E6%95%B0%E7%BB%84%E2%80%94%E2%80%94%E5%A4%84%E7%90%86%E5%AD%97%E7%AC%A6%E4%B8%B2%E7%9A%84%E6%9C%89%E5%8A%9B%E5%B7%A5%E5%85%B7.pdf)

