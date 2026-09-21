export interface FaqEntry {
  question: string;
  answer: string;
}

/**
 * FAQ — owned by Team 2 (TripleX).
 *
 * These are the questions the tool actually provokes. Several of them come
 * from its own behaviour looking wrong when it is in fact right.
 */
export const FAQ: FaqEntry[] = [
  {
    question: 'I wrote an MVD but 4NF still says "Satisfied". Why?',
    answer:
      'The dependency is probably trivial. X ↠ Y holds in every relation when Y is already inside X, or when X ∪ Y covers the whole relation — so it constrains nothing and the analyser skips it. For R(Supplier, Part, Project), "Supplier, Part ↠ Project" is trivial because those three attributes are the whole relation; "Supplier ↠ Part" is not.',
  },
  {
    question:
      'Why is the highest normal form "BCNF" when 4NF and 5NF both failed?',
    answer:
      'Normal forms nest: 5NF implies 4NF implies BCNF implies 3NF. The highest form is the last one in that chain with no violation, so a relation that clears BCNF but fails 4NF has BCNF as its highest. The 4NF and 5NF rows still report "Violated" — read them as "and it does not go further than BCNF".',
  },
  {
    question: 'Why does 5NF fail whenever 4NF fails?',
    answer:
      'Because every 5NF relation is also in 4NF. If a multivalued dependency already breaks 4NF, there is no way for the relation to satisfy the stronger 5NF condition. The analyser says so explicitly rather than leaving the two panels looking contradictory.',
  },
  {
    question: 'What does "BCNF costs you a dependency" mean?',
    answer:
      'A BCNF decomposition is always lossless but not always dependency preserving. When it is not, at least one functional dependency can only be checked by joining relations back together — which defeats the point of decomposing. 3NF always preserves dependencies, which is exactly why BCNF is not automatically the better choice.',
  },
  {
    question: 'Why did my dependency only produce a warning?',
    answer:
      'It was trivial — something like "A, B → A", where the right-hand side is already contained in the left. It holds in every relation, so it cannot break a normal form. You get a warning rather than an error because the schema is still analysable; the dependency is just doing no work.',
  },
  {
    question: 'Why can the tool not detect a 1NF violation?',
    answer:
      'A JSON attribute list cannot express a repeating group or a non-atomic value — by the time the schema reaches the analyser, every attribute already looks atomic. 1NF is therefore assumed and reported as satisfied. If you want to test a 1NF failure, the Learn page has a worked example of what one looks like.',
  },
  {
    question: 'Does the order I write my dependencies in change the answer?',
    answer:
      'It should not, and the analyser now guarantees that: dependencies are put into a canonical order before the decomposition runs. If you ever get different results from the same dependency set written two ways, that is a bug worth reporting.',
  },
  {
    question: 'How is 3NF different from BCNF, in one line?',
    answer:
      '3NF tolerates X → A when A is a prime attribute; BCNF does not. "Student, Course → Instructor" and "Instructor → Course" is the classic example: both {Student, Course} and {Student, Instructor} are keys, so every attribute is prime and 3NF holds — but Instructor is not a superkey, so BCNF fails.',
  },
  {
    question: 'What is the difference between lossless and dependency preserving?',
    answer:
      'Lossless means you can rebuild the original relation by joining the pieces, so no information is lost. Dependency preserving means you can still enforce every original dependency by checking the pieces individually. BCNF guarantees the first; only 3NF guarantees both.',
  },
  {
    question: 'The analysis says a decomposition is lossless but not dependency preserving. Is that bad?',
    answer:
      'It is a real cost, but not a correctness problem — the data is intact. You have lost the ability to enforce one dependency without a join, which typically means application-level checks or a trigger instead of a database constraint.',
  },
  {
    question: 'Why does the same relation show different decompositions for 2NF, 3NF, BCNF, 4NF and 5NF?',
    answer:
      'Each normal form is a different problem with a different goal. The 3NF synthesis algorithm guarantees dependency preservation, the BCNF analysis algorithm does not, and the 4NF and 5NF steps work on multivalued and join dependencies that functional dependencies cannot express. The assistant picks the strongest one; the visualizer shows them all so you can compare.',
  },
  {
    question: 'It says it cannot reach the analysis service. What now?',
    answer:
      'The backend is not running. Start it from the repository root with "npm run dev", which brings up both the API on port 3001 and the interface on port 3000. If the port is already taken, something else is using it — check for a leftover process from an earlier run.',
  },
];
