# Algorithms

## Graphs
### Graph Traversal
<!-- Graph Based DS -->
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
    <!-- Time Comlexity --> 
      <tr>
        <td align = "center">Time Complexity</td>    
        <td align = "center">O(N)</td>
        <td align = "center">O(N)</td>
        <td align = "center">O(N)</td>
        <td align = "center">O(N)</td>
        <td align = "center">O(N)</td>
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
