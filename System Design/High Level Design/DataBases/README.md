# Databases
Keep in mind that we may consider using a mix between SQL and NoSQL in the same application.

<div align = "center">

|Key| Relational | Non-Relational|
|:---------:|:-----------:|:--------------:|
| Schema | Fixed | Flexible|
| Structure| Tables | Documents, Key-Value, etc.|
| Query | Structured (SQL) | Dynamic and Flexible|
| ACID| Supported| [Supported](https://stackoverflow.com/a/3014601)|
| Transactions| Supported| Not Supported|
| Scaling | Vertical | Horizontal/ Vertical|
| Foreign Keys/ Referential Integrity | Supported | Not Supported|
| Joins | Supported | Not Supported|
</div>

## Partitioning
<div align = "center">

|Key| Vertical | Horizontal|
|:---------:|:-----------:|:--------------:|
|Definition|Creating tables with fewer columns and using additional tables to store the remaining columns | Putting different rows into different tables|
|Personal Notes| I studied some algorithms that cluster the columns together based on the queries of the system (strongly related columns stays together)| I only used ranged partitioning, and you keep all the fields|
</div>

<div align = "center">

| Sharding | Partitioning|
|:-----------:|:--------------:|
|Implies the data is spread across multiple computers|Implies the data is on the same computer but in different files|
</div>

## Normalization & Denormalization
+ **Videos**
  + [El-Desouky](https://www.youtube.com/playlist?list=PLB8C3FC57C924A7D0) **(Arabic)**
+ **Articles**
  + [Normalization steps in RDB](https://www.studytonight.com/dbms/database-normalization.php)
  + [Normalization vs Denormalization](https://www.tutorialspoint.com/difference-between-normalization-and-denormalization)
## Join
### Relational Databases
You should be aware that join is **an expensive** operation, especially if we won't use query optimizer.
+ **Articles**
  + [W3Schools](https://www.w3schools.com/sql/sql_join.asp) **(Recommended)**
## Transactions (Mainly from college)
### Relational Databases
+ **Videos**
  + ACID
## Query optimization
+ **Videos**
  + **LinkedIn Learning**
    + [Dan Sullivan](https://www.linkedin.com/learning/advanced-sql-for-query-tuning-and-performance-optimization)
## Understanding Logical Queries
+ **Videos**
  + **LinkedIn Learning**
    + [Ami Levin](https://www.linkedin.com/learning/advanced-sql-logical-query-processing-part-1)
