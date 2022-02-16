## String Processing
### Rolling Hash - (Rabin Karp)
+ **Videos**
  + [Mostafa Saad](https://www.youtube.com/watch?v=Z26JzYn7G6U&t=634s) **(Arabic)**
  + [Stable Sort](https://www.youtube.com/watch?v=BfUejqd07yo)
+ **Articles**
  + [CP-Algorithms](https://cp-algorithms.com/string/string-hashing.html)
+ **Problems**
  + [LeetCode](https://leetcode.com/list/9641byhd)

### Knuth Morris Pratt (KMP)
+ **Videos**
  + [Tushar](https://www.youtube.com/watch?v=GTJr8OvyEVQ)
  + [Back To Back SWE](https://www.youtube.com/watch?v=BXCEFAzhxGY&t=917s)
  + **Mostafa Saad (Arabic)**
    + [Part 1](https://www.youtube.com/watch?v=vjxLlFTKhrU)
    + [Part 2](https://www.youtube.com/watch?v=VBaPXRcHIk8)
+ **Articles**
  + [CP-Algorithms](https://cp-algorithms.com/string/prefix-function.html)
+ **Problems**
  + [LeetCode](https://leetcode.com/list/9641jzfh)

### Z-Function
+ **Videos**
  + [Tushar](https://www.youtube.com/watch?v=CpZh4eF8QBw&t=21s)
+ **Articles**
  + [CP-Algorithms](https://cp-algorithms.com/string/z-function.html)
+ **Problems**
  + [LeetCode](https://leetcode.com/list/9641jzfh)
 
### Suffix Array
+ **Videos**
  + [Mostafa Saad](https://www.youtube.com/watch?v=maBr777ZRhw&t=1309s) **(Arabic)**
+ **Articles**
  + [CP-Algorithms](https://cp-algorithms.com/string/suffix-array.html)
+ **Problems**
  + [LeetCode](https://leetcode.com/list/964yxi11)
<br>
<h2 align = "center"> Cheat Sheet </h2>
<!-- Cheat Sheet -->
<div align = "center">
  <table>
    <thead>
      <tr>
        <th align= "center">Key</th>
        <th align= "center">Rolling Hash (Rabin Karp)</th>
        <th align= "center">KMP</th>
        <th align= "center">Z-Function</th>
        <th align= "center">Suffix Array</th>
      </tr>
    </thead>
    <tbody>
    <!-- Time Complexity --> 
      <tr>
        <td align = "center">Time Complexity</td>    
        <td align = "center">O(N)</td>
        <td align = "center">O(N + M)</td>
        <td align = "center">O(N + M)</td>
        <td align = "center"><strong>O(N&nbsp;(log<sub>2</sub>&nbsp;N)<sup>2</sup>)</strong></td>
      </tr>
      <!-- Space Complexity--> 
      <tr>
        <td align = "center">Space Complexity</td>
        <td align = "center">O(N)</td>
        <td align = "center">O(N)</td>
        <td align = "center">O(N)</td>
        <td align = "center">O(N)</td>
      </tr>
      <!-- Notes -->
      <tr>
        <td align = "center">Notes</td>
        <td align = "left">
          <p> •&nbsp;You can match strings or arrays</p>
          <p> •&nbsp;Really flexible and handy</p>
        </td>
        <td align = "left">
          <p> •&nbsp;Looking for certain substring</p>
         </td>
        <td align = "leftr">
          <p> •&nbsp;Looking for certain substring</p>
          <p> •&nbsp;Shorter implementation of KMP</p>
        </td>
        <td align = "left">
          <p> •&nbsp;Search for multiple substrings</p>
          <p> •&nbsp;List of sorted suffixes</p>
        </td>
      </tr>
    </tbody>
  </table>
</div>
