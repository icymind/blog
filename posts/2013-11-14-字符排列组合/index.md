---
title: "字符排列组合"
slug: "permutation-and-combination-problem"
tags: ["Algorithm"]
---



对于字符排列组合的认知一直很模糊,曾经花了比较多的时间去试图搞清楚,过了一段时间,却还是忘得厉害,不懂从哪里下手解决.比如之前花很多时间看的问题:  
输入一个字符串,输出该字符串的全排列.  
今天完全想不起来当时是怎么理解的了,看来还是要写下来.只有能写清楚了,才说明自己真的理解了.  

## Quote

先看看别人怎么解释这个问题的.摘转[Hackbuteer1的专栏](http://blog.csdn.net/hackbuteer1/article/details/7462447)的部分说明:  

>全排列的递归实现  
为方便起见，用123来示例下。123的全排列有123、132、213、231、312、321这六种。首先考虑213和321这二个数是如何得出的。显然这二个都是123中的1与后面两数交换得到的。然后可以将123的第二个数和每三个数交换得到132。同理可以根据213和321来得231和312。因此可以知道——全排列就是从第一个数字起每个数分别与它后面的数字交换。找到这个规律后，递归的代码就很容易写出来了：

或许我的理解力有限,看了半天也无法明白.后来自己尝试从数学的角度来看待:  
数学上,求一个n个长度的字符串的全排列的总数,首先第1位可以有n种可能,第2位有n-1种可能,...,第n位有1种可能.总数为n的阶乘.  
程序的设计上也可以采用类似的方法:  

- 先将所有可能的字符取一个放在第1位.
- 将剩下的字符取一个放在第2位.
- ...

## Analysis

原理虽是如此,但是实现起来还是需要一点技巧.从这个角度看,昨日写的"字符组合"问题显得更为简单了,因为下一个字符的可能只有两种.但是在今天这个场景中,可能的字符是很多的.那么怎么将所有的可能的字符放到第1位呢?  
利用交换.用一个循环把字符串中的字符依次交换到第1位即可.比如说"123",第1位有3个可能:"1","2","3".通过1和1交换,1和2交换,1和3交换,我们就得到了第1位的三种可能:  
123,213,312.接下来就要解决第2位的问题.  

- 123
对123来说,1被固定了,第二位只有两种情况:2和3.因此理应得到"123"和"132"的组合.同样是利用交换,2和2交换得到123,2和3交换得到132.
- 213
同理,最终得到213和231
- 312
最终得到312和321.

由于确定了前两位,第三位只有一个选择,因此也在前面的步骤中被固定了.不需要再次进行考虑,需要做的只是第3位和第3位自身进行交换而已.  

从前面的分析可以看出,问题模式一样,且规模变小.可以利用递归进行解决.递归基就是"当前考虑的是第n+1位时".原因是n+1位是结束符'\0'.

## Implementation

```c++
void Permutation(char* pStr,char* pBegin)
{
    assert(pStr&&pBegin);
    if(*pBegin=='\0')
    {
        printf("%s\n",pStr);
        return;
    }
    else
    {
        for(char* it=pBegin;it!='\0';it++)
        {
            swap(*it,*pBegin);  //当前位和后面的字符依次交换,如123,1和2交换得到213
            Permutation(*pStr,pBegin+1);
            swap(*it,*pBegin);  //213还原为123,以便下次迭代能得到321.
        }
    }
}
```

## Duplicate Removal

更进一步,还需要考虑去重的问题。比如当输入122时，用上面的方法是不对的，会输出一些重复的数值。直观的去重方法是：  
比较即将要交换的两个字符，如果相等则不进行交换。还是拿122来说，第1位与各位交换后，可以得到122,212和221。（其实这里要得到122，也还需要做额外的处理，因为1和自身是相等的，按照规则不会进行处理).对第二位的各个情况：  

- 122
2和2相等，不进行交换。只会输出122.
- 212
输出212和221.
- 221
输出221和212.

可以看到，这个规则并不能得到预期的结果。原因在于，虽然1和后面两个2不等，但是交换之后，得到的数的后两位都是包含了1和2，虽然顺序不同（212和221）,但是进入深层的递归之后，交换得到的数是一样的。  
转换一种思路：  
当两个字符即将进行交换时，搜索当前字符之前的所有字符，如果有字符和当前字符相等。则表明不需要进行交换。比如准备交换122中的1和第2个'2'时，搜索发现，第2个'2'之前有字符和'2'相等，这表示如果还继续交换的话，未来将引入重复的值。

## Implementation Version2


```c++
bool IsSwap(char* pBegin,char* pEnd)
{
    for(char* it=pBegin;it<pEnd;it++)
    {
        if(*it==*pEnd)
            return false;
    }
    return true;
}
void PermutationVer2(char* pStr,char* pBegin)
{
    assert(pStr&&pBegin);
    if(*pBegin=='\0')
    {
        printf("%s\n",pStr);
        return;
    }
    else
    {
        for(char* it=pBegin;it!='\0';it++)
        {
            if(IsSwap(pBegin,it))
            {
                swap(*it,*pBegin);  //当前位和后面的字符依次交换,如123,1和2交换得到213
                Permutation(*pStr,pBegin+1);
                swap(*it,*pBegin);  //213还原为123,以便下次迭代能得到321.
            }
        }
    }
}
```

## Combination

组合问题要求输出集合中所有可能的组合.如"123"输出  

    {}
    {3 }
    {2 }
    {3 2 }
    {1 }
    {3 1 }
    {2 1 }
    {3 2 1 }
优雅的思路是用位运算求解.一个长度为n的字符串,每一位上的字母或者取或者不取,因此一共有2^n种可能组合.  
这2^n种组合,对应到二进制0->(2^n-1),这n个数,某一位上的1代表取该位的字符,0则相反.  
因此我们只要从0循环到2^n-1,每次查看当前的数字,输出为1的数位上对应的字符即可.

## Implementation of Combination


```c++
/*
 * 输入一个集合,输出该集合的组合
 */

#include <cstdio>
#include<cstring>
using namespace std;

void Print(char* str,int current)
{
    printf("{");
    for(int i=0;i<strlen(str);i++)
    {
        if(current&(1<<i))     //通过循环查看current中哪几位是1
            printf("%c ", str[strlen(str)-i-1]);  //对为1的位进行输出
    }
    printf("}\n");
}

int main()
{
    char str[]="123";
    for(int i=0;i<(1<<strlen(str));i++)
    {
        Print(str,i);
    }
    return 0;
}
```

---
## Extension

- 求两个字符串的组合,且字符要保持在源字符串的顺序.
    参阅另一篇博文[字母组合问题](http://www.heykings.com/post/algorithm/combine-letters)
- 八皇后问题
    用长度为8的数组columnIndex存储位置信息.columnIndex[i]=j表示第i行的皇后放置在第j列.用0->7对数组进行初始化,就保证了各行的皇后不会在同一列上.现在的问题就转换为"01234567"的全排列问题.  
    在产生一个排列后,我们只需再判断有没有某两个皇后在同一斜线上就可以了,在斜线上的皇后,有行列号有以下规律:  

    columnIndex[i]-columnIndex[j]==i-j
    或者
    columnIndex[i]-columnIndex[j]==j-i

    代码如下:

    ```c++
    /*用全排列解决八皇后问题 */
    #include <cstdio>
    #include <cstring>
    #include <iostream>
    using namespace std;

    int total=0;
    int columnIndex[8];

    bool IsCheck()
    {
        for(int i=0;i<8;i++)
        {
            for(int j=i+1;j<8;j++)
            {
                if(columnIndex[i]-columnIndex[j]==i-j||columnIndex[i]-columnIndex[j]==j-i)
                    return false;
            }
        }
        return true;
    }
    void Print()
    {
        printf("%d\n", total);
        for(int i=0;i<8;i++)
        {
            for(int j=0;j<8;j++)
            {
                if(j==columnIndex[i])
                    printf("X ");
                else
                    printf("O ");
            }
            printf("\n");
        }
    } 
    void Permutation(int current)
    {
        if(current==8)
        {
            if(IsCheck())
            {
                total++;
                Print();
            }
        }
        else 
        {
            for(int i=current;i<8;i++)
            {
                swap(columnIndex[current],columnIndex[i]);
                Permutation(current+1);
                swap(columnIndex[current],columnIndex[i]);
            }
        }
    }

    void Solution()
    {
        for(int i=0;i<8;i++)
            columnIndex[i]=i;
        Permutation(0);
    }
    int main()
    {
        Solution();
        return 0;
    }
    ```

PS:  
这种全排列求解八皇后问题的方法不是最快的,因为生成了很多不合格的方案,最后又进行筛选,时间效率上有一定的损失.更多的解法可以去看[N皇后问题的两个最高效的算法](http://blog.csdn.net/hackbuteer1/article/details/6657109)

- 输入两个整数n和m，从数列1,2,3...n中随意取几个数，使其和等于m，要求列出所有的组合。

