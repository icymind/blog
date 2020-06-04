---
date: 20140111
tags: ["Algorithm"]
slug: "radix-sorting"
title: "基数排序"
---



我的上篇博客写了计数排序和桶排序,他们的效率很高,但是对输入数据的要求太过于苛刻.简单回顾下计数排序:  

输入:n个0-255之间的数字  
要使用计数排序,可以开辟一个256大小的数组counter,然后依次处理n个输入,将数字出现的次数记录到相应的counter位置中.接着用counter[i]=counter[i]+counter[i+1]更新counter,counter数组因此变成了index数组.最后利用index数组的信息,将原数组中数字依次放入结果数组中得最终位置.  

计数排序的局限性在于输入数据的数值范围不能太大,如果输入是n个1-1000000之间的数字,那么计数排序就会因为空间消耗太大而变得不实用.  

因此就放弃计数排序实在是太可惜了,O(n)的时间复杂度打着灯笼都找不到啊!感谢佛祖,我们还有基数排序.

## 什么是基数排序

计数排序和基数排序,光看名字就知道他们在搞基.实际上计数排序是基数排序的一个子过程,基数排序的应用范围要大得多.  

假设有n个int型(4个字节)整数,那么就可以这么处理:

- 根据低字节的0-255之内的数字对输入进行计数排序,得到结果Result1
- 根据次低字节的数字对Result1进行排序,得到结果Result2
- 根据次高字节的数字对Result2进行排序,得到结果Result3
- 最后根据最高字节的数字对Result3进行排序,得到最终结果Result.

举个栗子!  
有516,50397442,67306243,16908289,33817600这5个数字,对他们进行排序.用16进制能更清楚地观察这几个数在计算机内部表示,他们的16进制依次为:  

    0x00000204(10进制516)
    0x03010102(10进制50397442)
    0x04030303(67306243)
    0x01020001(16908289)
    0x02040400(33817600)

- Pass1
根据最低字节,对这5个数排序,得到Result1:

        0x02040400(33817600)
        0x01020001(16908289)
        0x03010102(50397442)
        0x04030303(67306243)
        0x00000204(516)

- Pass2
根据次低字节对数据计数排序(稳定排序),得到Result2:

        0x01020001(16908289)
        0x03010102(50397442)
        0x00000204(516)
        0x04030303(67306243)
        0x02040400(33817600)

- Pass3
同理得到Result3.

        0x00000204(516)
        0x03010102(50397442)
        0x01020001(16908289)
        0x04030303(67306243)
        0x02040400(33817600)

- Pass4
根据最高字节对Result3进行计数排序,得到最终结果Result:

        0x00000204(516)
        0x01020001(16908289)
        0x02040400(33817600)
        0x03010102(50397442)
        0x04030303(67306243)

## 基数排序的分析


对d个关键字,关键字最大值为r的n个数据,基数排序的时间复杂度为O(d(n+r)).针对32bit的数,基数排序进行了4趟计数排序,因此时间复杂度为4O(n+k)=O(n+k)=O(n+256)=O(n),空间复杂度和计数排序相同,都为O(n+k)

## 基数排序的实现

可以通过右移操作取得各个字节的数字:

    (arr[i]>>0)&0xff
    (arr[i]>>8)&0xff
    (arr[i]>>16)&0xff
    (arr[i]>>24)&0xff
来自[Radix Sort Tutorial](http://cubic.org/docs/radix.htm)的源代码,略作修改:

```C++
void radix(int pass,const int n,int* source,int* dest)
{
    int counter[256];
    memset(counter,0,sizeof(int)*256);
    for(int i=0;i<n;i++)
    {
        counter[(source[i]>>pass*8)&0xff]++;
    }
    for(int i=1;i<256;i++)
    {
        counter[i]=counter[i]+counter[i-1];
    }
    for(int i=n-1;i>=0;i--)
    {
        dest[--counter[(source[i]>>pass*8)&0xff]]=source[i];
    }
}
void RadixSort(int* arr,const int n)
{
    int* temp=new int[n];
    radix(0,n,arr,temp);
    radix(1,n,temp,arr);
    radix(2,n,arr,temp);
    radix(3,n,temp,arr);

    delete temp;
}
```

## 可以用于浮点数吗?


假设有两个浮点数A和B,他们的二进制编码为IR(A)和IR(B),如果有A>B>0,那么根据浮点数的表示方法,就有IR(A)>IR(B).可以参考[浮点数的二进制表示](http://www.ruanyifeng.com/blog/2010/06/ieee_floating-point_representation.html)和[Radix Sort Revisited](http://codercorner.com/RadixSortRevisited.htm).

因此,基数排序可以用在大于0的浮点数上.将int版本改成模板:

```C++
template <class T>
void radix(int pass,const int n,T* source,T* dest)
{
    int counter[256];
    memset(counter,0,sizeof(int)*256);
    for(int i=0;i<n;i++)
    {
        counter[(((unsigned int&)source[i])>>pass*8)&0xff]++;
    }
    for(int i=1;i<256;i++)
    {
        counter[i]=counter[i]+counter[i-1];
    }
    for(int i=n-1;i>=0;i--)
    {
        dest[--counter[(((unsigned int&)source[i])>>pass*8)&0xff]]=source[i];
    }
}
template <class T>
void RadixSort(T* arr,const int n)
{
    //int* temp=new int[n];
    T* temp=new T[n];
    radix(0,n,arr,temp);
    radix(1,n,temp,arr);
    radix(2,n,arr,temp);
    radix(3,n,temp,arr);
    delete temp;
}
```

## 那么,可以用于负数吗?

以上的程序用于有负数浮点数的数据,那么对于对应的输入,会得到以下的输出:

    2083.000000
    2785.000000
    8080.000000
    10116.000000
    10578.000000
    12974.000000
    -660.000000
    -4906.000000
    -10050.000000
    -16343.000000

可以看到结果(姑且称为Result数组)已经是部分排序了.正数部分已经是正确的顺序,负数部分是相反的顺序.那么我们只要找出有负数的个数negativeNumber,然后调整Result数组即可.

为了找出负数的个数,只需要挖掘包含在Result数组里的额外信息即可.  
有符号数的最高位是符号位,因此最后一趟计数排序中,只有7个bit位表示数据,表示范围只有-127到+127,二进制10000000到11111111都是表示负数,即把counter[128]到counter[255]中的数字加起来,就可以得到负数的个数negativeNumber了.  
接下来用negativeNumber来调整正数的index,最好将负数部分逆序. 
以下是适用于负数的基数排序源码:

```C++
template <class T>
void radix(int pass,const int n,T* source,T* dest)
{
    int counter[256];
    int negativeNumber=0;
    memset(counter,0,sizeof(int)*256);
    for(int i=0;i<n;i++)
    {
        counter[(((unsigned int&)source[i])>>pass*8)&0xff]++;
    }
    if(pass==3)
    {
        for(int i=128;i<256;i++)
        {
            negativeNumber+=counter[i];
        }
        counter[0]+=negativeNumber;
        for(int i=1;i<128;i++)
        {
            counter[i]=counter[i-1]+counter[i];
        }
        for(int i=129;i<256;i++)
        {
            counter[i]=counter[i-1]+counter[i];
        }
    }
    else
    {
        for(int i=1;i<256;i++)
        {
            counter[i]=counter[i]+counter[i-1];
        }
    }
    for(int i=n-1;i>=0;i--)
    {
        dest[--counter[(((unsigned int&)source[i])>>pass*8)&0xff]]=source[i];
    }
    for(int i=0;i<negativeNumber/2;i++)
    {
        Swap(&dest[i],&dest[negativeNumber-1-i]);
    }
}

template <class T>
void RadixSort(T* arr,const int n)
{
    T* temp=new T[n];
    radix(0,n,arr,temp);
    radix(1,n,temp,arr);
    radix(2,n,arr,temp);
    radix(3,n,temp,arr);
    delete temp;
}
```

## 另一个例子:对结构体排序

```c++
//基数排序练习:对结构体进行排序.
struct MyStruct
{
    int b;
    int a;
    MyStruct(int aa=0,int bb=0):a(aa),b(bb)
    {
    }
};
const int lenth=6;
const int max=10;
int a[lenth]={2,2,5,3,8,3};
int b[lenth]={7,1,4,3,2,2};
MyStruct MyArray[lenth];

int main()
{

    for(int i=0;i<lenth;i++)
    {
        MyStruct A(a[i],b[i]);
        MyArray[i]=A;
    }
    int counter[max];
    for(int i=0;i<max;i++)
        counter[i]=0;
    for(int i=0;i<lenth;i++)
    {
        counter[MyArray[i].a]++;
    }
    for(int i=1;i<max;i++)
        counter[i]+=counter[i-1];
    MyStruct Temp[lenth];
    for(int i=lenth-1;i>=0;i--)
        Temp[--counter[MyArray[i].a]]=MyArray[i];
    for(int i=0;i<max;i++)
        counter[i]=0;
    for(int i=0;i<lenth;i++)
    {
        counter[Temp[i].b]++;
    }
    for(int i=1;i<max;i++)
        counter[i]+=counter[i-1];
    for(int i=lenth-1;i>=0;i--)
        MyArray[--counter[Temp[i].b]]=Temp[i];
    return 0;
}
```

## 实现代码的细节

- 一定要保存上次排序的结果.在上次排序的基础上进行新的稳定排序
- 如果从n-1到0循环,以此得到排序数组.那么可以不用index数组,仅用counter数组即可.反过来,如果用上index数组,那么最后一步的循环,既可以从0到n-1,也可以从n-1到0,两种方向都能保证是稳定排序.

## PK快速排序

通过之前的分析,我们知道基数排序有O(n)的线性时间复杂度.另外,快速排序最佳情况下,有O(nlgn)的时间复杂度.那么实际情况如何?做个简单的测试.

- 生成测试数据

    ```c++
    #include <cstdlib>  //rand()函数需要的头文件
    #include <cstdio>   //freopen()函数需要的头文件
    using namespace std;

    int main()
    {
        freopen("/Users/ching/TestData.txt","w",stdout);
        for(int i=0;i<1000000;i++)
            printf("%d\n",rand()%9999999);
        fclose(stdout);
        return 0;
    }
    ```

- 测试排序的代码

    ```c++
    #include <iostream>  //cout需要
    #include <algorithm>  //qsort,sort需要
    #include <string.h>  //memset,memcpy需要
    using namespace std;
    
    const int Maxn=100000;
    int MyArray_1[Maxn];  //原始数据的拷贝
    int MyArray[Maxn];  //原始数据
    int Temp[Maxn];  //基数排序需要的临时数据
    
    int main()
    {
        long beginTime =clock();//获得开始时间，
        freopen("/Users/ching/10TestData.txt","r",stdin);
        for(int i=0;i<Maxn;i++)
        {
            scanf("%d",&MyArray[i]);
        }
        fclose(stdin);
        long endTime=clock();//获得结束时间
        cout<<"ReadData:"<<(double)(endTime-beginTime)/CLOCKS_PER_SEC<<endl;
    
        /*
         *测试自己实现的快排的效率
         */
        memcpy(MyArray_1,MyArray,sizeof(MyArray));
        beginTime =clock();//获得开始时间，
        QuickSort(MyArray_1,0,Maxn-1);
        endTime=clock();//获得结束时间
        cout<<"MyQuickSort:"<<(double)(endTime-beginTime)/CLOCKS_PER_SEC<<endl;
    
        /*
         *测试自己实现的基数排序的效率
         */
        memcpy(MyArray_1,MyArray,sizeof(MyArray));
        beginTime =clock();//获得开始时间，
        RadixSort(MyArray_1,Maxn);
        endTime=clock();//获得结束时间
        cout<<"RadixSort:"<<(double)(endTime-beginTime)/CLOCKS_PER_SEC<<endl;
        
        /*
         *测试C自带的快排qsort的效率
         */
        memcpy(MyArray_1,MyArray,sizeof(MyArray));
        beginTime =clock();//获得开始时间，
        qsort(MyArray_1,Maxn,sizeof(MyArray_1[0]),cmp);
        endTime=clock();//获得结束时间
        cout<<"qsort:"<<(double)(endTime-beginTime)/CLOCKS_PER_SEC<<endl;
    
        /*
         *测试C++STL中sort排序的效率
         */
        memcpy(MyArray_1,MyArray,sizeof(MyArray));
        beginTime =clock();//获得开始时间，
        sort(MyArray_1,MyArray_1+Maxn);
        endTime=clock();//获得结束时间
        cout<<"sort:"<<(double)(endTime-beginTime)/CLOCKS_PER_SEC<<endl;
    
        return 0;
    }
    ```

- 测试结果(编译参数默认)

| 数据规模     | 自己实现的快排    | 基数排序          | qsort             | sort              |
| --------     | --------------    | --------          | ---------         | ----------        |
| n=10,000,000 | 5.176/5.134/5.137 | 0.633/0.649/0.630 | 3.867/3.838/3.864 | 4.059/4.056/4.082 |
| n=1,000,000  | 0.433/0.436/0.426 | 0.060/0.061/0.060 | 0.335/0.328/0.339 | 0.126/0.131/0.134 |
| n=100,000    | 0.036/0.035/0.034 | 0.007/0.007/0.005 | 0.029/0.027/0.031 | 0.010/0.010/0.010 |

在每一种数据规模下,分别运行4种排序3次,记录如表格所示.可以看到,基数排序是最快的,其次是C++的sort函数,最后是C的qsort和自己实现的快排.  
PS:C++的sort函数做了很多优化,已经不是纯粹的快排了,而是融合了快速排序,堆排序,插入排序的一种排序方法.  
因此,如果平时需要排序,可以毫无犹豫地用sort()了,使用简单,而且10,000,000规模以下效率也很不错.如果有已经实现好的基数排序,而且不吝啬额外的存储空间,那么基数排序更加优秀(尤其是数据规模大的时候)

## 参考资料

[Radix Sort Tutorial](http://cubic.org/docs/radix.htm)  
[Radix Sort Revisited](http://codercorner.com/RadixSortRevisited.htm)

