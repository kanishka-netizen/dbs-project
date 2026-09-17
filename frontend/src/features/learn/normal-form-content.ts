import type { NormalForm } from '../../types/normalization';

export interface NormalFormContent {
  normalForm: NormalForm;
  tagline: string;
  /** Formal, exam-ready definition. */
  definition: string;
  /** Plain-language restatement. */
  plainEnglish: string;
  /** The dependency shape that breaks this form. */
  violation: string;
  /** The rule for repairing it. */
  fix: string;
  /** A concrete before/after. */
  example: {
    before: string;
    beforeProblem: string;
    after: string;
  };
  commonMistakes: string[];
}

/**
 * Learn-section content — owned by Team 1 (TLE).
 *
 * Extend this array rather than hard-coding prose into the page, so the
 * content can be reused by the report generator (Team 3) and the assistant.
 */
export const NORMAL_FORM_CONTENT: NormalFormContent[] = [
  {
    normalForm: '1NF',
    tagline: 'Atomic values only',
    definition:
      'A relation is in 1NF if every attribute holds a single atomic value from its domain, and no attribute repeats as a group.',
    plainEnglish:
      'One cell, one value. No lists, no sets, no "phone1 / phone2 / phone3" columns, and no two rows that mean the same thing.',
    violation:
      'A cell contains a list, or the same kind of fact is spread across numbered columns.',
    fix: 'Move the repeating values into their own relation, one value per row, and add a foreign key back to the original.',
    example: {
      before: 'Student(StudentID, Name, PhoneNumbers) where PhoneNumbers = "555-1, 555-2"',
      beforeProblem: 'PhoneNumbers holds several values in one cell.',
      after: 'Student(StudentID, Name) and StudentPhone(StudentID, Phone)',
    },
    commonMistakes: [
      'Treating a comma-separated string as a single atomic value.',
      'Assuming 1NF is automatic — it is automatic only when the schema was declared with atomic domains.',
      'Numbered column groups: Phone1, Phone2, Phone3.',
    ],
  },
  {
    normalForm: '2NF',
    tagline: 'No partial dependencies',
    definition:
      'A relation is in 2NF if it is in 1NF and no non-prime attribute is functionally dependent on a proper subset of any candidate key.',
    plainEnglish:
      'If a key is made of two things, nothing else in the row may depend on just one of them.',
    violation:
      'A proper subset of a candidate key determines a non-prime attribute.',
    fix: 'Move the partially dependent attribute and its determinant into a new relation keyed by that determinant.',
    example: {
      before:
        'Enrolment(StudentID, CourseID, CourseName)\n  with StudentID, CourseID -> CourseName and CourseID -> CourseName',
      beforeProblem:
        'CourseName depends on CourseID alone, which is only part of the key.',
      after: 'Enrolment(StudentID, CourseID) and Course(CourseID, CourseName)',
    },
    commonMistakes: [
      'Forgetting that a relation can have several candidate keys — a partial dependency against any one of them is a violation.',
      'Flagging a dependency on a candidate key itself as partial. Partial means a proper subset.',
    ],
  },
  {
    normalForm: '3NF',
    tagline: 'No transitive dependencies',
    definition:
      'A relation is in 3NF if it is in 2NF and for every non-trivial functional dependency X -> A, either X is a superkey or A is a prime attribute.',
    plainEnglish:
      'A non-key attribute must not depend on another non-key attribute. Every fact should depend on the key, the whole key, and nothing but the key.',
    violation:
      'X -> A where X is not a superkey and A is a non-prime attribute.',
    fix: 'Split the transitive chain into its own relation, keyed by the determinant X.',
    example: {
      before:
        'Employee(EmployeeID, DepartmentID, DepartmentName)\n  with EmployeeID -> DepartmentID and DepartmentID -> DepartmentName',
      beforeProblem:
        'DepartmentName depends on DepartmentID, not directly on the key.',
      after:
        'Employee(EmployeeID, DepartmentID) and Department(DepartmentID, DepartmentName)',
    },
    commonMistakes: [
      'Marking a 3NF violation when the right-hand attribute is prime — 3NF tolerates that, BCNF does not.',
      'Stopping at 3NF and assuming BCNF follows automatically. It does not.',
    ],
  },
  {
    normalForm: 'BCNF',
    tagline: 'Every determinant is a key',
    definition:
      'A relation is in BCNF (Boyce–Codd normal form) if it is in 3NF and for every non-trivial functional dependency X -> Y, X is a superkey.',
    plainEnglish:
      'Whatever determines something must be a key. The 3NF escape hatch — "the dependent attribute is prime" — is not allowed here.',
    violation: 'A non-trivial dependency whose determinant is not a superkey.',
    fix: 'Decompose into X ∪ Y and R − (Y − X). Repeat until every remaining determinant is a superkey.',
    example: {
      before:
        'Offering(Student, Course, Instructor)\n  with Student, Course -> Instructor and Instructor -> Course',
      beforeProblem:
        'Instructor is not a superkey, yet it determines Course. Both {Student, Course} and {Student, Instructor} are keys, so 3NF holds but BCNF does not.',
      after: 'Teaches(Instructor, Course) and Takes(Student, Instructor)',
    },
    commonMistakes: [
      'Counting trivial dependencies such as A -> A as violations. They are always satisfied.',
      'Expecting BCNF decomposition to preserve all dependencies — it is not guaranteed to.',
      'Declaring a "violation" from a determinant that is a superkey of the relation.',
    ],
  },
  {
    normalForm: '4NF',
    tagline: 'No non-trivial multivalued dependencies',
    definition:
      'A relation is in 4NF if it is in BCNF and for every non-trivial multivalued dependency X ->> Y, X is a superkey.',
    plainEnglish:
      'If two independent sets of facts share a row, split them apart. Multivalued dependencies come from combining unrelated one-to-many relationships in one relation.',
    violation:
      'A non-trivial MVD X ->> Y whose left-hand side X is not a superkey.',
    fix: 'Decompose into X ∪ Y and X ∪ (R − X − Y).',
    example: {
      before:
        'Supply(Supplier, Part, Project)\n  with Supplier ->> Part and Supplier ->> Project',
      beforeProblem:
        'Parts and projects are independent facts about a supplier — a supplier has no part/project pairing — yet every combination is stored, so the table repeats.',
      after:
        'Supplies(Supplier, Part) and WorksOn(Supplier, Project)',
    },
    commonMistakes: [
      'Treating an MVD as a functional dependency — X ->> Y does not mean X -> Y.',
      'Missing that X ->> Y and X ->> Z are the same dependency when Y ∪ Z = R − X (complementation).',
    ],
  },
  {
    normalForm: '5NF',
    tagline: 'No join dependencies that are not implied by keys',
    definition:
      'A relation is in 5NF (project-join normal form) if it is in 4NF and every non-trivial join dependency it satisfies is implied by its candidate keys.',
    plainEnglish:
      'The relation cannot be broken into three or more pieces and rebuilt losslessly. If it can, the pieces are the real relations.',
    violation:
      'A lossless join dependency whose components are all proper subsets of the relation and none is implied by a candidate key.',
    fix: 'Replace the relation with the components of the lossless join dependency.',
    example: {
      before:
        'Supply(Supplier, Part, Project)\n  with Supplier ->> Part and Supplier ->> Project',
      beforeProblem:
        'The relation is the join of three binary projections, so it carries no information the three do not.',
      after:
        'Supplies(Supplier, Part), WorksOn(Supplier, Project) and Covers(Part, Project)',
    },
    commonMistakes: [
      'Assuming 5NF is about multivalued dependencies. Those are 4NF; 5NF is about join dependencies.',
      'Treating "in 4NF" as "cannot be decomposed further" — a 4NF relation can still have a 3-way join dependency.',
    ],
  },
];
