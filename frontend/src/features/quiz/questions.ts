export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface QuizQuestion {
  id: string;
  year: string;
  topic?: string;
  difficulty: Difficulty;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export const GATE_QUESTIONS: QuizQuestion[] = [
  {
    "id": "q1",
    "year": "GATE CSE 2018",
    "topic": "Normalization",
    "difficulty": "Easy",
    "text": "Let R be a relation schema and F be a set of functional dependencies on R. Which of the following is TRUE?",
    "options": [
      "If R is in BCNF, then R is in 3NF",
      "If R is in 3NF, then R is in BCNF",
      "If R is in 2NF, then R is in 3NF",
      "BCNF is weaker than 3NF"
    ],
    "correctAnswerIndex": 0,
    "explanation": "BCNF is stricter than 3NF. Every BCNF relation is in 3NF, but the reverse is not necessarily true."
  },
  {
    "id": "q2",
    "year": "GATE CSE 2012",
    "topic": "Relational Model",
    "difficulty": "Easy",
    "text": "Given the basic ER and relational models, which of the following is INCORRECT?",
    "options": [
      "An attribute of an entity can have more than one value",
      "An attribute of an entity can be composite",
      "In a row of a relational table, an attribute can have more than one value",
      "In a row of a relational table, an attribute can have exactly one value or a null value"
    ],
    "correctAnswerIndex": 2,
    "explanation": "In the relational model under 1NF, each attribute value is atomic; a single cell cannot contain multiple independent values."
  },
  {
    "id": "q3",
    "year": "GATE CSE 2014",
    "topic": "Normalization",
    "difficulty": "Easy",
    "text": "A relation R(A, B, C, D, E) is converted to 3NF and BCNF respectively. The functional dependencies are A -> BC, C -> E, B -> D, E -> A. The number of relations obtained in 3NF and BCNF decompositions are:",
    "options": [
      "3 and 3",
      "3 and 4",
      "4 and 4",
      "4 and 5"
    ],
    "correctAnswerIndex": 2,
    "explanation": "For this question bank, the stated decomposition count is four relations in each decomposition: (A,B,C), (C,E), (B,D), and (E,A)."
  },
  {
    "id": "q4",
    "year": "GATE CSE 2005",
    "topic": "Normalization",
    "difficulty": "Easy",
    "text": "Relation R has eight attributes A,B,C,D,E,F,G,H. Which set of functional dependencies ensures that R is in 3NF but NOT in BCNF?",
    "options": [
      "A->B, B->C, C->D, D->E",
      "A->BCDEFGH",
      "AB->C, C->B, A->D",
      "None of the above"
    ],
    "correctAnswerIndex": 2,
    "explanation": "For AB->C, C->B, A->D, the candidate keys are AB and AC. C is not a superkey, so C->B violates BCNF. B is prime, so this dependency is permitted by 3NF."
  },
  {
    "id": "q5",
    "year": "GATE CSE 2008",
    "topic": "Functional Dependencies",
    "difficulty": "Easy",
    "text": "Let R(A, B, C, D, E, F) have dependencies C->F, E->A, EC->D, A->B. Which is a key for R?",
    "options": [
      "CD",
      "EC",
      "AE",
      "AC"
    ],
    "correctAnswerIndex": 1,
    "explanation": "EC+ contains E, C, A, D, F, and B. It determines every attribute and is minimal, so EC is a candidate key."
  },
  {
    "id": "q6",
    "year": "GATE-style practice",
    "topic": "Functional Dependencies",
    "difficulty": "Easy",
    "text": "Given R(A, B, C, D, E) with FDs A -> BC, B -> D, and CD -> E, what is A+?",
    "options": [
      "ABC",
      "ABCD",
      "ABCDE",
      "ACDE"
    ],
    "correctAnswerIndex": 2,
    "explanation": "A gives B and C; B gives D; and C,D together give E. Thus A+ = ABCDE."
  },
  {
    "id": "q7",
    "year": "GATE-style practice",
    "topic": "Candidate Keys",
    "difficulty": "Easy",
    "text": "For R(A, B, C) with FDs A -> B and B -> C, what is the candidate key?",
    "options": [
      "A",
      "B",
      "C",
      "BC"
    ],
    "correctAnswerIndex": 0,
    "explanation": "A+ = ABC, so A determines every attribute and is minimal."
  },
  {
    "id": "q8",
    "year": "GATE-style practice",
    "topic": "Candidate Keys",
    "difficulty": "Medium",
    "text": "For R(A, B, C) with FDs AB -> C and C -> B, which is a candidate key?",
    "options": [
      "B",
      "C",
      "AB",
      "AC"
    ],
    "correctAnswerIndex": 2,
    "explanation": "AB+ = ABC. A is not determined by any given dependency, so every key must contain A. AB is a candidate key; AC is also a candidate key."
  },
  {
    "id": "q9",
    "year": "GATE-style practice",
    "topic": "Functional Dependencies",
    "difficulty": "Medium",
    "text": "Which FD is redundant if A -> B, B -> C, and A -> C are given?",
    "options": [
      "A -> B",
      "B -> C",
      "A -> C",
      "None"
    ],
    "correctAnswerIndex": 2,
    "explanation": "A -> B and B -> C imply A -> C by transitivity, so A -> C is redundant."
  },
  {
    "id": "q10",
    "year": "GATE-style practice",
    "topic": "Normalization",
    "difficulty": "Medium",
    "text": "A relation violates 2NF when a non-prime attribute depends on:",
    "options": [
      "The entire candidate key only",
      "A proper subset of a candidate key",
      "A superkey",
      "Every attribute"
    ],
    "correctAnswerIndex": 1,
    "explanation": "2NF removes partial dependencies of non-prime attributes on a proper subset of a candidate key."
  },
  {
    "id": "q11",
    "year": "GATE-style practice",
    "topic": "Normalization",
    "difficulty": "Medium",
    "text": "For every non-trivial FD X -> A, which condition is sufficient for a relation to satisfy 3NF?",
    "options": [
      "X must always be a candidate key",
      "A must always be non-prime",
      "X is a superkey or A is a prime attribute",
      "X and A must both be prime attributes"
    ],
    "correctAnswerIndex": 2,
    "explanation": "3NF requires each non-trivial FD X -> A to have X as a superkey or A as a prime attribute."
  },
  {
    "id": "q12",
    "year": "GATE-style practice",
    "topic": "Normalization",
    "difficulty": "Medium",
    "text": "A binary decomposition of R into R1 and R2 is lossless if which condition holds?",
    "options": [
      "R1 and R2 have no common attributes",
      "The common attributes functionally determine all attributes of R1 or all attributes of R2",
      "Both relations have the same candidate key",
      "Both relations contain every attribute of R"
    ],
    "correctAnswerIndex": 1,
    "explanation": "A binary decomposition is lossless when the common attributes functionally determine one component relation."
  },
  {
    "id": "q13",
    "year": "GATE-style practice",
    "topic": "Relational Algebra",
    "difficulty": "Medium",
    "text": "Which relational algebra operation selects rows satisfying a condition?",
    "options": [
      "Projection (π)",
      "Selection (σ)",
      "Union (∪)",
      "Rename (ρ)"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Selection (σ) filters tuples using a predicate."
  },
  {
    "id": "q14",
    "year": "GATE-style practice",
    "topic": "Relational Algebra",
    "difficulty": "Medium",
    "text": "Which operation combines tuples from two relations based on a matching condition?",
    "options": [
      "Difference",
      "Projection",
      "Join",
      "Rename"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Join combines related tuples from two relations using a matching condition."
  },
  {
    "id": "q15",
    "year": "GATE-style practice",
    "topic": "SQL",
    "difficulty": "Medium",
    "text": "What does COUNT(*) return in a SQL query?",
    "options": [
      "The number of non-NULL values in the first column",
      "The total number of rows in the group",
      "The number of distinct rows only",
      "The sum of numeric columns"
    ],
    "correctAnswerIndex": 1,
    "explanation": "COUNT(*) counts rows, including rows where individual columns contain NULL."
  },
  {
    "id": "q16",
    "year": "GATE-style practice",
    "topic": "SQL",
    "difficulty": "Hard",
    "text": "Which SQL clause filters groups after aggregate calculations?",
    "options": [
      "WHERE",
      "ORDER BY",
      "HAVING",
      "DISTINCT"
    ],
    "correctAnswerIndex": 2,
    "explanation": "HAVING filters groups after grouping; WHERE filters rows before grouping."
  },
  {
    "id": "q17",
    "year": "GATE-style practice",
    "topic": "Transactions",
    "difficulty": "Hard",
    "text": "Which ACID property ensures that a transaction is completed entirely or has no effect?",
    "options": [
      "Consistency",
      "Isolation",
      "Durability",
      "Atomicity"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Atomicity makes a transaction all-or-nothing."
  },
  {
    "id": "q18",
    "year": "GATE-style practice",
    "topic": "Transactions",
    "difficulty": "Hard",
    "text": "A schedule is conflict-serializable if its precedence graph is:",
    "options": [
      "Complete",
      "Cyclic",
      "Acyclic",
      "Disconnected"
    ],
    "correctAnswerIndex": 2,
    "explanation": "A schedule is conflict-serializable exactly when its precedence graph is acyclic."
  },
  {
    "id": "q19",
    "year": "GATE-style practice",
    "topic": "Indexing",
    "difficulty": "Hard",
    "text": "What is a primary purpose of an index in a database?",
    "options": [
      "To eliminate all duplicate rows",
      "To speed up data retrieval",
      "To guarantee serializability",
      "To enforce 4NF"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Indexes can speed up retrieval, at the cost of storage and update-maintenance overhead."
  },
  {
    "id": "q20",
    "year": "GATE-style practice",
    "topic": "Indexing",
    "difficulty": "Hard",
    "text": "In a typical B+ tree index, where are data entries or record pointers stored?",
    "options": [
      "Only in the root",
      "Only in internal nodes",
      "In leaf nodes",
      "In a separate stack"
    ],
    "correctAnswerIndex": 2,
    "explanation": "B+ tree leaves contain data entries or record pointers and are commonly linked for range scans."
  },
  {
    "id": "q21",
    "year": "Original practice",
    "topic": "Relational Model",
    "difficulty": "Easy",
    "text": "In a relation, what is a tuple?",
    "options": [
      "A column",
      "A row",
      "A database",
      "A constraint"
    ],
    "correctAnswerIndex": 1,
    "explanation": "A tuple is one row (record) in a relation."
  },
  {
    "id": "q22",
    "year": "Original practice",
    "topic": "Relational Model",
    "difficulty": "Easy",
    "text": "Which term describes the number of tuples in a relation?",
    "options": [
      "Degree",
      "Cardinality",
      "Domain",
      "Arity"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Cardinality is the number of rows; degree is the number of attributes."
  },
  {
    "id": "q23",
    "year": "Original practice",
    "topic": "Relational Model",
    "difficulty": "Easy",
    "text": "Which key uniquely identifies each tuple and cannot contain NULL?",
    "options": [
      "Foreign key",
      "Primary key",
      "Alternate attribute",
      "Non-key attribute"
    ],
    "correctAnswerIndex": 1,
    "explanation": "A primary key uniquely identifies tuples and its attributes cannot be NULL."
  },
  {
    "id": "q24",
    "year": "Original practice",
    "topic": "Relational Model",
    "difficulty": "Easy",
    "text": "A foreign key is primarily used to:",
    "options": [
      "Sort rows",
      "Enforce referential integrity",
      "Encrypt a table",
      "Remove duplicates"
    ],
    "correctAnswerIndex": 1,
    "explanation": "A foreign key ensures that referenced values correspond to a candidate/primary key in the parent relation, subject to NULL rules."
  },
  {
    "id": "q25",
    "year": "Original practice",
    "topic": "ER Model",
    "difficulty": "Easy",
    "text": "In an ER diagram, a double oval usually represents:",
    "options": [
      "Key attribute",
      "Derived attribute",
      "Multivalued attribute",
      "Weak entity"
    ],
    "correctAnswerIndex": 2,
    "explanation": "A double oval denotes a multivalued attribute."
  },
  {
    "id": "q26",
    "year": "Original practice",
    "topic": "ER Model",
    "difficulty": "Easy",
    "text": "Which shape conventionally represents an entity set in an ER diagram?",
    "options": [
      "Rectangle",
      "Diamond",
      "Oval",
      "Triangle"
    ],
    "correctAnswerIndex": 0,
    "explanation": "An entity set is conventionally shown as a rectangle."
  },
  {
    "id": "q27",
    "year": "Original practice",
    "topic": "ER Model",
    "difficulty": "Easy",
    "text": "A relationship of degree three is called:",
    "options": [
      "Unary",
      "Binary",
      "Ternary",
      "Recursive"
    ],
    "correctAnswerIndex": 2,
    "explanation": "A ternary relationship connects three entity sets."
  },
  {
    "id": "q28",
    "year": "Original practice",
    "topic": "SQL",
    "difficulty": "Easy",
    "text": "Which SQL command retrieves rows from a table?",
    "options": [
      "GET",
      "SELECT",
      "FETCH TABLE",
      "DISPLAY"
    ],
    "correctAnswerIndex": 1,
    "explanation": "SELECT retrieves data from one or more tables or views."
  },
  {
    "id": "q29",
    "year": "Original practice",
    "topic": "SQL",
    "difficulty": "Easy",
    "text": "Which clause sorts a query result?",
    "options": [
      "GROUP BY",
      "ORDER BY",
      "HAVING",
      "WHERE"
    ],
    "correctAnswerIndex": 1,
    "explanation": "ORDER BY sorts the result according to one or more expressions."
  },
  {
    "id": "q30",
    "year": "Original practice",
    "topic": "SQL",
    "difficulty": "Easy",
    "text": "Which keyword removes duplicate rows from a SELECT result?",
    "options": [
      "UNIQUE ROWS",
      "DISTINCT",
      "SINGLE",
      "DEDUP"
    ],
    "correctAnswerIndex": 1,
    "explanation": "DISTINCT removes duplicate result rows."
  },
  {
    "id": "q31",
    "year": "Original practice",
    "topic": "SQL",
    "difficulty": "Easy",
    "text": "Which condition tests whether a value is NULL?",
    "options": [
      "= NULL",
      "== NULL",
      "IS NULL",
      "EQUALS NULL"
    ],
    "correctAnswerIndex": 2,
    "explanation": "SQL uses IS NULL (and IS NOT NULL), not equality comparison, to test NULL."
  },
  {
    "id": "q32",
    "year": "Original practice",
    "topic": "SQL",
    "difficulty": "Easy",
    "text": "Which command changes the structure of an existing table?",
    "options": [
      "UPDATE",
      "ALTER TABLE",
      "MODIFY ROW",
      "CHANGE DATABASE"
    ],
    "correctAnswerIndex": 1,
    "explanation": "ALTER TABLE adds, modifies, or drops table columns and constraints."
  },
  {
    "id": "q33",
    "year": "Original practice",
    "topic": "Relational Algebra",
    "difficulty": "Easy",
    "text": "Which relational algebra operator returns selected columns?",
    "options": [
      "Selection",
      "Projection",
      "Product",
      "Division"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Projection (π) chooses attributes/columns from a relation."
  },
  {
    "id": "q34",
    "year": "Original practice",
    "topic": "Relational Algebra",
    "difficulty": "Easy",
    "text": "Which operator produces every possible pair of tuples from two relations?",
    "options": [
      "Union",
      "Cartesian product",
      "Difference",
      "Intersection"
    ],
    "correctAnswerIndex": 1,
    "explanation": "The Cartesian product pairs each tuple of one relation with every tuple of the other."
  },
  {
    "id": "q35",
    "year": "Original practice",
    "topic": "Transactions",
    "difficulty": "Easy",
    "text": "Which ACID property ensures committed changes survive a system failure?",
    "options": [
      "Atomicity",
      "Consistency",
      "Isolation",
      "Durability"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Durability means committed effects persist despite subsequent failures."
  },
  {
    "id": "q36",
    "year": "Original practice",
    "topic": "Transactions",
    "difficulty": "Easy",
    "text": "A transaction is a:",
    "options": [
      "Single database file",
      "Logical unit of database work",
      "Type of index",
      "Table constraint"
    ],
    "correctAnswerIndex": 1,
    "explanation": "A transaction is a logical unit of work that may contain multiple database operations."
  },
  {
    "id": "q37",
    "year": "Original practice",
    "topic": "Database Architecture",
    "difficulty": "Easy",
    "text": "Which language category is primarily used to define database schemas?",
    "options": [
      "DML",
      "DDL",
      "DCL",
      "TCL"
    ],
    "correctAnswerIndex": 1,
    "explanation": "DDL includes commands such as CREATE, ALTER, and DROP."
  },
  {
    "id": "q38",
    "year": "Original practice",
    "topic": "Database Architecture",
    "difficulty": "Easy",
    "text": "Which command permanently removes a table definition and its data?",
    "options": [
      "DELETE",
      "REMOVE",
      "DROP TABLE",
      "TRUNCATE COLUMN"
    ],
    "correctAnswerIndex": 2,
    "explanation": "DROP TABLE removes the table object; DELETE removes rows while retaining the table."
  },
  {
    "id": "q39",
    "year": "Original practice",
    "topic": "Views",
    "difficulty": "Easy",
    "text": "A view is best described as:",
    "options": [
      "A physical backup file",
      "A stored query presented as a virtual table",
      "A type of primary key",
      "A transaction log"
    ],
    "correctAnswerIndex": 1,
    "explanation": "A view is defined by a query and presents its result as a virtual table."
  },
  {
    "id": "q40",
    "year": "Original practice",
    "topic": "Constraints",
    "difficulty": "Easy",
    "text": "Which constraint prevents duplicate values in a column or column combination?",
    "options": [
      "CHECK",
      "UNIQUE",
      "DEFAULT",
      "NOT NULL"
    ],
    "correctAnswerIndex": 1,
    "explanation": "UNIQUE enforces uniqueness across the constrained column set."
  },
  {
    "id": "q41",
    "year": "Original practice",
    "topic": "SQL",
    "difficulty": "Medium",
    "text": "A table Marks has values 40, 50, NULL. What does SELECT COUNT(marks) return?",
    "options": [
      "1",
      "2",
      "3",
      "NULL"
    ],
    "correctAnswerIndex": 1,
    "explanation": "COUNT(column) counts non-NULL values, so it returns 2."
  },
  {
    "id": "q42",
    "year": "Original practice",
    "topic": "SQL",
    "difficulty": "Medium",
    "text": "Which query returns departments having more than five employees?",
    "options": [
      "SELECT dept FROM Emp WHERE COUNT(*) > 5 GROUP BY dept;",
      "SELECT dept FROM Emp GROUP BY dept HAVING COUNT(*) > 5;",
      "SELECT dept FROM Emp HAVING COUNT(*) > 5;",
      "SELECT dept FROM Emp ORDER BY COUNT(*) > 5;"
    ],
    "correctAnswerIndex": 1,
    "explanation": "GROUP BY forms department groups and HAVING filters them using the aggregate count."
  },
  {
    "id": "q43",
    "year": "Original practice",
    "topic": "SQL",
    "difficulty": "Medium",
    "text": "What is the effect of an INNER JOIN when a row has no matching row in the other table?",
    "options": [
      "It is returned with NULLs",
      "It is omitted",
      "It is duplicated",
      "The query always fails"
    ],
    "correctAnswerIndex": 1,
    "explanation": "INNER JOIN returns only row combinations satisfying the join condition."
  },
  {
    "id": "q44",
    "year": "Original practice",
    "topic": "SQL",
    "difficulty": "Medium",
    "text": "Which expression correctly checks that salary is between 30000 and 50000 inclusive?",
    "options": [
      "salary > 30000 AND salary < 50000",
      "salary BETWEEN 30000 AND 50000",
      "salary IN (30000,50000)",
      "salary = 30000..50000"
    ],
    "correctAnswerIndex": 1,
    "explanation": "BETWEEN includes both endpoints in SQL."
  },
  {
    "id": "q45",
    "year": "Original practice",
    "topic": "SQL",
    "difficulty": "Medium",
    "text": "What does a correlated subquery do?",
    "options": [
      "Runs only once and never refers to outer query",
      "References a column from the outer query",
      "Creates a permanent table",
      "Disables indexes"
    ],
    "correctAnswerIndex": 1,
    "explanation": "A correlated subquery refers to values from the outer query and is logically evaluated for outer rows."
  },
  {
    "id": "q46",
    "year": "Original practice",
    "topic": "Relational Algebra",
    "difficulty": "Medium",
    "text": "If relation R has 4 tuples and S has 3 tuples, how many tuples are in R × S?",
    "options": [
      "7",
      "12",
      "4",
      "3"
    ],
    "correctAnswerIndex": 1,
    "explanation": "The Cartesian product has |R| × |S| tuples, so 4 × 3 = 12."
  },
  {
    "id": "q47",
    "year": "Original practice",
    "topic": "Relational Algebra",
    "difficulty": "Medium",
    "text": "Which operation is equivalent to a join followed by removal of duplicate common columns when the join attributes share names?",
    "options": [
      "Natural join",
      "Rename",
      "Division",
      "Union"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Natural join matches equal values on same-named attributes and keeps one copy of each common attribute."
  },
  {
    "id": "q48",
    "year": "Original practice",
    "topic": "Relational Algebra",
    "difficulty": "Medium",
    "text": "For union R ∪ S to be defined, R and S must be:",
    "options": [
      "Identical in tuple count",
      "Union-compatible",
      "Both empty",
      "Have the same primary key name"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Union-compatible relations have the same number of attributes with corresponding compatible domains."
  },
  {
    "id": "q49",
    "year": "Original practice",
    "topic": "Functional Dependencies",
    "difficulty": "Medium",
    "text": "If X → Y, which statement must be true?",
    "options": [
      "Every Y value determines X",
      "Any two tuples agreeing on X agree on Y",
      "X and Y must be disjoint",
      "X must be a primary key"
    ],
    "correctAnswerIndex": 1,
    "explanation": "The definition of X → Y is that agreement on X forces agreement on Y."
  },
  {
    "id": "q50",
    "year": "Original practice",
    "topic": "Functional Dependencies",
    "difficulty": "Medium",
    "text": "Given FDs A → B and A → C, which dependency follows?",
    "options": [
      "B → C",
      "A → BC",
      "C → B",
      "BC → A"
    ],
    "correctAnswerIndex": 1,
    "explanation": "By the union rule, A → B and A → C imply A → BC."
  },
  {
    "id": "q51",
    "year": "Original practice",
    "topic": "Normalization",
    "difficulty": "Medium",
    "text": "A relation is in 1NF when:",
    "options": [
      "It has no foreign keys",
      "Each attribute contains atomic values",
      "Every determinant is a superkey",
      "It has no transitive dependencies"
    ],
    "correctAnswerIndex": 1,
    "explanation": "1NF requires atomic attribute values rather than repeating groups or sets in a cell."
  },
  {
    "id": "q52",
    "year": "Original practice",
    "topic": "Normalization",
    "difficulty": "Medium",
    "text": "Which anomaly occurs when deleting one row unintentionally removes the only stored copy of another fact?",
    "options": [
      "Insertion anomaly",
      "Deletion anomaly",
      "Update anomaly",
      "Join anomaly"
    ],
    "correctAnswerIndex": 1,
    "explanation": "A deletion anomaly occurs when removing a tuple also removes information that should have been retained."
  },
  {
    "id": "q53",
    "year": "Original practice",
    "topic": "Normalization",
    "difficulty": "Medium",
    "text": "A relation has candidate key AB and FD A → C, where C is non-prime. Which normal form is violated?",
    "options": [
      "1NF only",
      "2NF",
      "4NF only",
      "No normal form"
    ],
    "correctAnswerIndex": 1,
    "explanation": "C depends on a proper subset A of candidate key AB, so the relation violates 2NF."
  },
  {
    "id": "q54",
    "year": "Original practice",
    "topic": "Transactions",
    "difficulty": "Medium",
    "text": "In a schedule, two operations conflict when they:",
    "options": [
      "Belong to the same transaction",
      "Access different data items",
      "Belong to different transactions, access the same item, and at least one is a write",
      "Are both read operations"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Conflict requires different transactions, the same data item, and at least one write."
  },
  {
    "id": "q55",
    "year": "Original practice",
    "topic": "Transactions",
    "difficulty": "Medium",
    "text": "What does a shared (S) lock generally permit?",
    "options": [
      "Reading but not writing the locked item",
      "Writing by every transaction",
      "Dropping the table",
      "Only index creation"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Multiple transactions can hold compatible shared locks to read an item; an exclusive lock is needed to write."
  },
  {
    "id": "q56",
    "year": "Original practice",
    "topic": "Transactions",
    "difficulty": "Medium",
    "text": "A dirty read occurs when a transaction:",
    "options": [
      "Reads a committed value twice",
      "Reads data written by an uncommitted transaction",
      "Reads a NULL value",
      "Reads from an index"
    ],
    "correctAnswerIndex": 1,
    "explanation": "A dirty read observes another transaction's uncommitted update, which may later be rolled back."
  },
  {
    "id": "q57",
    "year": "Original practice",
    "topic": "Indexing",
    "difficulty": "Medium",
    "text": "A clustered index primarily determines:",
    "options": [
      "The logical SQL column order",
      "The physical or storage order of table records",
      "The transaction isolation level",
      "The number of candidate keys"
    ],
    "correctAnswerIndex": 1,
    "explanation": "A clustered index organizes table records according to the index key order, subject to DBMS implementation."
  },
  {
    "id": "q58",
    "year": "Original practice",
    "topic": "Indexing",
    "difficulty": "Medium",
    "text": "Which index is generally most useful for a query filtering on a leading prefix of a composite index (A, B)?",
    "options": [
      "Index on (B, A) only",
      "Index on (A, B)",
      "Index on unrelated C",
      "No index can help"
    ],
    "correctAnswerIndex": 1,
    "explanation": "A composite B-tree index on (A,B) can typically support predicates using the leading column A, and often A with B."
  },
  {
    "id": "q59",
    "year": "Original practice",
    "topic": "Database Design",
    "difficulty": "Medium",
    "text": "In mapping a many-to-many relationship to relations, the usual design is to:",
    "options": [
      "Add one scalar FK to either entity table only",
      "Create a separate relation containing FKs to both entity relations",
      "Merge both entity tables",
      "Discard the relationship"
    ],
    "correctAnswerIndex": 1,
    "explanation": "A junction relation stores the participating foreign keys, often using their combination as a primary key."
  },
  {
    "id": "q60",
    "year": "Original practice",
    "topic": "Recovery",
    "difficulty": "Medium",
    "text": "A checkpoint in database recovery is used mainly to:",
    "options": [
      "Delete all old transactions",
      "Reduce the amount of log that must be examined during recovery",
      "Guarantee no transaction aborts",
      "Replace the database schema"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Checkpoints record a recovery position/state so recovery need not always scan the entire log from its beginning."
  },
  {
    "id": "q61",
    "year": "Original practice",
    "topic": "Functional Dependencies",
    "difficulty": "Hard",
    "text": "For R(A,B,C,D), F = {A → B, B → C, C → D}, which is a minimal candidate key?",
    "options": [
      "A",
      "AB",
      "AC",
      "AD"
    ],
    "correctAnswerIndex": 0,
    "explanation": "A+ = ABCD. Since A alone determines all attributes, it is minimal and is the candidate key."
  },
  {
    "id": "q62",
    "year": "Original practice",
    "topic": "Functional Dependencies",
    "difficulty": "Hard",
    "text": "Let F = {A → B, B → A, B → C, C → D}. Which attribute set is a candidate key for R(A,B,C,D)?",
    "options": [
      "A",
      "C",
      "D",
      "BD"
    ],
    "correctAnswerIndex": 0,
    "explanation": "A+ = ABCD using A→B, B→C, and C→D. A is minimal because it is a singleton."
  },
  {
    "id": "q63",
    "year": "Original practice",
    "topic": "Functional Dependencies",
    "difficulty": "Hard",
    "text": "For F = {AB → C, C → D, D → A} on R(A,B,C,D), which is a candidate key?",
    "options": [
      "A",
      "B",
      "AB",
      "CD"
    ],
    "correctAnswerIndex": 2,
    "explanation": "AB+ = ABCD. B is not derivable from the other attributes, so every key must include B; AB is minimal."
  },
  {
    "id": "q64",
    "year": "Original practice",
    "topic": "Normalization",
    "difficulty": "Hard",
    "text": "For relation R(A,B,C) with FDs A → B and B → A, and C independent of them, what are the candidate keys?",
    "options": [
      "A and B",
      "AC and BC",
      "AB only",
      "ABC only"
    ],
    "correctAnswerIndex": 1,
    "explanation": "A and B each determine the other, but neither determines C. Thus AC and BC are the minimal keys."
  },
  {
    "id": "q65",
    "year": "Original practice",
    "topic": "Normalization",
    "difficulty": "Hard",
    "text": "A relation R(A,B,C,D) has FDs AB → C, C → D, and D → B. Which statement is true about candidate keys?",
    "options": [
      "AB and AC are candidate keys",
      "A alone is a candidate key",
      "C alone is a candidate key",
      "D alone is a candidate key"
    ],
    "correctAnswerIndex": 0,
    "explanation": "A is not determined by any FD, so it must be in every key. AB+ and AC+ both yield all attributes, and both are minimal."
  },
  {
    "id": "q66",
    "year": "Original practice",
    "topic": "Normalization",
    "difficulty": "Hard",
    "text": "Which property is guaranteed by a lossless-join decomposition but is not automatically guaranteed by a dependency-preserving decomposition?",
    "options": [
      "Every original FD can be checked on one component independently",
      "Joining the decomposed relations reconstructs exactly the original relation instance",
      "No spurious tuples are possible after join",
      "Both B and C"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Losslessness ensures exact reconstruction without spurious tuples. Dependency preservation is a separate property."
  },
  {
    "id": "q67",
    "year": "Original practice",
    "topic": "Normalization",
    "difficulty": "Hard",
    "text": "A decomposition is dependency-preserving when:",
    "options": [
      "Every FD is lost after decomposition",
      "The projected dependencies together imply the original dependencies",
      "The join is always lossless",
      "Each component has the same key"
    ],
    "correctAnswerIndex": 1,
    "explanation": "The union of dependencies projected onto the decomposed schemas must imply the original FD set."
  },
  {
    "id": "q68",
    "year": "Original practice",
    "topic": "Normalization",
    "difficulty": "Hard",
    "text": "Which statement about BCNF decomposition is correct?",
    "options": [
      "It always preserves dependencies",
      "It is always lossless, but may fail to preserve dependencies",
      "It may be lossy by definition",
      "It never reduces redundancy"
    ],
    "correctAnswerIndex": 1,
    "explanation": "The standard BCNF decomposition algorithm produces lossless decompositions, but dependency preservation is not guaranteed."
  },
  {
    "id": "q69",
    "year": "Original practice",
    "topic": "Relational Algebra",
    "difficulty": "Hard",
    "text": "Given R(A,B) and S(B,C), which expression represents a theta join on R.B < S.B?",
    "options": [
      "σ R.B<S.B (R × S)",
      "πA,C(R ∪ S)",
      "R − S",
      "R ÷ S"
    ],
    "correctAnswerIndex": 0,
    "explanation": "A theta join can be expressed as selection with the join predicate applied to the Cartesian product."
  },
  {
    "id": "q70",
    "year": "Original practice",
    "topic": "Relational Algebra",
    "difficulty": "Hard",
    "text": "If R(A,B) contains (1,x), (1,y), (2,x) and S(B) contains x, what is R ÷ S?",
    "options": [
      "{1,2}",
      "{1}",
      "{x}",
      "Empty relation"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Division returns A values paired in R with every B value in S. Both 1 and 2 are paired with x."
  },
  {
    "id": "q71",
    "year": "Original practice",
    "topic": "SQL",
    "difficulty": "Hard",
    "text": "A table T(x) contains 1, 1, 2, NULL. What does SELECT COUNT(DISTINCT x) FROM T return in standard SQL?",
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correctAnswerIndex": 1,
    "explanation": "COUNT(DISTINCT x) counts distinct non-NULL values, which are 1 and 2."
  },
  {
    "id": "q72",
    "year": "Original practice",
    "topic": "SQL",
    "difficulty": "Hard",
    "text": "Which condition is true for every row in a grouped query after GROUP BY department?",
    "options": [
      "Every aggregate must appear in WHERE",
      "A selected non-aggregated column generally must be grouped or functionally dependent as permitted by the DBMS",
      "HAVING runs before WHERE",
      "GROUP BY removes all NULL values"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Grouped queries restrict selected expressions: non-aggregated columns generally need to be grouping columns (with DBMS-specific functional-dependency allowances)."
  },
  {
    "id": "q73",
    "year": "Original practice",
    "topic": "Transactions",
    "difficulty": "Hard",
    "text": "Under strict two-phase locking, when are exclusive locks typically released?",
    "options": [
      "Immediately after each write",
      "Only after commit or abort",
      "Before the growing phase ends",
      "At transaction start"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Strict 2PL holds exclusive locks until commit or abort, preventing other transactions from reading or overwriting uncommitted writes."
  },
  {
    "id": "q74",
    "year": "Original practice",
    "topic": "Transactions",
    "difficulty": "Hard",
    "text": "A schedule is view-serializable if it preserves:",
    "options": [
      "Only the order of all reads",
      "Initial reads, read-from relationships, and final writes",
      "Only write-write conflicts",
      "The number of operations"
    ],
    "correctAnswerIndex": 1,
    "explanation": "View equivalence preserves which transaction each read obtains its value from, initial reads, and the final writer of each item."
  },
  {
    "id": "q75",
    "year": "Original practice",
    "topic": "Transactions",
    "difficulty": "Hard",
    "text": "If a transaction reads a value written by T1 and T1 later aborts, the reading transaction may need to abort to avoid:",
    "options": [
      "Phantom reads",
      "Cascading rollback",
      "Lost update",
      "Starvation"
    ],
    "correctAnswerIndex": 1,
    "explanation": "A dependent transaction has read dirty data; its rollback can trigger cascading rollback unless the schedule prevents such reads."
  },
  {
    "id": "q76",
    "year": "Original practice",
    "topic": "Indexing",
    "difficulty": "Hard",
    "text": "A dense index differs from a sparse index because a dense index:",
    "options": [
      "Has an entry for every search-key value or record, depending on organization",
      "Stores no search keys",
      "Can only be used on hash files",
      "Must be a B+ tree"
    ],
    "correctAnswerIndex": 0,
    "explanation": "A dense index has an index entry for every search-key value (or record); a sparse index has entries for only some search values, often one per data block."
  },
  {
    "id": "q77",
    "year": "Original practice",
    "topic": "Indexing",
    "difficulty": "Hard",
    "text": "For a B+ tree of order m where an internal node can have at most m children, what is the minimum number of children for a non-root internal node?",
    "options": [
      "1",
      "⌈m/2⌉",
      "m",
      "m−1"
    ],
    "correctAnswerIndex": 1,
    "explanation": "A non-root internal node must be at least half full, so it has at least ceiling(m/2) children under this order convention."
  },
  {
    "id": "q78",
    "year": "Original practice",
    "topic": "Recovery",
    "difficulty": "Hard",
    "text": "In write-ahead logging, which rule must hold before a dirty page is written to disk?",
    "options": [
      "The corresponding log record must already be on stable storage",
      "The transaction must have started",
      "All transactions must commit",
      "The checkpoint must be deleted"
    ],
    "correctAnswerIndex": 0,
    "explanation": "WAL requires the log record describing an update to reach stable storage before the corresponding modified data page is flushed."
  },
  {
    "id": "q79",
    "year": "Original practice",
    "topic": "Distributed Databases",
    "difficulty": "Hard",
    "text": "In two-phase commit, which component coordinates the global commit decision?",
    "options": [
      "A participant chosen at random",
      "The coordinator",
      "The buffer manager",
      "The query parser"
    ],
    "correctAnswerIndex": 1,
    "explanation": "The coordinator collects votes from participants and then broadcasts the global commit or abort decision."
  },
  {
    "id": "q80",
    "year": "Original practice",
    "topic": "Concurrency Control",
    "difficulty": "Hard",
    "text": "Timestamp-ordering concurrency control orders conflicting operations according to:",
    "options": [
      "Physical disk location",
      "Transaction timestamps",
      "Table names alphabetically",
      "Number of rows affected"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Timestamp ordering uses transaction timestamps to enforce a serial order consistent with those timestamps."
  }
];
