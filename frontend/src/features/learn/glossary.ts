export interface GlossaryTerm {
  term: string;
  definition: string;
  /** Where it shows up in this app, if anywhere. */
  inThisApp?: string;
}

/**
 * Glossary — owned by Team 2 (TripleX), written to match the vocabulary the
 * analyser actually uses in its output.
 */
export const GLOSSARY: GlossaryTerm[] = [
  {
    term: 'Relation',
    definition:
      'A table: a set of attributes plus the rows that populate them. Written R(A, B, C).',
    inThisApp: 'Shown as the relations on the results page.',
  },
  {
    term: 'Attribute',
    definition: 'A column of a relation.',
    inThisApp: 'The comma-separated list on the first line of the schema.',
  },
  {
    term: 'Functional dependency',
    definition:
      'X → Y: whenever two rows agree on X they must also agree on Y. Written "A, B → C".',
    inThisApp: 'Use -> in the schema text.',
  },
  {
    term: 'Multivalued dependency',
    definition:
      'X ↠ Y: X determines a set of Y values independently of everything else in the relation. Written "A ↠ B".',
    inThisApp: 'Use ->> in the schema text. Needed for 4NF and 5NF.',
  },
  {
    term: 'Join dependency',
    definition:
      'R is exactly the join of several of its projections, written ⨝(R1, R2, …).',
    inThisApp: 'Reported as the 5NF violation, shown as a ⨝ diagram.',
  },
  {
    term: 'Trivial dependency',
    definition:
      'A dependency that holds in every relation — X → Y where Y is already inside X, or X ↠ Y where X ∪ Y is the whole relation.',
    inThisApp: 'Skipped by the normal form checks, and reported as a warning.',
  },
  {
    term: 'Superkey',
    definition:
      'A set of attributes whose closure covers every attribute of the relation. It may contain redundant attributes.',
  },
  {
    term: 'Candidate key',
    definition:
      'A minimal superkey — removing any attribute from it stops it determining the whole relation.',
    inThisApp: 'Listed under "Candidate keys".',
  },
  {
    term: 'Prime attribute',
    definition:
      'An attribute that belongs to at least one candidate key.',
  },
  {
    term: 'Non-prime attribute',
    definition:
      'An attribute in no candidate key at all. The 3NF test turns on this distinction.',
  },
  {
    term: 'Attribute closure',
    definition:
      'Everything X can determine, following the dependencies transitively. Written X⁺.',
    inThisApp: 'How the analyser decides whether a determinant is a superkey.',
  },
  {
    term: 'Decomposition',
    definition:
      'Replacing a relation with several smaller ones that carry the same information.',
    inThisApp: 'Shown per normal form, with the split that produced each piece.',
  },
  {
    term: 'Lossless decomposition',
    definition:
      'A decomposition whose pieces can be joined back to reproduce the original relation exactly — no rows invented, none lost.',
    inThisApp: 'Reported as "lossless" alongside the BCNF result.',
  },
  {
    term: 'Dependency preserving',
    definition:
      'A decomposition in which every original dependency can still be enforced by checking the individual pieces, without rejoining them.',
    inThisApp:
      'Reported next to the BCNF result, together with any dependency it lost.',
  },
  {
    term: 'Partial dependency',
    definition:
      'A non-prime attribute depending on part of a candidate key rather than the whole key. Breaks 2NF.',
  },
  {
    term: 'Transitive dependency',
    definition:
      'A non-prime attribute depending on another non-prime attribute rather than directly on a key. Breaks 3NF.',
  },
  {
    term: 'Analysis algorithm',
    definition:
      'The BCNF decomposition procedure: repeatedly split on a dependency whose determinant is not a superkey.',
    inThisApp: 'Shown as the numbered steps in the BCNF section.',
  },
  {
    term: 'Synthesis algorithm',
    definition:
      'The 3NF decomposition procedure, which builds a relation from each dependency and guarantees dependency preservation.',
    inThisApp: 'Drives the "Decomposition toward 3NF" section.',
  },
];
