export interface FunctionalDependency {
  left: string[];
  right: string[];
}

export class CandidateKeyEngine {
  /**
   * Finds the closure of a set of attributes.
   *
   * Example:
   * F = { A -> B, B -> C }
   * Closure(A) = { A, B, C }
   */
  static attributeClosure(
    attributes: string[],
    dependencies: FunctionalDependency[],
  ): string[] {
    const closure = new Set(attributes);

    let changed = true;

    while (changed) {
      changed = false;

      for (const dependency of dependencies) {
        const canApply = dependency.left.every((attribute) =>
          closure.has(attribute),
        );

        if (canApply) {
          for (const attribute of dependency.right) {
            if (!closure.has(attribute)) {
              closure.add(attribute);
              changed = true;
            }
          }
        }
      }
    }

    return Array.from(closure);
  }

  /**
   * Finds all candidate keys of a relation.
   */
  static findCandidateKeys(
    allAttributes: string[],
    dependencies: FunctionalDependency[],
  ): string[][] {
    const candidateKeys: string[][] = [];

    // Generate all possible attribute combinations
    const combinations = this.generateCombinations(allAttributes);

    for (const combination of combinations) {
      const closure = this.attributeClosure(combination, dependencies);

      // A candidate key must determine all attributes
      const isSuperkey = allAttributes.every((attribute) =>
        closure.includes(attribute),
      );

      if (!isSuperkey) {
        continue;
      }

      // Minimality check:
      // No proper subset should already be a superkey
      const isMinimal = !candidateKeys.some((key) =>
        key.every((attribute) => combination.includes(attribute)),
      );

      if (isMinimal) {
        candidateKeys.push(combination);
      }
    }

    return candidateKeys;
  }

  /**
   * Generates all non-empty combinations of attributes.
   */
  private static generateCombinations(
    attributes: string[],
  ): string[][] {
    const combinations: string[][] = [];

    const total = 1 << attributes.length;

    for (let mask = 1; mask < total; mask++) {
      const combination: string[] = [];

      for (let i = 0; i < attributes.length; i++) {
        if (mask & (1 << i)) {
          combination.push(attributes[i]);
        }
      }

      combinations.push(combination);
    }

    // Check smaller combinations first
    combinations.sort((a, b) => a.length - b.length);

    return combinations;
  }
}