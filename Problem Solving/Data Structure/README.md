# Data Structure

## List Based Data Structure
<div align = "center">

|  Key  | Hash Table | Singly Linked List | Doubly Linked List | Stack | Queue
|:-----:|:----------:|:------------------:|:------------------:|:-----:|:-----:|
| Append  |O(N)| O(1)|O(1)|O(1)|O(1)
| Pop | O(N) | O(1) | O(1) | O(1) | O(1)
| Erase |O(N)|O(N)|O(N)|O(N)|O(N)
| Find |O(N)|O(N)|O(N)|O(N)|O(N)
| Memory |O(N)|O(N)|O(N)|O(N)|O(N)
| Notes |<ul> <li> The Asymptotic time complexity is Θ(1)</li> <li>Be aware about memory handling/problems</li></ul>| ||||
</div>


## Graph Based Data Structure 
<div align = "center">

|  Key  | Sparse Table | Segment Tree | Heap | Trie | Balanced BST | BST | DSU |
|:-----:|:------------:|:------------:|:----:|:----:|:------------:|:---:|:----:|
| Build | O(N log<sub>2</sub>&nbsp;N) | O(N) | O(N) | O(N) | O(N log<sub>2</sub>&nbsp;N) | **O(N<sup>2</sup>)**| O(N) |
| Append  |O(N log<sub>2</sub>&nbsp;N)| O(log<sub>2</sub>&nbsp;N)|O(log<sub>2</sub>&nbsp;N)| O(M)|O(log<sub>2</sub>&nbsp;N)| O(N) | O(log<sub>2</sub>&nbsp;N)|
| Erase |O(N log<sub>2</sub>&nbsp;N)| O(log<sub>2</sub>&nbsp;N)|O(log<sub>2</sub>&nbsp;N)| O(M)|O(log<sub>2</sub>&nbsp;N)| O(N)| **??**
| Find |O(1)|O(log<sub>2</sub>&nbsp;N)|O(N)|O(M)|O(log<sub>2</sub>&nbsp;N)| O(N)| O(log<sub>2</sub>&nbsp;N)
| Memory |O(N log<sub>2</sub>&nbsp;N)|O(N)|O(N)|O(N)|O(N)| O(N)| O(N)
| Notes |<ul> <li> Range&nbsp;Queries </li> <li> Immutable&nbsp;data </li> <li> Overlap&nbsp;friendly operations, or we will cascade the search </li> </ul>| <ul> <li> Range&nbsp;Queries </li> <li> Can do range update with propagation </li> </ul>| <ul> <li> Build in linear time </li> <li> Single misplaced node </li> </ul> | <ul> <li> **M** is the length of the word </li> <li>The space complexity I&nbsp;believe is **Alphabet size * N** </li> </ul> | <ul> <li> AVL&nbsp;tree</li> </ul> | |
</div>
