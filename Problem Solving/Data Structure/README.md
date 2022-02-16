# Data Structure

## List Based Data Structure
<!-- List Based DS -->

<div align = "center">
  
|  Key  | Hash Table | Singly Linked List | Doubly Linked List | Stack | Queue
|:-----:|:----------:|:------------------:|:------------------:|:-----:|:-----:|
| Push  |O(N)| O(1)|O(1)|O(1)|O(1)
| Pop | O(N) | O(1) | O(1) | O(1) | O(1)
| Erase |O(N)|O(N)|O(N)|O(N)|O(N)
| Find |O(N)|O(N)|O(N)|O(N)|O(N)
| Memory |O(N)|O(N)|O(N)|O(N)|O(N)
| Notes |<ul> <li> The Asymptotic time complexity is Θ(1)</li> <li>Be aware about memory handling/problems</li> <li> Building may take <strong>O(N<sup>2</sup>)</strong> </li></ul>| ||||
</div>


## Graph Based Data Structure 

<!-- Graph Based DS -->
<div align = "center">
  <table>
    <thead>
      <tr>
        <th align= "center">Key</th>
        <th align= "center">Sparse Table</th>
        <th align= "center">Segment Tree</th>
        <th align= "center">Heap</th>
        <th align= "center">Trie</th>
        <th align= "center">Balanced BST</th>
        <th align= "center">BST</th>
        <th align= "center">DSU</th>
      </tr>
    </thead>
    <tbody>
    <!-- Build --> 
      <tr>
        <td align = "center">Build</td>    
        <td align = "center">O(N&nbsp;log<sub>2</sub>&nbsp;N)</td>
        <td align = "center">O(N)</td>
        <td align = "center">O(N)</td>
        <td align = "center">O(N&nbsp*&nbspAlphabet&nbspSize)</td>
        <td align = "center">O(N&nbsp;log<sub>2</sub>&nbsp;N)</td>
        <td align = "center"><strong>O(N<sup>2</sup>)</strong></td>
        <td align = "center">O(N)</td>
      </tr>
      <!-- Append --> 
      <tr>
        <td align = "center">Push</td>    
        <td align = "center">O(N log<sub>2</sub>&nbsp;N)</td>
        <td align = "center">O(log<sub>2</sub>&nbsp;N)</td>
        <td align = "center">O(log<sub>2</sub>&nbsp;N)</td>
        <td align = "center">O(M)</td>
        <td align = "center">O(log<sub>2</sub>&nbsp;N)</td>
        <td align = "center">O(N)</td>
        <td align = "center">O(1)</td> <!-- DO NOT FORGET TO NOTE THAT -->
      </tr>
      <!-- Erase -->
      <tr>
        <td align = "center">Erase</td>    
        <td align = "center">O(N log<sub>2</sub>&nbsp;N)</td>
        <td align = "center">O(log<sub>2</sub>&nbsp;N)</td>
        <td align = "center">O(log<sub>2</sub>&nbsp;N)</td>
        <td align = "center">O(M)</td>
        <td align = "center">O(log<sub>2</sub>&nbsp;N)</td>
        <td align = "center">O(N)</td>
        <td align = "center"><strong> ?? </strong></td> <!-- DO NOT FORGET TO NOTE THAT -->
      </tr>
      <!-- Find -->
      <tr>
        <td align = "center">Find</td>    
        <td align = "center">O(1)</td>
        <td align = "center">O(log<sub>2</sub>&nbsp;N)</td>
        <td align = "center">O(N)</td>
        <td align = "center">O(M)</td>
        <td align = "center">O(log<sub>2</sub>&nbsp;N)</td>
        <td align = "center">O(N)</td>
        <td align = "center">O(log&nbsp;N)</td>
      </tr>
      <!-- Memory -->
      <tr>
        <td align = "center">Memory</td>    
        <td align = "center">O(N log<sub>2</sub>&nbsp;N)</td>
        <td align = "center">O(N)</td>
        <td align = "center">O(N)</td>
        <td align = "center">O(N&nbsp*&nbspAlphabet&nbspSize)</td>
        <td align = "center">O(N)</td>
        <td align = "center">O(N)</td>
        <td align = "center">O(N)</td>
      </tr>
      <!-- Notes -->
      <tr>
        <td align = "center"> Notes </td>
        <td align = "left"> 
           <p> •&nbsp;Range&nbsp;Queries </p> 
           <p> •&nbsp;Immutable&nbsp;data </p> 
           <p> •&nbsp;Overlap&nbsp;friendly operations, or we will cascade the search </p>  
        </td>
        <td align = "left"> 
           <p> •&nbsp;Range&nbsp;Queries </p> 
           <p> •&nbsp;Can do range update with propagation </p> 
        </td>
        <td align = "left"> 
           <p> •&nbsp;Build in linear&nbsp;time </p> 
           <p> •&nbsp;Single misplaced&nbsp;node </p> 
        </td>
        <td align = "left"> 
           <p> •&nbsp;<strong>M</strong> is the length of the word </p>  
        </td>
        <td align = "left"> 
           <p> •&nbsp;AVL&nbsp;tree</p> 
        </td>
        <td align = "left"> </td>
        <td align = "left"> </td>
      </tr>
    </tbody>
  </table>
</div>
