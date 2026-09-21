/**
 * Mirror of the backend API contract.
 *
 * SOURCE OF TRUTH: `backend/src/normalization/dto/analyze-normalization.dto.ts`
 * plus the response assembled in `backend/src/normalization/normalization.service.ts`.
 *
 * This file duplicates the shape on purpose: the backend is ESM with its own
 * `rootDir`, so importing across workspace boundaries would fight the build.
 * If you change the contract, change it here, in the backend, and in
 * `docs/API.md` — all three.
 */

export interface FunctionalDependency {
  left: string[];
  right: string[];
}

export interface MultivaluedDependency {
  left: string[];
  right: string[];
}

export interface AnalyzeNormalizationRequest {
  relationName: string;
  attributes: string[];
  functionalDependencies: FunctionalDependency[];
  multivaluedDependencies?: MultivaluedDependency[];
}

/** The four normal forms the base pipeline decides directly. */
export interface NormalFormVerdicts {
  '1NF': boolean;
  '2NF': boolean;
  '3NF': boolean;
  BCNF: boolean;
}

/** The dependency-derived normal forms, computed separately. */
export interface HigherNormalFormVerdicts {
  '4NF': boolean;
  '5NF': boolean;
}

export interface NormalFormViolation {
  /** e.g. `'2NF'`, `'3NF'`, `'BCNF'` */
  normalForm: string;
  /** Human-readable dependency, e.g. `'A, B -> C'` */
  dependency: string;
  reason: string;
}

export interface HigherNormalFormViolation {
  normalForm: '4NF' | '5NF';
  /** Human-readable MVD or join dependency, e.g. `'A ->> B'` */
  dependency: string;
  reason: string;
}

export interface DecomposedRelation {
  name: string;
  attributes: string[];
  reason: string;
}

/** One split performed by the BCNF analysis algorithm. */
export interface BCNFSplitStep {
  step: number;
  /** The relation that was split. */
  sourceRelation: string;
  sourceAttributes: string[];
  /** The dependency whose determinant was not a superkey, e.g. `'Instructor → Course'`. */
  violatingDependency: string;
  reason: string;
  produced: { name: string; attributes: string[] }[];
}

/** Whether a decomposition is lossless and dependency preserving. */
export interface DecompositionProperties {
  lossless: boolean;
  dependencyPreserving: boolean;
}

export interface NormalizationStep {
  step: number;
  title: string;
  description: string;
  result: string;
}

export interface HigherNormalFormResult {
  normalForms: HigherNormalFormVerdicts;
  highestNormalForm: '4NF' | '5NF' | null;
  violations: HigherNormalFormViolation[];
  decomposition: DecomposedRelation[];
}

/** Returned when the request passed validation. */
export interface NormalizationAnalysis {
  relation: string;
  valid: true;

  attributes: string[];
  functionalDependencies: FunctionalDependency[];
  multivaluedDependencies: MultivaluedDependency[];

  candidateKeys: string[][];

  normalForms: NormalFormVerdicts;
  highestNormalForm: NormalForm;

  violations: NormalFormViolation[];

  /** The 2NF/3NF decomposition, chosen by the highest violated form. */
  decomposition: DecomposedRelation[];
  /** The BCNF analysis algorithm output. */
  bcnfDecomposition: DecomposedRelation[];
  /** Every split the BCNF algorithm performed, in order. */
  bcnfSteps: BCNFSplitStep[];
  /** Properties of the BCNF decomposition. */
  bcnfProperties: DecompositionProperties & {
    /** Dependencies BCNF cost you, e.g. `'Instructor → Course'`. */
    unpreservedDependencies: string[];
  };
  /** Properties of the decomposition the assistant would apply. */
  decompositionProperties: DecompositionProperties;
  /** The 4NF/5NF analysis output. */
  higherNormalForms: HigherNormalFormResult;

  steps: NormalizationStep[];
  warnings: string[];
}

/** Returned when the request failed validation. */
export interface NormalizationRejection {
  relation: string;
  valid: false;
  errors: string[];
  warnings: string[];
}

export type NormalizationResponse =
  | NormalizationAnalysis
  | NormalizationRejection;

export const NORMAL_FORM_ORDER = [
  '1NF',
  '2NF',
  '3NF',
  'BCNF',
  '4NF',
  '5NF',
] as const;

export type NormalForm = (typeof NORMAL_FORM_ORDER)[number];

export function isAccepted(
  response: NormalizationResponse,
): response is NormalizationAnalysis {
  return response.valid;
}

/**
 * Flattens the two verdict maps into a single ordered list, which is what the
 * visualizer renders.
 */
export function orderedVerdicts(
  response: NormalizationAnalysis,
): { normalForm: NormalForm; satisfied: boolean }[] {
  return NORMAL_FORM_ORDER.map((normalForm) => ({
    normalForm,
    satisfied:
      normalForm === '4NF' || normalForm === '5NF'
        ? response.higherNormalForms.normalForms[normalForm]
        : response.normalForms[normalForm],
  }));
}
