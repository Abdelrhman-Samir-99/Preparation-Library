# Graph
A graph is a data structure that is used to represent data and the relation between it.
## Traversal
<!-- Graph Traversal -->
<div align = "center">
  <table>
    <thead>
      <tr>
        <th align= "center">Key</th>
        <th align= "center">DFS (In-Order)</th>
        <th align= "center">BFS</th>
        <th align= "center">Pre-Order</th>
        <th align= "center">Post-Order</th>
        <th align= "center">Morris</th>
      </tr>
    </thead>
    <tbody>
    <!-- Time Complexity --> 
      <tr>
        <td align = "center">Time Complexity</td>    
        <td align = "center">O(|E| + |V|)</td>
        <td align = "center">O(|E| + |V|)</td>
        <td align = "center">O(|E| + |V|)</td>
        <td align = "center">O(|E| + |V|)</td>
        <td align = "center">O(|E|&nbsp;+&nbsp;|V|)</td>
      </tr>
      <!-- Space Complexity--> 
      <tr>
        <td align = "center">Space Complexity</td>
        <td align = "center">O(H)</td>
        <td align = "center">O(W)</td>
        <td align = "center">O(H)</td>
        <td align = "center">O(H)</td>
        <td align = "center">O(1)</td>
      </tr>
      <!-- Notes -->
      <tr>
        <td align = "center">Notes</td>
        <td align = "left">
          <p> •&nbsp; Constant space if we don't&nbsp;consider stack size </p>
          <p> •&nbsp; (Left - Root - Right) </p>
          <p> •&nbsp; Depth First </p>
        </td>
        <td align = "left">
          <p> •&nbsp; Used to serialize a Binary Tree </p>
          <p> •&nbsp; Layer By&nbsp;Layer </p>
         </td>
        <td align = "leftr">
          <p> •&nbsp; Constant space if we don't&nbsp;consider stack size </p>
          <p> •&nbsp; Used to serialize a Binary Tree </p>
          <p> •&nbsp; (Root - Left - Right) </p>
        </td>
        <td align = "left">
          <p> •&nbsp; Constant space if we don't&nbsp;consider stack size </p>
          <p> •&nbsp; Visit all the children before the root </p>
          <p> •&nbsp; (Left - Right - Root) </p>
        </td>
        <td align = "left"> <strong> Didn't study yet </strong></td>
      </tr>
    </tbody>
  </table>
</div>


## Shortest Path on weighted graphs
<!-- Graph Shortest Path -->
<div align = "center">
  <table>
    <thead>
      <tr>
        <th align= "center">Key</th>
        <th align= "center">Dijkstra</th>
        <th align= "center">Floyd-Warshall</th>
        <th align= "center">Bellman-Ford</th>
        <th align= "center">Dynamic Programming (DAG)</th>
        <th align= "center">Bidirectional</th>
      </tr>
    </thead>
    <tbody>
    <!-- Time Complexity --> 
      <tr>
        <td align = "center">Time Complexity</td>    
        <td align = "center">O(|V| + |E|&nbsp;log<sub>2</sub>&nbsp;|V|)</td>
        <td align = "center"><strong>O(|V|<sup>3</sup>)</strong></td>
        <td align = "center">O(|E| * |V|) =&nbsp;O(|V|<sup>3</sup>)</td>
        <td align = "center">O(|E| + |V|)</td>
        <td align = "center"></td>
      </tr>
      <!-- Space Complexity--> 
      <tr>
        <td align = "center">Space Complexity</td>
        <td align = "center">O(|E| + |V|)</td>
        <td align = "center"><strong>O(|V|<sup>2</sup>)</strong></td>
        <td align = "center">O(|V|)</td>
        <td align = "center">O(|V|)</td>
        <td align = "center"></td>
      </tr>
      <!-- Notes -->
      <tr>
        <td align = "center">Notes</td>
        <td align = "left">
          <p> •&nbsp; Doesn't work on negative weights </p>
          <p> •&nbsp; Single source shortest path </p>
          <p> •&nbsp; Another implementation using adjacency matrix </p>
        </td>
        <td align = "left">
          <p> •&nbsp; Multi source shortest path </p>
          <p> •&nbsp; Works with negative weights </p>
        </td>
        <td align = "leftr">
          <p> •&nbsp; Multi source shortest path </p>
          <p> •&nbsp; Works with negative weights </p>
          <p> •&nbsp; May end early </p>
        </td>
        <td align = "left">
          <p> •&nbsp; Single source shortest path </p>
          <p> •&nbsp; Works with negative weights </p>
          <p> •&nbsp; Must be DAG </p>
        </td>
        <td align = "left"> <strong> Didn't study yet </strong></td>
      </tr>
    </tbody>
  </table>
</div>


<h2> Minimum Spanning Tree (MST) </h2>
<!-- Spanning Tree -->
<div align = "center">
  <table>
    <thead>
      <tr>
        <th align= "center">Key</th>
        <th align= "center">Kruskal</th>
        <th align= "center">Prim</th>
      </tr>
    </thead>
    <tbody>
    <!-- Time Complexity --> 
      <tr>
        <td align = "center">Time Complexity</td>    
        <td align = "center">O(|E|&nbsp;log<sub>2</sub>&nbsp;|V|)</td>
        <td align = "center"></td>
      </tr>
      <!-- Space Complexity--> 
      <tr>
        <td align = "center">Space Complexity</td>
        <td align = "center">O(|E| + |V|)</td>
        <td align = "center"></td>
      </tr>
      <!-- Notes -->
      <tr>
        <td align = "center">Notes</td>
        <td align = "left">
          <p> •&nbsp; Sorting edges + DSU </p>
        </td>
        <td align = "left">
          Didn't study yet
        </td>
      </tr>
    </tbody>
  </table>
</div>


<h2> Strongly Connected Components (SCC) </h2>
<!-- Strongly Connected Components -->
<div align = "center">
  <table>
    <thead>
      <tr>
        <th align= "center">Key</th>
        <th align= "center">Tarjan</th>
        <th align= "center">Kosaraju</th>
      </tr>
    </thead>
    <tbody>
    <!-- Time Complexity --> 
      <tr>
        <td align = "center">Time Complexity</td>    
        <td align = "center">O(|E| + |V|)</td>
        <td align = "center"></td>
      </tr>
      <!-- Space Complexity--> 
      <tr>
        <td align = "center">Space Complexity</td>
        <td align = "center">O(|V|)</td>
        <td align = "center"></td>
      </tr>
      <!-- Notes -->
      <tr>
        <td align = "center">Notes</td>
        <td align = "left">
          <p> •&nbsp; Stack + timers </p>
        </td>
        <td align = "left">
          <strong> Didn't study yet </strong>
        </td>
      </tr>
    </tbody>
  </table>
</div>

<h2> Topological Sorting </h2>
<!-- Topological Sorting -->
<div align = "center">
  <table>
    <thead>
      <tr>
        <th align= "center">Key</th>
        <th align= "center">DFS</th>
        <th align= "center">BFS (Kahn's Algorithm)</th>
      </tr>
    </thead>
    <tbody>
    <!-- Time Complexity --> 
      <tr>
        <td align = "center">Time Complexity</td>    
        <td align = "center">O(|E| + |V|)</td>
        <td align = "center">O(|E| + |V|)</td>
      </tr>
      <!-- Space Complexity--> 
      <tr>
        <td align = "center">Space Complexity</td>
        <td align = "center">O(|V|)</td>
        <td align = "center">O(|V|)</td>
      </tr>
      <!-- Notes -->
      <tr>
        <td align = "center">Notes</td>
        <td align = "left">
          <p> •&nbsp;Must be a DAG </p>
        </td>
        <td align = "left">
          <p> •&nbsp;Must be a DAG </p>
        </td>
      </tr>
    </tbody>
  </table>
</div>

<h2> Bipartite Test </h2>
<!-- Bipartite Test -->
<div align = "center">
  <table>
    <thead>
      <tr>
        <th align= "center">Key</th>
        <th align= "center">DFS</th>
        <th align= "center">BFS</th>
      </tr>
    </thead>
    <tbody>
    <!-- Time Complexity --> 
      <tr>
        <td align = "center">Time Complexity</td>    
        <td align = "center">O(|E| + |V|)</td>
        <td align = "center">O(|E| + |V|)</td>
      </tr>
      <!-- Space Complexity--> 
      <tr>
        <td align = "center">Space Complexity</td>
        <td align = "center">O(|V|)</td>
        <td align = "center">O(|V|)</td>
      </tr>
      <!-- Notes -->
      <tr>
        <td align = "center">Notes</td>
        <td align = "left">
          <p></p>
        </td>
        <td align = "left">
        </td>
      </tr>
    </tbody>
  </table>
</div>
