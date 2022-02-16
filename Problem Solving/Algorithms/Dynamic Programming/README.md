## What is Dynamic Programming (IMO)
1. It is just literally a **Smart Brute Force** solution, nothing magical. We just need to notice the **overlap** between sub-problems, then make sure we solve each sub-problem only once, i.e. **no repeated work**.
2. Dynamic programming problems must be represented as a **Directed Acyclic Graph (DAG)**, and we would like to do something on that **DAG**.
3. **State** refers to the Dynamic Programming dimensions, and **Transition** is how we move from one state to the next one.
4. **Bottom UP** is the iterative version, and **Top-Down** is the recursive version.
5. I usually think about what I need to **Care About**, which is usually one of the three things:
   + Prefix (usually for Bottom UP Approach)
   + Suffix (usually for Top-Down Approach)
   + Sub-Array
6. Think about the order of calculating the sub-problems, i.e. **(if you want to solve a problem, you have to solve all of its sub-problems first).**
## Practice
+ **Videos**
  + [Back To Back SWE]() **(Playlist)**
+ **Problems**
  + [AtCoder DP Contest](https://atcoder.jp/contests/dp/tasks)
