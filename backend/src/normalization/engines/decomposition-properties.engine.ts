import { CandidateKeyEngine } from './candidate-key.engine.js';
import type { FunctionalDependency } from './candidate-key.engine.js';
import { MvdEngine } from './mvd.engine.js';
import type { MultivaluedDependency } from './mvd.engine.js';

export interface DecompositionProperties {
  lossless: boolean;
  dependencyPreserving: boolean;
}

export class DecompositionPropertiesEngine {
  /**
   * Checks whether the decomposition is lossless.
   *
   * The actual chase algorithm is already implemented by MvdEngine, so this
   * engine keeps the decomposition-property checks together without
   * duplicating that logic.
   */
  static isLossless(
    decomposition: string[][],
    allAttributes: string[],
    functionalDependencies: FunctionalDependency[],
    multivaluedDependencies: MultivaluedDependency[],
  ): boolean {
    if (decomposition.length === 0) {
      return true;
    }

    return MvdEngine.isLossless(
      decomposition,
      allAttributes,
      functionalDependencies,
      multivaluedDependencies,
    );
  }

  /**
   * Checks dependency preservation.
   *
   * An FD is preserved when its attributes can be derived from the
   * dependencies projected onto the decomposed relations.
   */
  static isDependencyPreserving(
    decomposition: string[][],
    functionalDependencies: FunctionalDependency[],
  ): boolean {
    if (functionalDependencies.length === 0) {
      return true;
    }

    if (decomposition.length === 0) {
      return false;
    }

    const projectedDependencies =
      this.projectDependencies(
        decomposition,
        functionalDependencies,
      );

    for (const dependency of functionalDependencies) {
      const closure = CandidateKeyEngine.attributeClosure(
        dependency.left,
        projectedDependencies,
      );

      const preserved = dependency.right.every((attribute) =>
        closure.includes(attribute),
      );

      if (!preserved) {
        return false;
      }
    }

    return true;
  }

  private static projectDependencies(
    decomposition: string[][],
    dependencies: FunctionalDependency[],
  ): FunctionalDependency[] {
    const projected: FunctionalDependency[] = [];

    for (const relation of decomposition) {
      for (const dependency of dependencies) {
        const leftInsideRelation = dependency.left.every((attribute) =>
          relation.includes(attribute),
        );

        if (!leftInsideRelation) {
          continue;
        }

        const rightInsideRelation = dependency.right.filter((attribute) =>
          relation.includes(attribute),
        );

        if (rightInsideRelation.length === 0) {
          continue;
        }

        projected.push({
          left: [...dependency.left],
          right: rightInsideRelation,
        });
      }
    }

    return projected;
  }
}