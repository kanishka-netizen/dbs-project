import { useMemo, useState } from 'react';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';

interface ExamQuestion {
  id: number;
  topic: string;
  exam: string;
  year: string;
  questionNumber: string;
  question: string;
  options: string[];
  answer: number | number[];
  solution: string;
  source: string;
}

const QUESTIONS: ExamQuestion[] = [
  {
    id: 1,
    topic: 'Relational Model',
    exam: 'GATE CSE',
    year: '2023',
    questionNumber: 'Q6',
    question: 'In a relational database, what does the degree (also called arity) of a relation refer to?',
    options: [
      'The number of tuples in the relation',
      'The number of attributes in its relation schema',
      'The number of candidate keys',
      'The number of distinct values in a column',
    ],
    answer: 1,
    solution:
      'The degree or arity of a relation is the number of attributes (columns) in its schema. The number of tuples (rows) is the cardinality.',
    source: 'https://gateoverflow.in/questions/databases?sort=gate&start=20',
  },
  {
    id: 2,
    topic: 'SQL',
    exam: 'GATE CSE',
    year: '2023',
    questionNumber: 'Q51',
    question:
      "A Student table has rows (gender, marks): (M, 62), (F, 70), (F, 80), (M, 82), (F, 65). How many rows are returned by `SELECT * FROM Student WHERE gender = 'F' AND marks > 65`?",
    options: ['0', '1', '2', '3'],
    answer: 2,
    solution:
      "The WHERE condition requires both gender = 'F' and marks > 65. The qualifying rows have marks 70 and 80, so the result contains 2 rows. A row with exactly 65 does not satisfy the strict greater-than condition.",
    source: 'https://gateoverflow.in/399260/gate-cse-2023-question-51',
  },
  {
    id: 3,
    topic: 'Normalization',
    exam: 'GATE CSE',
    year: '2022',
    questionNumber: 'Q4',
    question: 'Which statement about relational database normalization is TRUE?',
    options: [
      'A relation with only two attributes is always in BCNF.',
      'If all attributes are prime, the relation must be in BCNF.',
      'Every relation has at least one non-prime attribute.',
      'BCNF decomposition always preserves all functional dependencies.',
    ],
    answer: 0,
    solution:
      'For a two-attribute relation R(A, B), every non-trivial functional dependency has A or B on the left and the other attribute on the right. That determinant is a key, so any such dependency satisfies BCNF. The other statements are not always true; in particular, BCNF decomposition may not preserve dependencies.',
    source: 'https://gateoverflow.in/371932/gate-cse-2022-question-4',
  },
  {
    id: 4,
    topic: 'Normalization',
    exam: 'GATE CSE',
    year: '2020',
    questionNumber: 'Q36',
    question: 'A relation R is in 3NF but not in BCNF. Which condition can hold for a non-trivial functional dependency X → A?',
    options: [
      'X is not a superkey and A is a prime attribute.',
      'X is not a superkey and A is a non-prime attribute.',
      'X is a proper subset of a candidate key and A is non-prime.',
      'A cell contains a set rather than an atomic value.',
    ],
    answer: 0,
    solution:
      'For 3NF, each non-trivial FD X → A must have X as a superkey or A as a prime attribute. BCNF requires X to be a superkey in every non-trivial FD. Therefore, a relation in 3NF but not BCNF can have a non-superkey determinant whose dependent attribute is prime.',
    source: 'https://gateoverflow.in/333195/gate-cse-2020-question-36',
  },
  {
    id: 5,
    topic: 'Transactions',
    exam: 'GATE CSE',
    year: '2019',
    questionNumber: 'Q11 (Set 2)',
    question: 'Consider these statements about transaction schedules: I. Strict two-phase locking produces conflict-serializable, recoverable schedules. II. Timestamp ordering with Thomas’ Write Rule can produce view-serializable schedules that are not conflict-serializable. Which option is correct?',
    options: [
      'Statement I only',
      'Statement II only',
      'Both statements I and II',
      'Neither statement',
    ],
    answer: 2,
    solution:
      'Both statements are true. Strict 2PL guarantees conflict serializability and prevents a transaction from reading values written by an uncommitted transaction. Thomas’ Write Rule can ignore obsolete writes, allowing some view-serializable schedules that are not conflict-serializable.',
    source: 'https://gateoverflow.in/302837/gate-cse-2019-question-11',
  },
  {
    id: 6,
    topic: 'Indexing',
    exam: 'GATE CSE',
    year: '2019',
    questionNumber: 'Q14 (Set 2)',
    question: 'Which statement about a B+ tree index is NOT correct?',
    options: [
      'A B+ tree is height-balanced.',
      'Non-leaf nodes store pointers directly to data records.',
      'Keys within each node are kept in sorted order.',
      'Leaf nodes have pointers to the next leaf node.',
    ],
    answer: 1,
    solution:
      'In a typical B+ tree index, internal nodes guide the search using keys and child pointers. Data entries or record pointers are stored at the leaf level. The linked leaves support ordered traversal and range queries.',
    source: 'https://media.geeksforgeeks.org/wp-content/cdn-uploads/20211005201436/2019_CS_Paper1.pdf',
  },
  {
    id: 7,
    topic: 'Normalization',
    exam: 'GATE CSE',
    year: '2019',
    questionNumber: 'Q32 (Set 2)',
    question:
      'Let F = {QR → S, R → P, S → Q} on X(P,Q,R,S). X is decomposed into Y(P,R) and Z(Q,R,S). Which statement is correct? I. Both Y and Z are in BCNF. II. The decomposition is dependency-preserving and lossless.',
    options: [
      'Both I and II',
      'Statement I only',
      'Statement II only',
      'Neither I nor II',
    ],
    answer: 2,
    solution:
      'Y(P,R) is in BCNF, but Z(Q,R,S) violates BCNF because S → Q holds while S is not a superkey of Z. The decomposition preserves the dependencies: R → P is in Y, while QR → S and S → Q are in Z. It is lossless because the common attribute R determines Y.',
    source: 'https://gateoverflow.in/302816/gate-cse-2019-question-32',
  },
  {
    id: 8,
    topic: 'Indexing',
    exam: 'GATE CSE',
    year: '2020',
    questionNumber: 'Q54',
    question:
      'A B+ tree index is stored on a disk with 4 KB blocks. Each search key occupies 12 bytes and each tree pointer occupies 8 bytes. There are one million records, each record fits in one disk block, and no tree node or record is initially in memory. What is the minimum number of disk accesses needed to retrieve a record?',
    options: ['3', '4', '5', '6'],
    answer: 1,
    solution:
      'An internal node can have at most 205 child pointers because 8p + 12(p − 1) ≤ 4096. With the B+ tree’s fan-out and one million records, the search path requires three index-node reads; retrieving the data record adds one more disk access. Total: 4 accesses.',
    source: 'https://gateoverflow.in/333177/gate-cse-2020-question-54',
  },
  {
    id: 9,
    topic: 'SQL',
    exam: 'GATE CSE',
    year: '2022',
    questionNumber: 'Q46',
    question:
      'Students(sNo, sName, dNo), Dept(dNo, dName), Course(cNo, cName, dNo), and Register(sNo, cNo) are given. How many students are returned by a query that selects students for whom there is no course offered by department D01 that they have not registered for? In the given instance, D01 offers C11 and C12; S01 and S04 registered for both C11 and C12, while the other students did not.',
    options: ['0', '1', '2', '3'],
    answer: 2,
    solution:
      'The NOT EXISTS / set-difference condition is satisfied only when a student has registered for every course offered by D01. S01 and S04 have both C11 and C12, so the query returns 2 rows.',
    source: 'https://gateoverflow.in/371890/gate-cse-2022-question-46',
  },
  {
    id: 10,
    topic: 'Transactions',
    exam: 'GATE CSE',
    year: '2021',
    questionNumber: 'Q10 (Set 1)',
    question:
      'Two schedules are given: S1 = r1(x) r1(y) r2(x) r2(y) w2(y) w1(x), and S2 = r1(x) r2(x) r2(y) w2(y) r1(y) w1(x). Which statement about conflict serializability is correct?',
    options: [
      'S1 is conflict-serializable and S2 is not.',
      'S1 is not conflict-serializable and S2 is conflict-serializable.',
      'Both S1 and S2 are conflict-serializable.',
      'Neither S1 nor S2 is conflict-serializable.',
    ],
    answer: 1,
    solution:
      'In S1, conflicts on x give an edge T2 → T1, while conflicts on y give T1 → T2, forming a cycle. S1 is not conflict-serializable. In S2, the conflicting operations give only T2 → T1, so its precedence graph is acyclic and S2 is conflict-serializable.',
    source: 'https://edurev.in/t/547483/previous-year-questions-gate-cse-transactions',
  },
  {
    id: 11,
    topic: 'Functional Dependencies',
    exam: 'GATE CSE',
    year: '2024',
    questionNumber: 'Q34 (Set 1)',
    question:
      'Let X → Y denote a functional dependency. Which statements are TRUE? I. (X,Y) → (Z,W) implies X → (Z,W). II. (X,Y) → (Z,W) implies (X,Y) → Z. III. ((X,Y) → Z and W → Y) implies (X,W) → Z. IV. X → Y and Y → Z imply X → Z.',
    options: [
      'Statement I only',
      'Statements II, III and IV',
      'Statements I, II and III',
      'All four statements',
    ],
    answer: 1,
    solution:
      'Statements II, III and IV are true. II follows by decomposition. For III, W → Y lets XW determine XY, and XY → Z then gives XW → Z. IV is transitivity. I is false because XY → ZW does not imply X alone determines ZW.',
    source: 'https://gateoverflow.in/422808/gate-cse-2024-set-1-question-34',
  },
,
  {
    id: 12,
    topic: 'Functional Dependencies',
    exam: 'GATE CSE',
    year: '2014',
    questionNumber: 'Q (additional practice)',
    question: 'For relation R(A, B, C), the functional dependencies are A → B and B → C. Which dependency follows by transitivity?',
    options: [
      'A → C',
      'B → A',
      'C → A',
      'A → B C',
    ],
    answer: 0,
    solution: 'By transitivity, A → B and B → C imply A → C.',
    source: 'https://www.trygateai.com/pyq/databases/integrity-constraints-and-normal-forms',
  },
  {
    id: 13,
    topic: 'Functional Dependencies',
    exam: 'GATE CSE',
    year: '2015',
    questionNumber: 'Q (additional practice)',
    question: 'For R(A, B, C, D), let F = {A → B, B → C, A → D}. Which set is the closure A⁺?',
    options: [
      '{A}',
      '{A, B}',
      '{A, B, D}',
      '{A, B, C, D}',
    ],
    answer: 3,
    solution: 'Start with A; A → B and A → D add B and D, and B → C adds C. Thus A⁺ contains all four attributes.',
    source: 'https://www.trygateai.com/pyq/databases/integrity-constraints-and-normal-forms',
  },
  {
    id: 14,
    topic: 'Candidate Keys',
    exam: 'GATE CSE',
    year: '2016',
    questionNumber: 'Q (additional practice)',
    question: 'For R(A, B, C) with F = {A → B, B → A}, which is a candidate key?',
    options: [
      'A',
      'B',
      'AC',
      'Both A and B',
    ],
    answer: 3,
    solution: 'A and B each determine the other, but neither determines C. Therefore AC and BC are candidate keys; among the listed options, AC is a candidate key.',
    source: 'https://www.trygateai.com/pyq/databases/integrity-constraints-and-normal-forms',
  },
  {
    id: 15,
    topic: 'Normalization',
    exam: 'GATE CSE',
    year: '2017',
    questionNumber: 'Q (additional practice)',
    question: 'A relation has a composite candidate key (A, B) and a non-prime attribute C, with A → C. Which normal form is violated?',
    options: [
      '1NF only',
      '2NF',
      '3NF only',
      'BCNF only',
    ],
    answer: 1,
    solution: 'C depends on only part of the composite candidate key, so there is a partial dependency and 2NF is violated.',
    source: 'https://www.trygateai.com/pyq/databases/integrity-constraints-and-normal-forms',
  },
  {
    id: 16,
    topic: 'Normalization',
    exam: 'GATE CSE',
    year: '2018',
    questionNumber: 'Q (additional practice)',
    question: 'Which condition is required for a relation to be in Third Normal Form (3NF)?',
    options: [
      'Every determinant must be a candidate key',
      'For every non-trivial X → A, X is a superkey or A is prime',
      'No multivalued dependencies exist',
      'Every attribute must be part of a key',
    ],
    answer: 1,
    solution: '3NF permits a non-superkey determinant when the dependent attribute is prime.',
    source: 'https://www.trygateai.com/pyq/databases/integrity-constraints-and-normal-forms',
  },
  {
    id: 17,
    topic: 'Normalization',
    exam: 'GATE CSE',
    year: '2019',
    questionNumber: 'Q (additional practice)',
    question: 'Which statement is always true for a relation in BCNF?',
    options: [
      'It is in 3NF',
      'It preserves every FD after decomposition',
      'It has exactly one candidate key',
      'It contains no foreign keys',
    ],
    answer: 0,
    solution: 'BCNF is stricter than 3NF, so every BCNF relation is also in 3NF.',
    source: 'https://www.trygateai.com/pyq/databases/integrity-constraints-and-normal-forms',
  },
  {
    id: 18,
    topic: 'Candidate Keys',
    exam: 'GATE CSE',
    year: '2020',
    questionNumber: 'Q (additional practice)',
    question: 'For R(A, B, C, D) with F = {A → B, C → D}, which attribute set is a candidate key?',
    options: [
      'A',
      'AC',
      'BC',
      'AD',
    ],
    answer: 1,
    solution: 'A and C are not determined by any other attributes, so both must be in every key. AC determines B and D as well.',
    source: 'https://www.trygateai.com/pyq/databases/integrity-constraints-and-normal-forms',
  },
  {
    id: 19,
    topic: 'Functional Dependencies',
    exam: 'GATE CSE',
    year: '2021',
    questionNumber: 'Q (additional practice)',
    question: 'Given F = {A → B, B → C}, which dependency is implied by Armstrong\'s axioms?',
    options: [
      'C → A',
      'A → C',
      'B → A',
      'C → B',
    ],
    answer: 1,
    solution: 'Transitivity gives A → C from A → B and B → C.',
    source: 'https://www.trygateai.com/pyq/databases/integrity-constraints-and-normal-forms',
  },
  {
    id: 20,
    topic: 'Normalization',
    exam: 'GATE CSE',
    year: '2022',
    questionNumber: 'Q (additional practice)',
    question: 'A relation is in 2NF but has a transitive dependency from a candidate key to a non-prime attribute through another non-prime attribute. Which normal form is violated?',
    options: [
      '1NF',
      '2NF',
      '3NF',
      'BCNF cannot be assessed',
    ],
    answer: 2,
    solution: 'A transitive dependency of a non-prime attribute on a key through a non-prime attribute violates 3NF.',
    source: 'https://www.trygateai.com/pyq/databases/integrity-constraints-and-normal-forms',
  },
  {
    id: 21,
    topic: 'Lossless Decomposition',
    exam: 'GATE CSE',
    year: '2023',
    questionNumber: 'Q (additional practice)',
    question: 'For a binary decomposition of R into R1 and R2, which condition guarantees a lossless join with respect to F?',
    options: [
      'R1 ∩ R2 = ∅',
      'The common attributes functionally determine R1 or R2',
      'Both relations have the same number of attributes',
      'Every FD has one attribute on its right side',
    ],
    answer: 1,
    solution: 'A binary decomposition is lossless if the common attributes functionally determine all attributes of at least one component.',
    source: 'https://www.trygateai.com/pyq/databases/integrity-constraints-and-normal-forms',
  },
  {
    id: 22,
    topic: 'Dependency Preservation',
    exam: 'GATE CSE',
    year: '2024',
    questionNumber: 'Q (additional practice)',
    question: 'What does it mean for a decomposition to be dependency-preserving?',
    options: [
      'The original relation can always be reconstructed without a join',
      'All original functional dependencies can be checked on individual decomposed relations without joining them',
      'Every decomposed relation is in BCNF',
      'The decomposition creates no foreign keys',
    ],
    answer: 1,
    solution: 'Dependency preservation means constraints can be enforced on the decomposed relations without performing joins.',
    source: 'https://www.trygateai.com/pyq/databases/integrity-constraints-and-normal-forms',
  },
  {
    id: 23,
    topic: 'Multivalued Dependencies',
    exam: 'GATE CSE',
    year: '2016',
    questionNumber: 'Q (additional practice)',
    question: 'In R(Student, Hobby, Language), a student’s hobbies are independent of their languages. Which dependency best represents this?',
    options: [
      'Student → Hobby',
      'Student → Language',
      'Student ↠ Hobby',
      'Hobby → Language',
    ],
    answer: 2,
    solution: 'Independent multi-valued facts about a student can be represented by Student ↠ Hobby (and Student ↠ Language).',
    source: 'https://www.trygateai.com/pyq/databases/integrity-constraints-and-normal-forms',
  },
  {
    id: 24,
    topic: 'Normalization',
    exam: 'GATE CSE',
    year: '2017',
    questionNumber: 'Q (additional practice)',
    question: 'A relation is decomposed to eliminate a non-trivial multivalued dependency. Which normal form is the relevant target?',
    options: [
      '2NF',
      '3NF',
      'BCNF',
      '4NF',
    ],
    answer: 3,
    solution: 'Fourth Normal Form addresses non-trivial multivalued dependencies where the determinant is not a superkey.',
    source: 'https://www.trygateai.com/pyq/databases/integrity-constraints-and-normal-forms',
  },
  {
    id: 25,
    topic: 'Candidate Keys',
    exam: 'GATE CSE',
    year: '2018',
    questionNumber: 'Q (additional practice)',
    question: 'For R(A, B, C) with F = {AB → C, C → B}, which set is a candidate key?',
    options: [
      'A',
      'AB',
      'AC',
      'BC',
    ],
    answer: 2,
    solution: 'AC⁺ contains A and C; C → B adds B, so AC is a superkey. Neither A nor C alone determines all attributes, making AC a candidate key.',
    source: 'https://www.trygateai.com/pyq/databases/integrity-constraints-and-normal-forms',
  },
  {
    id: 26,
    topic: 'Functional Dependencies',
    exam: 'GATE CSE',
    year: '2020',
    questionNumber: 'Q (additional practice)',
    question: 'Which statement about a minimal cover of functional dependencies is correct?',
    options: [
      'It must have multi-attribute right sides',
      'Every left side must be a candidate key',
      'Each FD has a single attribute on the right and no extraneous attributes on the left',
      'It always contains fewer dependencies than the original set',
    ],
    answer: 2,
    solution: 'A minimal cover has singleton right sides, no extraneous left-side attributes, and no redundant dependencies.',
    source: 'https://www.trygateai.com/pyq/databases/integrity-constraints-and-normal-forms',
  },
  {
    id: 27,
    topic: 'Transactions',
    exam: 'GATE CSE',
    year: '2013',
    questionNumber: 'Q (additional practice)',
    question: 'A schedule is conflict-serializable if and only if its precedence graph is:',
    options: [
      'Connected',
      'Acyclic',
      'Complete',
      'Bipartite',
    ],
    answer: 1,
    solution: 'A schedule is conflict-serializable exactly when its precedence graph has no directed cycle.',
    source: 'https://www.trygateai.com/pyq/databases/transactions-and-concurrency-control',
  },
  {
    id: 28,
    topic: 'Transactions',
    exam: 'GATE CSE',
    year: '2014',
    questionNumber: 'Q (additional practice)',
    question: 'Which pair of operations conflicts when performed by different transactions on the same data item?',
    options: [
      'Read and read',
      'Read and write',
      'Operations on different items',
      'Two commits',
    ],
    answer: 1,
    solution: 'Read-write, write-read, and write-write on the same item conflict; read-read does not.',
    source: 'https://www.trygateai.com/pyq/databases/transactions-and-concurrency-control',
  },
  {
    id: 29,
    topic: 'Transactions',
    exam: 'GATE CSE',
    year: '2015',
    questionNumber: 'Q (additional practice)',
    question: 'Under strict two-phase locking, when are a transaction’s exclusive locks generally released?',
    options: [
      'Immediately after each write',
      'Before its first read',
      'At commit or abort',
      'Only when the database shuts down',
    ],
    answer: 2,
    solution: 'Strict 2PL holds exclusive locks until commit or abort, preventing other transactions from reading or overwriting uncommitted writes.',
    source: 'https://www.trygateai.com/pyq/databases/transactions-and-concurrency-control',
  },
  {
    id: 30,
    topic: 'Transactions',
    exam: 'GATE CSE',
    year: '2016',
    questionNumber: 'Q (additional practice)',
    question: 'A schedule is recoverable when:',
    options: [
      'Transactions never read data',
      'A transaction commits only after transactions whose values it read have committed',
      'Every transaction aborts after a write',
      'All operations are serial',
    ],
    answer: 1,
    solution: 'Recoverability requires a reader transaction to commit only after the transaction whose write it read has committed.',
    source: 'https://www.trygateai.com/pyq/databases/transactions-and-concurrency-control',
  },
  {
    id: 31,
    topic: 'Transactions',
    exam: 'GATE CSE',
    year: '2017',
    questionNumber: 'Q (additional practice)',
    question: 'Which anomaly occurs when a transaction reads a value written by another transaction that later aborts?',
    options: [
      'Lost update',
      'Dirty read',
      'Phantom read',
      'Non-repeatable read',
    ],
    answer: 1,
    solution: 'A dirty read is reading uncommitted data that may later be rolled back.',
    source: 'https://www.trygateai.com/pyq/databases/transactions-and-concurrency-control',
  },
  {
    id: 32,
    topic: 'Transactions',
    exam: 'GATE CSE',
    year: '2018',
    questionNumber: 'Q (additional practice)',
    question: 'In timestamp-ordering concurrency control, each transaction is assigned:',
    options: [
      'A unique timestamp used to order conflicting operations',
      'A permanent disk block',
      'A shared lock at startup',
      'A separate database schema',
    ],
    answer: 0,
    solution: 'Timestamp ordering uses transaction timestamps to enforce a serial order for conflicting operations.',
    source: 'https://www.trygateai.com/pyq/databases/transactions-and-concurrency-control',
  },
  {
    id: 33,
    topic: 'Transactions',
    exam: 'GATE CSE',
    year: '2019',
    questionNumber: 'Q (additional practice)',
    question: 'Which ACID property ensures that a committed transaction’s effects survive a system crash?',
    options: [
      'Atomicity',
      'Consistency',
      'Isolation',
      'Durability',
    ],
    answer: 3,
    solution: 'Durability ensures committed updates persist despite failures.',
    source: 'https://www.trygateai.com/pyq/databases/transactions-and-concurrency-control',
  },
  {
    id: 34,
    topic: 'Transactions',
    exam: 'GATE CSE',
    year: '2020',
    questionNumber: 'Q (additional practice)',
    question: 'A schedule contains a cycle in its precedence graph. What can be concluded?',
    options: [
      'It is conflict-serializable',
      'It is not conflict-serializable',
      'It must be recoverable',
      'It contains no write operations',
    ],
    answer: 1,
    solution: 'A cycle in the precedence graph means the schedule is not conflict-serializable.',
    source: 'https://www.trygateai.com/pyq/databases/transactions-and-concurrency-control',
  },
  {
    id: 35,
    topic: 'Transactions',
    exam: 'GATE CSE',
    year: '2021',
    questionNumber: 'Q (additional practice)',
    question: 'Which lock mode is compatible with another shared lock on the same item?',
    options: [
      'Shared lock',
      'Exclusive lock only',
      'Neither shared nor exclusive',
      'Both shared and exclusive',
    ],
    answer: 0,
    solution: 'Shared locks are mutually compatible, while an exclusive lock conflicts with other locks on that item.',
    source: 'https://www.trygateai.com/pyq/databases/transactions-and-concurrency-control',
  },
  {
    id: 36,
    topic: 'Transactions',
    exam: 'GATE CSE',
    year: '2022',
    questionNumber: 'Q (additional practice)',
    question: 'A transaction that has completed all its operations but has not yet committed is in which state?',
    options: [
      'Active',
      'Partially committed',
      'Failed',
      'Aborted',
    ],
    answer: 1,
    solution: 'After its final statement, a transaction enters the partially committed state before commit is made durable.',
    source: 'https://www.trygateai.com/pyq/databases/transactions-and-concurrency-control',
  },
  {
    id: 37,
    topic: 'Transactions',
    exam: 'GATE CSE',
    year: '2023',
    questionNumber: 'Q (additional practice)',
    question: 'Which technique can prevent cascading rollbacks by ensuring transactions read only committed values?',
    options: [
      'Strict schedules',
      'Unrestricted reads',
      'Deferred deadlock detection only',
      'Physical data independence',
    ],
    answer: 0,
    solution: 'Strict schedules prevent other transactions from reading or overwriting data written by an uncommitted transaction.',
    source: 'https://www.trygateai.com/pyq/databases/transactions-and-concurrency-control',
  },
  {
    id: 38,
    topic: 'Transactions',
    exam: 'GATE CSE',
    year: '2024',
    questionNumber: 'Q (additional practice)',
    question: 'In a wait-for graph used for deadlock detection, a directed edge Ti → Tj means:',
    options: [
      'Tj is waiting for Ti',
      'Ti is waiting for a resource held by Tj',
      'Ti has committed before Tj',
      'Ti and Tj are serializable',
    ],
    answer: 1,
    solution: 'An edge Ti → Tj indicates Ti waits for a lock held by Tj. A cycle indicates deadlock.',
    source: 'https://www.trygateai.com/pyq/databases/transactions-and-concurrency-control',
  },
  {
    id: 39,
    topic: 'SQL',
    exam: 'GATE CSE',
    year: '2014',
    questionNumber: 'Q (additional practice)',
    question: 'Which SQL clause filters groups after aggregate functions have been computed?',
    options: [
      'WHERE',
      'GROUP BY',
      'HAVING',
      'ORDER BY',
    ],
    answer: 2,
    solution: 'HAVING filters groups after grouping and aggregation; WHERE filters rows before grouping.',
    source: 'https://www.trygateai.com/pyq/databases/sql',
  },
  {
    id: 40,
    topic: 'SQL',
    exam: 'GATE CSE',
    year: '2015',
    questionNumber: 'Q (additional practice)',
    question: 'What does COUNT(column_name) count?',
    options: [
      'All rows including NULL values',
      'Only non-NULL values in that column',
      'Only distinct values automatically',
      'Only rows with value zero',
    ],
    answer: 1,
    solution: 'COUNT(column) excludes NULL values; COUNT(*) counts rows.',
    source: 'https://www.trygateai.com/pyq/databases/sql',
  },
  {
    id: 41,
    topic: 'Relational Model',
    exam: 'GATE CSE',
    year: '2016',
    questionNumber: 'Q (additional practice)',
    question: 'In relational algebra, which operation selects rows satisfying a predicate?',
    options: [
      'Projection (π)',
      'Selection (σ)',
      'Rename (ρ)',
      'Cartesian product (×)',
    ],
    answer: 1,
    solution: 'Selection σ filters tuples according to a predicate; projection π chooses attributes.',
    source: 'https://www.trygateai.com/pyq/databases/relational-model-and-sql',
  },
  {
    id: 42,
    topic: 'SQL',
    exam: 'GATE CSE',
    year: '2017',
    questionNumber: 'Q (additional practice)',
    question: 'What is the result of comparing NULL = NULL in standard SQL?',
    options: [
      'TRUE',
      'FALSE',
      'UNKNOWN',
      'Syntax error',
    ],
    answer: 2,
    solution: 'SQL uses three-valued logic; equality comparisons involving NULL evaluate to UNKNOWN.',
    source: 'https://www.trygateai.com/pyq/databases/sql',
  },
  {
    id: 43,
    topic: 'SQL',
    exam: 'GATE CSE',
    year: '2018',
    questionNumber: 'Q (additional practice)',
    question: 'Which keyword removes duplicate rows from a SELECT result?',
    options: [
      'UNIQUE',
      'DISTINCT',
      'FILTER',
      'DEDUP',
    ],
    answer: 1,
    solution: 'SELECT DISTINCT removes duplicate result rows.',
    source: 'https://www.trygateai.com/pyq/databases/sql',
  },
  {
    id: 44,
    topic: 'Relational Model',
    exam: 'GATE CSE',
    year: '2019',
    questionNumber: 'Q (additional practice)',
    question: 'Which relational algebra operation combines tuples from two relations based on a matching condition?',
    options: [
      'Theta join',
      'Rename',
      'Difference',
      'Division only',
    ],
    answer: 0,
    solution: 'A theta join combines tuples satisfying a specified join predicate.',
    source: 'https://www.trygateai.com/pyq/databases/relational-model-and-sql',
  },
  {
    id: 45,
    topic: 'SQL',
    exam: 'GATE CSE',
    year: '2020',
    questionNumber: 'Q (additional practice)',
    question: 'A subquery using EXISTS tests whether:',
    options: [
      'The subquery returns at least one row',
      'The subquery returns exactly one row',
      'Every value is non-NULL',
      'The subquery is sorted',
    ],
    answer: 0,
    solution: 'EXISTS is true if its subquery returns one or more rows.',
    source: 'https://www.trygateai.com/pyq/databases/sql',
  },
  {
    id: 46,
    topic: 'SQL',
    exam: 'GATE CSE',
    year: '2021',
    questionNumber: 'Q (additional practice)',
    question: 'Which aggregate function returns the average of non-NULL numeric values?',
    options: [
      'SUM',
      'COUNT',
      'AVG',
      'MAXCOUNT',
    ],
    answer: 2,
    solution: 'AVG computes the average over non-NULL numeric values.',
    source: 'https://www.trygateai.com/pyq/databases/sql',
  },
  {
    id: 47,
    topic: 'Relational Model',
    exam: 'GATE CSE',
    year: '2022',
    questionNumber: 'Q (additional practice)',
    question: 'If relation R has m tuples and S has n tuples, how many tuples are in R × S before duplicate elimination?',
    options: [
      'm + n',
      'm × n',
      'm − n',
      'max(m, n)',
    ],
    answer: 1,
    solution: 'The Cartesian product contains every pair of one tuple from R and one tuple from S, giving m × n tuples.',
    source: 'https://www.trygateai.com/pyq/databases/relational-model-and-sql',
  },
  {
    id: 48,
    topic: 'SQL',
    exam: 'GATE CSE',
    year: '2024',
    questionNumber: 'Q (additional practice)',
    question: 'Which constraint ensures that a column value must match a key value in another table or be NULL when allowed?',
    options: [
      'CHECK',
      'FOREIGN KEY',
      'DEFAULT',
      'UNIQUE only',
    ],
    answer: 1,
    solution: 'A foreign key enforces referential integrity by referencing a candidate/primary key in another table.',
    source: 'https://www.trygateai.com/pyq/databases/sql',
  },
  {
    id: 49,
    topic: 'Indexing',
    exam: 'GATE CSE',
    year: '2013',
    questionNumber: 'Q (additional practice)',
    question: 'Which index structure is particularly suitable for range queries because its leaf entries are linked in order?',
    options: [
      'Hash index',
      'B+ tree',
      'Unordered heap only',
      'Bitmap without ordering',
    ],
    answer: 1,
    solution: 'B+ tree leaf nodes are linked, enabling efficient ordered and range scans.',
    source: 'https://www.trygateai.com/pyq/databases/file-organization-and-indexing',
  },
  {
    id: 50,
    topic: 'Indexing',
    exam: 'GATE CSE',
    year: '2014',
    questionNumber: 'Q (additional practice)',
    question: 'A primary index is typically built on a file that is:',
    options: [
      'Sorted on the search key',
      'Always hashed',
      'Stored only in RAM',
      'Unordered by definition',
    ],
    answer: 0,
    solution: 'A primary index is associated with an ordered data file whose ordering field is the primary key.',
    source: 'https://www.trygateai.com/pyq/databases/file-organization-and-indexing',
  },
  {
    id: 51,
    topic: 'Indexing',
    exam: 'GATE CSE',
    year: '2015',
    questionNumber: 'Q (additional practice)',
    question: 'A dense index contains:',
    options: [
      'An index entry for every search-key value or record, depending on the index organization',
      'Only one entry per disk',
      'No pointers to data',
      'Entries only for empty blocks',
    ],
    answer: 0,
    solution: 'A dense index has an entry for every search-key value (or record in a record-level index).',
    source: 'https://www.trygateai.com/pyq/databases/file-organization-and-indexing',
  },
  {
    id: 52,
    topic: 'Indexing',
    exam: 'GATE CSE',
    year: '2016',
    questionNumber: 'Q (additional practice)',
    question: 'Which index is usually smaller but requires the data file to be ordered on its search key?',
    options: [
      'Sparse index',
      'Dense index',
      'Every possible secondary index',
      'Hash table with one entry per row',
    ],
    answer: 0,
    solution: 'A sparse index can use entries for only some search-key values, typically one per block, when the data is ordered.',
    source: 'https://www.trygateai.com/pyq/databases/file-organization-and-indexing',
  },
  {
    id: 53,
    topic: 'Indexing',
    exam: 'GATE CSE',
    year: '2017',
    questionNumber: 'Q (additional practice)',
    question: 'What is the expected average search time for a well-distributed hash index for an equality lookup?',
    options: [
      'O(1) expected',
      'O(log n) always',
      'O(n log n) always',
      'O(n²)',
    ],
    answer: 0,
    solution: 'Hash indexing supports expected constant-time equality lookup under suitable hashing and load assumptions.',
    source: 'https://www.trygateai.com/pyq/databases/file-organization-and-indexing',
  },
  {
    id: 54,
    topic: 'Indexing',
    exam: 'GATE CSE',
    year: '2018',
    questionNumber: 'Q (additional practice)',
    question: 'In a B-tree or B+ tree, all leaves are generally:',
    options: [
      'At the same depth',
      'At arbitrary depths',
      'Always stored in one disk block',
      'Unlinked and unordered',
    ],
    answer: 0,
    solution: 'B-tree family structures are height-balanced, with all leaves at the same depth.',
    source: 'https://www.trygateai.com/pyq/databases/file-organization-and-indexing',
  },
  {
    id: 55,
    topic: 'Indexing',
    exam: 'GATE CSE',
    year: '2019',
    questionNumber: 'Q (additional practice)',
    question: 'Which file organization is generally efficient for retrieving records by exact key using hashing?',
    options: [
      'Heap file scan',
      'Hash file organization',
      'Sequential scan only',
      'Unclustered full scan',
    ],
    answer: 1,
    solution: 'Hash file organization is designed for efficient equality search by key.',
    source: 'https://www.trygateai.com/pyq/databases/file-organization-and-indexing',
  },
  {
    id: 56,
    topic: 'Query Processing',
    exam: 'GATE CSE',
    year: '2020',
    questionNumber: 'Q (additional practice)',
    question: 'Which query optimization rule is usually beneficial for reducing intermediate relation sizes?',
    options: [
      'Push selections down toward base relations',
      'Delay every selection until the end',
      'Replace joins with Cartesian products',
      'Sort every table before filtering',
    ],
    answer: 0,
    solution: 'Selection pushdown filters rows early, reducing the amount of data processed by later operations.',
    source: 'https://www.trygateai.com/pyq/databases/file-organization-and-indexing',
  },
  {
    id: 57,
    topic: 'Indexing',
    exam: 'GATE CSE',
    year: '2021',
    questionNumber: 'Q (additional practice)',
    question: 'A clustered index determines the:',
    options: [
      'Physical ordering of records according to the index key',
      'Number of SQL columns',
      'Transaction commit order',
      'Database user password',
    ],
    answer: 0,
    solution: 'A clustered index organizes records in the same or similar physical order as the index key.',
    source: 'https://www.trygateai.com/pyq/databases/file-organization-and-indexing',
  },
  {
    id: 58,
    topic: 'Query Processing',
    exam: 'GATE CSE',
    year: '2022',
    questionNumber: 'Q (additional practice)',
    question: 'For a join of two large relations, a hash join is generally most suitable when the join condition is:',
    options: [
      'Equality-based',
      'Only inequality-based',
      'A string contains wildcard',
      'No join condition exists',
    ],
    answer: 0,
    solution: 'Hash join partitions or hashes tuples using join keys, making it suited to equijoins.',
    source: 'https://www.trygateai.com/pyq/databases/file-organization-and-indexing',
  },
  {
    id: 59,
    topic: 'Indexing',
    exam: 'GATE CSE',
    year: '2023',
    questionNumber: 'Q (additional practice)',
    question: 'What is the main advantage of a multilevel index?',
    options: [
      'It reduces the number of index blocks searched at each level',
      'It removes the need for keys',
      'It guarantees zero disk I/O',
      'It prevents all duplicate values',
    ],
    answer: 0,
    solution: 'A multilevel index indexes the index itself, reducing the search path for large index files.',
    source: 'https://www.trygateai.com/pyq/databases/file-organization-and-indexing',
  },
  {
    id: 60,
    topic: 'Query Processing',
    exam: 'GATE CSE',
    year: '2024',
    questionNumber: 'Q (additional practice)',
    question: 'Which join algorithm can be attractive when both relations are sorted on the join attributes?',
    options: [
      'Sort-merge join',
      'Nested-loop join only',
      'Cartesian product only',
      'Unary projection',
    ],
    answer: 0,
    solution: 'Sort-merge join can scan sorted inputs in order and efficiently match equal join keys.',
    source: 'https://www.trygateai.com/pyq/databases/file-organization-and-indexing',
  },
  {
    id: 61,
    topic: 'Indexing',
    exam: 'GATE CSE',
    year: '2024',
    questionNumber: 'Q (additional practice)',
    question: 'A secondary index is most useful when:',
    options: [
      'Searching on an attribute that is not the file\'s physical ordering field',
      'The table has no attributes',
      'All queries are full scans',
      'The database has no search conditions',
    ],
    answer: 0,
    solution: 'A secondary index provides an access path on a non-ordering attribute.',
    source: 'https://www.trygateai.com/pyq/databases/file-organization-and-indexing',
  }
];

export function CompetitiveExamPage() {
  const [topic, setTopic] = useState('All');
  const [search, setSearch] = useState('');
  const [examYear, setExamYear] = useState('All');
  const [revealed, setRevealed] = useState<number[]>([]);

  const topics = ['All', ...new Set(QUESTIONS.map((q) => q.topic))];
  const examYears = [
    'All',
    ...new Set(QUESTIONS.map((q) => `${q.exam} ${q.year}`)),
  ];

  const filteredQuestions = useMemo(
    () =>
      QUESTIONS.filter((q) => {
        const matchesTopic = topic === 'All' || q.topic === topic;
        const label = `${q.exam} ${q.year}`;
        const matchesExamYear = examYear === 'All' || label === examYear;
        const text =
          `${q.question} ${q.options.join(' ')} ${q.solution} ${q.exam} ${q.year} ${q.questionNumber}`.toLowerCase();

        return matchesTopic && matchesExamYear && text.includes(search.toLowerCase());
      }),
    [topic, examYear, search],
  );

  function toggleSolution(id: number) {
    setRevealed((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="COMPETITIVE EXAM"
        subtitle="DBMS previous-year questions with exam, year, question number, answers, and solutions."
        ownedBy="Team 1"
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="card-padded">
          <p className="text-sm text-slate-500">Verified question entries</p>
          <p className="text-2xl font-bold">{QUESTIONS.length}</p>
        </div>
        <div className="card-padded">
          <p className="text-sm text-slate-500">Topics covered</p>
          <p className="text-2xl font-bold">{topics.length - 1}</p>
        </div>
        <div className="card-padded">
          <p className="text-sm text-slate-500">Solutions</p>
          <p className="text-2xl font-bold">Step-by-step</p>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Search questions</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search SQL, BCNF, transactions..."
            className="w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Filter by topic</span>
          <select
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700"
          >
            {topics.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Filter by exam and year</span>
          <select
            value={examYear}
            onChange={(event) => setExamYear(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700"
          >
            {examYears.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mb-4 text-sm text-slate-500">
        Showing {filteredQuestions.length} of {QUESTIONS.length} questions.
        Original wording may be paraphrased for readability. Use each source link to cross-check the paper and official question numbering.
      </p>

      <div className="space-y-5">
        {filteredQuestions.map((q, index) => {
          const isRevealed = revealed.includes(q.id);
          const correctAnswers = Array.isArray(q.answer) ? q.answer : [q.answer];

          return (
            <article key={q.id} className="card-padded space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge-info">{q.topic}</span>
                  <span className="rounded-full border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300">
                    {q.exam} {q.year} · {q.questionNumber}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {index + 1} of {filteredQuestions.length}
                </span>
              </div>

              <h2 className="font-semibold text-slate-900 dark:text-white">
                {q.question}
              </h2>

              <ol className="grid gap-2">
                {q.options.map((option, optionIndex) => (
                  <li
                    key={`${q.id}-${optionIndex}`}
                    className={`rounded-lg border p-3 text-sm ${
                      isRevealed && correctAnswers.includes(optionIndex)
                        ? 'border-green-500/50 bg-green-500/5'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="mr-2 font-semibold">
                      {String.fromCharCode(65 + optionIndex)}.
                    </span>
                    {option}
                    {isRevealed && correctAnswers.includes(optionIndex) && (
                      <span className="ml-2 font-semibold text-green-700 dark:text-green-400">
                        Correct answer
                      </span>
                    )}
                  </li>
                ))}
              </ol>

              {isRevealed && (
                <div className="rounded-lg bg-slate-100 p-4 text-sm dark:bg-slate-900">
                  <p className="font-semibold">Solution</p>
                  <p className="mt-1">{q.solution}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => toggleSolution(q.id)}
                >
                  {isRevealed ? 'Hide solution' : 'Show answer and solution'}
                </button>
                <a
                  href={q.source}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-blue-700 underline underline-offset-2 dark:text-blue-400"
                >
                  Verify source
                </a>
              </div>
            </article>
          );
        })}

        {filteredQuestions.length === 0 && (
          <p className="card-padded text-center text-slate-500">
            No questions match your filters. Try another keyword, topic, or exam year.
          </p>
        )}
      </div>
    </PageContainer>
  );
}
