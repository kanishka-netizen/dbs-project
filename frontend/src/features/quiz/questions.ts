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
    id: "q1",
    year: "GATE CSE 2018",
    text: "Let R be a relation schema and F be a set of functional dependencies on R. Which of the following is TRUE?",
    options: [
      "If R is in BCNF, then R is in 3NF",
      "If R is in 3NF, then R is in BCNF",
      "If R is in 2NF, then R is in 3NF",
      "BCNF is weaker than 3NF"
    ],
    correctAnswerIndex: 0,
    explanation: "BCNF is a stricter normal form than 3NF. Every relation in BCNF is also in 3NF, but the reverse is not necessarily true."
  },
  {
    id: "q2",
    year: "GATE CSE 2012",
    text: "Given the basic ER and relational models, which of the following is INCORRECT?",
    options: [
      "An attribute of an entity can have more than one value",
      "An attribute of an entity can be composite",
      "In a row of a relational table, an attribute can have more than one value",
      "In a row of a relational table, an attribute can have exactly one value or a null value"
    ],
    correctAnswerIndex: 2,
    explanation: "In the relational model (specifically 1NF), every attribute must be atomic (single-valued). Therefore, an attribute in a row cannot have more than one value."
  },
  {
    id: "q3",
    year: "GATE CSE 2014",
    text: "A relation R(A, B, C, D, E) is converted to 3NF and BCNF respectively. The functional dependencies are A -> BC, C -> E, B -> D, E -> A. The number of relations obtained in 3NF and BCNF decompositions are:",
    options: [
      "3 and 3",
      "3 and 4",
      "4 and 4",
      "4 and 5"
    ],
    correctAnswerIndex: 2,
    explanation: "For the given FDs, the candidate keys are A, B (with E->A -> BC -> D), E, C. Actually, let's look at the standard decomposition. Both 3NF and BCNF decompositions generally result in 4 relations for this specific set of dependencies: (A,B,C), (C,E), (B,D), (E,A)."
  },
  {
    id: "q4",
    year: "GATE CSE 2005",
    text: "Relation R has eight attributes A,B,C,D,E,F,G,H. Which of the following sets of functional dependencies ensures that R is in 3NF but NOT in BCNF?",
    options: [
      "A->B, B->C, C->D, D->E",
      "A->BCDEFGH",
      "AB->C, C->B, A->D",
      "None of the above"
    ],
    correctAnswerIndex: 2,
    explanation: "In AB->C, C->B, A->D: the candidate keys are AB and AC. C->B is a dependency where C is not a superkey, which violates BCNF. However, B is a prime attribute (part of candidate key AB), so C->B is allowed in 3NF."
  },
  {
    id: "q5",
    year: "GATE CSE 2008",
    text: "Let R(A, B, C, D, E, F) be a relation schema with the following dependencies: C->F, E->A, EC->D, A->B. Which of the following is a key for R?",
    options: [
      "CD",
      "EC",
      "AE",
      "AC"
    ],
    correctAnswerIndex: 1,
    explanation: "Closure of EC: EC+ = E,C,A,D,F,B. Since EC+ contains all attributes of R, EC is a superkey (and it's minimal, so it's a candidate key)."
  },
  {
    id: "q6",
    year: "GATE-style practice",
    topic: "Functional Dependencies",
    text: "Given R(A, B, C, D, E) with FDs A -> BC, B -> D, and CD -> E, what is A+?",
    options: ["ABC", "ABCD", "ABCDE", "ACDE"],
    correctAnswerIndex: 2,
    explanation: "Starting with A, derive B and C. B gives D, and C and D together give E. Therefore A+ = ABCDE."
  },
  {
    id: "q7",
    year: "GATE-style practice",
    topic: "Candidate Keys",
    text: "For R(A, B, C) with FDs A -> B and B -> C, what is the candidate key?",
    options: ["A", "B", "C", "BC"],
    correctAnswerIndex: 0,
    explanation: "A+ = ABC, so A determines every attribute and is minimal. Hence A is the candidate key."
  },
  {
    id: "q8",
    year: "GATE-style practice",
    topic: "Candidate Keys",
    text: "For R(A, B, C) with FDs AB -> C and C -> B, which is a candidate key?",
    options: ["B", "C", "AB", "AC"],
    correctAnswerIndex: 2,
    explanation: "AB+ = ABC. Neither A nor B alone determines all attributes, so AB is a candidate key. AC is also a candidate key."
  },
  {
    id: "q9",
    year: "GATE-style practice",
    topic: "Functional Dependencies",
    text: "Which FD is redundant if A -> B, B -> C, and A -> C are given?",
    options: ["A -> B", "B -> C", "A -> C", "None"],
    correctAnswerIndex: 2,
    explanation: "A -> B and B -> C imply A -> C by transitivity, making A -> C redundant."
  },
  {
    id: "q10",
    year: "GATE-style practice",
    topic: "Normalization",
    text: "A relation violates 2NF when a non-prime attribute depends on:",
    options: [
      "The entire candidate key only",
      "A proper subset of a candidate key",
      "A superkey",
      "Every attribute"
    ],
    correctAnswerIndex: 1,
    explanation: "Second Normal Form eliminates partial dependencies of non-prime attributes on candidate keys."
  },
  {
    id: "q11",
    year: "GATE-style practice",
    topic: "Normalization",
    text: "For every non-trivial FD X -> A, which condition is sufficient for a relation to satisfy 3NF?",
    options: [
      "X must always be a candidate key",
      "A must always be non-prime",
      "X is a superkey or A is a prime attribute",
      "X and A must both be prime attributes"
    ],
    correctAnswerIndex: 2,
    explanation: "For each non-trivial FD X -> A, 3NF requires X to be a superkey or A to be a prime attribute."
  },
  {
    id: "q12",
    year: "GATE-style practice",
    topic: "Normalization",
    text: "A binary decomposition of R into R1 and R2 is lossless if which condition holds?",
    options: [
      "R1 and R2 have no common attributes",
      "The common attributes functionally determine all attributes of R1 or all attributes of R2",
      "Both relations have the same candidate key",
      "Both relations contain every attribute of R"
    ],
    correctAnswerIndex: 1,
    explanation: "For a binary decomposition, it is lossless when the common attributes functionally determine one of the two component relations."
  },
  {
    id: "q13",
    year: "GATE-style practice",
    topic: "Relational Algebra",
    text: "Which relational algebra operation selects rows satisfying a condition?",
    options: ["Projection (π)", "Selection (σ)", "Union (∪)", "Rename (ρ)"],
    correctAnswerIndex: 1,
    explanation: "Selection, denoted by σ, filters tuples according to a predicate."
  },
  {
    id: "q14",
    year: "GATE-style practice",
    topic: "Relational Algebra",
    text: "Which operation combines tuples from two relations based on a matching condition?",
    options: ["Difference", "Projection", "Join", "Rename"],
    correctAnswerIndex: 2,
    explanation: "Join combines related tuples from two relations using a specified or implicit matching condition."
  },
  {
    id: "q15",
    year: "GATE-style practice",
    topic: "SQL",
    text: "What does COUNT(*) return in a SQL query?",
    options: [
      "The number of non-NULL values in the first column",
      "The total number of rows in the group",
      "The number of distinct rows only",
      "The sum of numeric columns"
    ],
    correctAnswerIndex: 1,
    explanation: "COUNT(*) counts rows, including rows containing NULL values in individual columns."
  },
  {
    id: "q16",
    year: "GATE-style practice",
    topic: "SQL",
    text: "Which SQL clause filters groups after aggregate calculations?",
    options: ["WHERE", "ORDER BY", "HAVING", "DISTINCT"],
    correctAnswerIndex: 2,
    explanation: "HAVING filters groups, often using aggregate expressions. WHERE filters rows before grouping."
  },
  {
    id: "q17",
    year: "GATE-style practice",
    topic: "Transactions",
    text: "Which ACID property ensures that a transaction is completed entirely or has no effect?",
    options: ["Consistency", "Isolation", "Durability", "Atomicity"],
    correctAnswerIndex: 3,
    explanation: "Atomicity makes a transaction all-or-nothing."
  },
  {
    id: "q18",
    year: "GATE-style practice",
    topic: "Transactions",
    text: "A schedule is conflict-serializable if its precedence graph is:",
    options: ["Complete", "Cyclic", "Acyclic", "Disconnected"],
    correctAnswerIndex: 2,
    explanation: "A schedule is conflict-serializable exactly when its precedence graph contains no directed cycle."
  },
  {
    id: "q19",
    year: "GATE-style practice",
    topic: "Indexing",
    text: "What is a primary purpose of an index in a database?",
    options: [
      "To eliminate all duplicate rows",
      "To speed up data retrieval",
      "To guarantee serializability",
      "To enforce 4NF"
    ],
    correctAnswerIndex: 1,
    explanation: "Indexes can speed up searches and retrieval, at the cost of additional storage and maintenance during updates."
  },
  {
    id: "q20",
    year: "GATE-style practice",
    topic: "Indexing",
    text: "In a typical B+ tree index, where are the data entries or record pointers stored?",
    options: [
      "Only in the root",
      "Only in internal nodes",
      "In leaf nodes",
      "In a separate stack"
    ],
    correctAnswerIndex: 2,
    explanation: "B+ tree leaf nodes hold the data entries or record pointers and are typically linked for efficient range scans."
  }
].map((question) => ({
  ...question,
  difficulty:
    Number(question.id.replace('q', '')) <= 7
      ? 'Easy' as const
      : Number(question.id.replace('q', '')) <= 15
        ? 'Medium' as const
        : 'Hard' as const,
}));
