## Sorting Algorithms
### Merge Sort
+ **Videos**
  + [Abdul Bari](https://www.youtube.com/watch?v=mB5HXBb_HY8)
  + [Hacker Rank](https://www.youtube.com/watch?v=KF2j-9iSf4Q)
  + [Michael Sambol](https://www.youtube.com/watch?v=4VqmGXwpLqc&ab_channel=MichaelSambol)
+ **Articles**
  + [Geeks4Geeks](https://www.geeksforgeeks.org/merge-sort/)

### Quick Sort
+ **Videos**
  + [KC Ang](https://www.youtube.com/watch?v=MZaf_9IZCrc) **(Recommended)**
  + [Michael Sambol](https://www.youtube.com/watch?v=Hoixgm4-P4M)
  + [Hacker Rank](https://www.youtube.com/watch?v=PgBzjlCcFvc)
  + [Abdul Bari](https://www.youtube.com/watch?v=7h1s2SojIRw)
+ **Articles**
  + [Geeks4Geeks](https://www.geeksforgeeks.org/quick-sort/)

### Count Sort (I used it alot)
+ **Videos**
  + [Hacker Rank](https://www.youtube.com/watch?v=7zuGmKfUt7s)
+ **Articles**
  + [Geeks4Geeks](https://www.geeksforgeeks.org/counting-sort/)

### Heap Sort
+ **Videos**
  + [Michael Sambol](https://www.youtube.com/watch?v=2DmK_H7IdTo)
  + [Hacker Rank](https://www.youtube.com/watch?v=MtQL_ll5KhQ)
+ **Articles**
  + [Geeks4Geeks](https://www.geeksforgeeks.org/heap-sort/)

<h2 align = "center"> Cheat Sheet </h2>
<!-- Cheat Seet -->
<div align = "center">
  <table>
    <thead>
      <tr>
        <th align= "center">Key</th>
        <th align= "center">Merge</th>
        <th align= "center">Quick</th>
        <th align= "center">Count</th>
        <th align= "center">Heap</th>
      </tr>
    </thead>
    <tbody>
    <!-- Time Complexity --> 
      <tr>
        <td align = "center">Time Complexity</td>    
        <td align = "center">O(N&nbsp;log<sub>2</sub>&nbsp;N)</td>
        <td align = "center">O(<strong>N<sup>2</sup></strong>)</td>
        <td align = "center">O(N + M)</td>
        <td align = "center">O(N&nbsp;log<sub>2</sub>&nbsp;N)</td>
      </tr>
      <!-- Space Complexity--> 
      <tr>
        <td align = "center">Space Complexity</td>
        <td align = "center">O(N)</td>
        <td align = "center">O(log<sub>2</sub>&nbsp;N)????</td>
        <td align = "center">O(M)</td>
        <td align = "center">O(1)</td>
      </tr>
      <!-- Notes -->
      <tr>
        <td align = "center">Notes</td>
        <td align = "left">
          <p> •&nbsp;<strong>Can handle large data set (using the merge function)</strong></p>
          <p> •&nbsp;Follows Divide and conquer</p>
          <p> •&nbsp;High constant</p>
        </td>
        <td align = "left">
          <p> •&nbsp;The Asymptotic time complexity is Θ(N&nbsp;log<sub>2</sub>&nbsp;N)</p>
          <p> •&nbsp;<strong>The partition function is used in Quick Select</strong></p>
         </td>
        <td align = "leftr">
          <p> •&nbsp;M is the maximum value of items</p>
          <p> •&nbsp;Should be careful with negatives</p>
        </td>
        <td align = "left">
          <p> •&nbsp;Using the array as the heap</p>
          <p> •&nbsp;Low constant</p>
        </td>
      </tr>
    </tbody>
  </table>
</div>
