export interface QuizQuestion {
  id: string;
  year: string;
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
  }
];
