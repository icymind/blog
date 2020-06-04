---
date: 20131113
tags: ["Algorithm"]
slug: "init-and-traverse-tree-by-level"
title: "按层次初始化/遍历二叉树"
---



按层次遍历二叉树的程序网上一大把,但是自己就没真的自己亲手去实现过.导致当出现新的需求时,没法立刻写出代码来.  
需求:按层次遍历二叉树,根节点为0层.偶数层从左到右输出,奇数层从右到左输出.每输出一层,就输出一个换行.  

## Kiss

开始拿到需求的时候,第一想法是用以前了解的方法,将节点压进队列,从队列头每弹出一个节点,就将该节点的儿子们压进队列结尾.  
这里与单纯的按层次遍历的不同之处在于:  

- 每层换行
- 奇偶层不同的打印顺序

当时是想通过循环解决这两个不同,每层节点数是2^i.输出这么多节点后就换行,同时依据i的奇偶性决定打印顺序.  
按道理来说应该也可以实现,只是需要小心翼翼地处理各种细节和边界,那时我被困扰了,没有写出来.  
更优雅一些,其实可以添加标志位,碰到换行标志位就换行,碰到奇偶标志位就做相应的输出处理.  
具体来说:  

- 将'+''-'做奇偶标志,用'$'做换行标志.
- 首先将奇偶标志压进队列,然后将root压进队列,最后是换行标志.
- 做以下循环直到队列为空:

    - 若队头为'-',且队列中还有树的节点,则将'-'变为'+'压入队列结尾.然后将队列头依次压入辅助栈中(直到队列头是'$'为止).依次打印辅助栈的元素,就完成了从左到右的打印顺序.此时队头元素是$,打印一个换行.如果队列中还有节点元素,将$压入队列末尾.继续下一次循环.
    - 若队头为'+',出栈,将其变成'-',视情况将其压入队尾.
    - 若对头为'$',出栈,打印换行符.视情况将其压入队尾.
    - 若是树的节点,则打印.
    - 若当前节点有非空的儿子节点,将儿子按从左到右的顺序压进队列.

以上的流程之所以能够实现功能,是因为交替变换奇偶标志,并利用辅助栈进行倒序输出.  
而换行标志每次都恰好放置在该层最后一个节点的末尾,因此能正确换行.

## 实现

- 换行打印

    ```c++
    void Tree::PrintByLevel()
    {
        list<Node*> nodesList;
        Node* endOfLine=new Node('$');
        nodesList.push_back(root);
        nodesList.push_back(endOfLine);
        while(!nodesList.empty())
        {
            Node* front=nodesList.front();
            if(front->data=='$')
            {
                printf(";\n");
                nodesList.pop_front();
                if(nodesList.size()>1)
                    nodesList.push_back(endOfLine);
            }
            else
            {
                printf("%c", front->data);
                nodesList.pop_front();
            }
            if(front->left!=NULL)
                nodesList.push_back(front->left);
            if(front->right!=NULL)
                nodesList.push_back(front->right);
        }
        delete endOfLine;
    }
    ```

- 按奇偶层次,不同顺序打印

    ```c++
    void Tree::PrintByLevelRev()
    {
        list<Node*> nodesList;
        Node* endOfLine=new Node('$');
        Node* flag=new Node('+');
        nodesList.push_back(flag);
        nodesList.push_back(root);
        nodesList.push_back(endOfLine);
        while(!nodesList.empty())
        {
            Node* front=nodesList.front();
            if(front->data=='-')
            {  
                nodesList.pop_front();
                flag->data='+';
                if(nodesList.size()>2)
                    nodesList.push_back(flag);
                stack<Node*> tempStack;
                while(nodesList.front()->data!='$')
                {
                    Node* tempFront=nodesList.front();
                    tempStack.push(tempFront);
                    nodesList.pop_front();
                    if(tempFront->left!=NULL)
                        nodesList.push_back(tempFront->left);
                    if(tempFront->right!=NULL)
                        nodesList.push_back(tempFront->right);
                }
                while(!tempStack.empty())
                {
                    printf("%c",tempStack.top()->data);
                    tempStack.pop();
                }
                continue;
            }
            if(front->data=='+')
            {
                nodesList.pop_front();
                flag->data='-';
                if(nodesList.size()>=2)
                    nodesList.push_back(flag);
            }
            if(front->data=='$')
            {
                printf(";\n");
                nodesList.pop_front();
                if(nodesList.size()>1)
                    nodesList.push_back(endOfLine);
            }
            if(front->data>='A'&&front->data<='Z')
            {
                printf("%c", front->data);
                nodesList.pop_front();
            }
            if(front->left!=NULL)
                nodesList.push_back(front->left);
            if(front->right!=NULL)
                nodesList.push_back(front->right);
        }
        delete endOfLine;
        delete flag;
    }
    ```

- 树的初始化

    为了验证打印的正确性,实现了一个初始化函数,接收一个按层次组织起来的节点的字符串表示,输出根节点. 

    ```c++
    Node* Tree::GenTreeByArray(const char* nodes)
    {
        if(nodes==NULL)
            return NULL;
        Node* nodesArray=new Node[strlen(nodes)];
        for(int i=0;i<strlen(nodes);i++)
        {
            nodesArray[i].
                data=nodes[i];
        }
        for(int i=0;i<strlen(nodes);i++)
        {
            Node* left=NULL;
            Node* right=NULL;
            if(2*i+1<strlen(nodes)&&nodesArray[2*i+1].data!='0')
                left=&nodesArray[2*i+1];
            if(2*i+2<strlen(nodes)&&nodesArray[2*i+2].data!='0')
                right=&nodesArray[2*i+2];
            nodesArray[i].left=left;
            nodesArray[i].right=right;
        }
        return &nodesArray[0];
    }
    ```



