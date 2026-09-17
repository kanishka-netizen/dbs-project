export interface FunctionalDependencyPayload {
  left: string[];
  right: string[];
}

export interface MultivaluedDependencyPayload {
  left: string[];
  right: string[];
}

export interface JoinDependencyPayload {
  relations: string[][];
}

export class AnalyzeNormalizationDto {
  relationName: string;

  attributes: string[];

  functionalDependencies: FunctionalDependencyPayload[];

  /**
   * Needed for 4NF and 5NF. Functional dependencies alone cannot express the
   * independent sets of facts those normal forms are about.
   */
  multivaluedDependencies?: MultivaluedDependencyPayload[];

  /**
   * Optional explicit join dependencies, for a schema known to carry one that
   * no multivalued dependency describes.
   */
  joinDependencies?: JoinDependencyPayload[];
}
