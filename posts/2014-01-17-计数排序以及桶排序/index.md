+++
title = "计数排序以及桶排序"
slug = "counting-sort-and-bucket-sort"
tags = ["Algorithm"]
+++

## 何为计数排序

比如有10个数的数组arr=[0,4,39,0,2,44,39,6,4,0],范围是0-50,要求对这100个数进行排序.计数排序是这么做的(对这个简单的例子来说,计数排序并不是最优的):  

- 因为数值的范围是0-50,因此开辟一个大小为51的数组counter[],然后依次统计各个数字出现的次数,存入counter.
- 利用counter[i]=counter[i]+counter[i-1] (i>0)依次计算各个数字中最后一个数字的索引号,比如0出现次数有3次,最后一个0的索引便是3;1出现的次数是0,按理是没有索引的,但是为了迭代方便,也按照公式赋给他一个索引3;2出现的次数是1,索引值便是4.
- 从尾到头(若索引值记录的是同一个数值中最开始的数字的位置,则从头到尾进行处理.[参考1](http://cubic.org/docs/radix.htm),[参考2](http://www.cs.berkeley.edu/~jrs/61b/lec/35))依次处理原数组arr,按照索引值将数字放入结果数组中,每处理一个数组,便将该数组的索引值减一.比如0的索引是3,处理完最右边的0,索引值减一后,下一个0的索引值将是2.当然,由于数组下边是从0开始,最右的0真实索引值应该是2.因此可以统一先把索引值减一再进行处理.(由于原数组还在使用,因此需要开辟另外的数组保存结果)
- 最后得到的结果数组便是有序的,而且是稳定的.

## 计数排序的分析和使用情景

假设counter数组的大小为k,则由于还需要结果数组保存结果,因此计数排序的空间复杂度为O(k+n).时间上计数排序需.要初始化counter,迭代arr,迭代counter,迭代arr,因此时间复杂度为O(k+n+k+n)=O(k+n).

数字范围是0-50的10个数字序列的例子过于简单,考虑其他的情况:  

1. 1000个数字,数字的范围是1-2^31
2. 1000000个数字,数字范围是1-100
3. 1000000个数字,数字范围是999,999,000-1,000,000,000
4. 100个数字,数字范围是1-100.

情况1中如果用计数排序,将需要非常大的内存空间,而且初始化counter耗去大部分的时间.空间和时间效率上都比基于比较的排序方法差太多了(基于比较的排序方法的时间复杂度下限是O(nlg(n)) . 
情况2是典型的计数排序场景.  
情况3中虽然数字的数值很大,但是范围也仅仅在1000之内,开辟一个1001的数组也就足够了,也非常适合利用计数排序.  
情况4数字范围小,问题规模也小,这时候用计数排序效果就不明显了.虽然时间复杂度是O(n+k),看起来好像比基于比较的排序方法的O(nlg(n))好,但其实不然,原因是计数排序的系数比较大,问题上了规模才能体现他的效率.

**综上所述,只有问题规模大,数字范围小时,才比较适合使用计数排序**

## 计数排序的实现

根据第一部分的说明,不难得出计数排序的实现:

- Version_1

    ```c++
    int CountingSort(int* arr,int* output,const int k)
    //arr为需要排序的数组,output为排序结果,k为输入中可能的最大值
    //返回0表示排序成功,否则失败
    {
        int* counter=new int[k+1];
        if(!counter)
            return 1;
        memset(counter,0,sizeof(int)*(k+1));
        for(int i=0;i<n;i++)
        {
            counter[arr[i]]++;
        }
        for(int i=1;i<=k;i++)
        {
            counter[i]+=counter[i]+counter[i-1];
        }
        for(int i=n-1;i>=0;i--)
        {
            output[--counter[arr[i]]]=arr[i];
        }
        delete counter;
        return 0;
    }
    ```

- Version_2

    版本1在网上比较常见,但是只有最大值k而没有最小值,不能处理情况3.可以略作修改:

    ```c++
    int CountingSort(int* arr,int* output,const int max,const int min)
    //arr为需要排序的数组,output为排序结果,max为输入中可能的最大值,min为可能的最小值
    //返回0表示排序成功,否则失败
    {
        int* counter=new int[max-min+1];
        if(!counter)
            return 1;
        memset(counter,0,sizeof(int)*(k+1));
        for(int i=0;i<n;i++)
        {
            counter[arr[i]]++;
        }
        for(int i=1;i<=k;i++)
        {
            counter[i]+=counter[i]+counter[i-1];
        }
        for(int i=n-1;i>=0;i--)
        {
            output[--counter[arr[i]]]=arr[i];
        }
        delete counter;
        return 0;
    }
    ```

- Version_3

    当然,也可以将结果直接复制到原数组中,版本3原型:  
    `int CountingSort(int* arr,const int max,const int min)`

- Version_4:基数排序

    早些时候,我对计数排序的理解是这样的:开辟足够大的数组counter,依次对原数组arr的元素进行计数,将counter数组*中的数字依次打印.  
    源代码:  

    ```c++
    int CountingSort(int* arr,const int max)
    //arr为需要排序的数组,max为输入中可能的最大值
    //返回0表示排序成功,否则失败
    {
        int* counter=new int[max+1];
        if(!counter)
            return 1;
        memset(counter,0,sizeof(int)*(k+1));
        for(int i=0;i<n;i++)
        {
            counter[arr[i]]++;
        }
        int k=0;
        for(int i=0;i<n;i++)
        {
            for(int j=0;j<counter[i];j++)
            {
                arr[k++]=i;
            }
        }
        delete counter;
        return 0;
    }
    ```

当然这个版本只能处理裸数据(没有其他卫星数据),而不像之前的版本一样可以处理一些复合数据(有其他数据附加在键上).   


[参考3](https://www.byvoid.com/blog/sort-radix)中说:

>不过这种方法不再是计数排序，而是桶排序(Bucket Sort)，确切地说，是桶排序的一种特殊情况。

但是我觉得这两者并没有本质区别


## 何为桶排序

有时候,当数据数值范围太大时,我们无法开出足够大的数组,这时候又该怎么办?  
比如有100w个数据,数据范围0-100w.那么我们可以开辟出1000个桶(bucket),第一个桶存放0-999这1000个数,第二个桶存放1000-1999这1000个数...以此类推.将数据全部分配到桶中之后,再依次对有数据的桶进行排序(可以采用插入排序,计数排序等稳定排序方法),最后再依次将所有桶中的数据串在一起即可.  
这就是桶排序.)


## 计数排序和桶排序的区别

按照我的理解,其实计数排序和桶排序并没有本质上得区别.计数排序仅仅是桶排序的一种特殊情况(在这种情况下,每个桶中只放相同的数值.而其他情况每个桶要放若干个数值.而由于计数排序中每个桶的数值相等,也就免去了对桶中数据进行排序的过程).  
桶排序要想得到较好的效率,还必须要求输入数据是均匀分布在各个桶中的,这种情况下,桶排序以*线性期望时间运行*.如果不幸所有数据都落入了同一个桶中,那么桶排序的时间复杂度就取决于对桶中数据采取的排序方法了. 
因此,除了对内存的需求不同外,计数排序和桶排序的第二个区别就是:是否要求输入数据符合正态分布..无论数据分布如何,计数排序的效率不会受到影响.

## 桶排序的效率分析

关于桶排序的效率分析,<<算法导论>>中有大篇幅的推导,看不明白.   
倒是比较认可[参考6](http://hxraid.iteye.com/blog/647759)中的分析:

>
对于N个待排数据，M个桶，平均每个桶[N/M]个数据的桶排序平均时间复杂度为：  
    `O(N)+O(M*(N/M)*log(N/M))=O(N+N*(logN-logM))=O(N+N*logN-N*logM)`  
当N=M时，即极限情况下每个桶只有一个数据时。桶排序的最好效率能够达到O(N)。

## 桶排序的实现

**桶排序应用范围比较窄,他的具体设计与应用场景是息息相关的,实现高效实用的桶排序,需要对输入数据的分布有清晰的了解.**

- 场景一:

    比如有10w个0-99的数据,那么我开10个桶就行了.(显然这种情况下用计数排序更好).  

- 场景二:

    如果换成10w个数,每个数或者是0-99之间某个数,或者是9000000-9000099之间的某个数(这种情况,计数排序要开出9000100的数组,显然下标100-9000000之间浪费了),这时可以开20个桶,前10个放0-99的数,后10个桶放置9000000-9000099之间的数.

针对场景一,[参考6](http://hxraid.iteye.com/blog/647759)中有一个具体的实现:  

```c++
#include<iostream.h>  
#include<malloc.h>  
  
typedef struct node{  
    int key;  
    struct node * next;  
}KeyNode;  
  
void inc_sort(int keys[],int size,int bucket_size){  
    KeyNode **bucket_table=(KeyNode **)malloc(bucket_size*sizeof(KeyNode *));  
    for(int i=0;i<bucket_size;i++){  
        bucket_table[i]=(KeyNode *)malloc(sizeof(KeyNode));  
        bucket_table[i]->key=0; //记录当前桶中的数据量  
        bucket_table[i]->next=NULL;  
    }  
    for(int j=0;j<size;j++){  
        KeyNode *node=(KeyNode *)malloc(sizeof(KeyNode));  
        node->key=keys[j];  
        node->next=NULL;  
        //映射函数计算桶号  
        int index=keys[j]/10;  
        //初始化P成为桶中数据链表的头指针  
        KeyNode *p=bucket_table[index];  
        //该桶中还没有数据  
        if(p->key==0){  
            bucket_table[index]->next=node;  
            (bucket_table[index]->key)++;  
        }else{  
            //链表结构的插入排序  
            while(p->next!=NULL&&p->next->key<=node->key)  
                p=p->next;     
            node->next=p->next;  
            p->next=node;  
            (bucket_table[index]->key)++;  
        }  
    }  
    //打印结果  
    for(int b=0;b<bucket_size;b++)  
        for(KeyNode *k=bucket_table[b]->next; k!=NULL; k=k->next)  
            cout<<k->key<<" ";  
    cout<<endl;  
}  
  
void main(){  
    int raw[]={49,38,65,97,76,13,27,49};     
    int size=sizeof(raw)/sizeof(int);     
    inc_sort(raw,size,10);  
}  
```

## 参考资料
- [radix](http://cubic.org/docs/radix.htm)  
- [参考2](http://www.cs.berkeley.edu/~jrs/61b/lec/35)  
- [sort-radix](https://www.byvoid.com/blog/sort-radix)   
- [参考4](http://www.cnblogs.com/CSharpSPF/p/3242214.html)  
- [参考5](http://www.ahathinking.com/archives/126.html)  
- [参考6](http://hxraid.iteye.com/blog/647759)
