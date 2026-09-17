import { FunctionalDependency } from './candidate-key.engine.js';

export interface DecomposedRelation {
  name: string;
  attributes: string[];
  reason: string;
}

export class DecompositionEngine {
  /**
   * 2NF decomposition
   */
  static decomposeTo2NF(
    attributes: string[],
    dependencies: FunctionalDependency[],
    candidateKeys: string[][],
  ): DecomposedRelation[] {
    const relations: DecomposedRelation[] = [];

    if (candidateKeys.length === 0) {
      return [];
    }

    const primeAttributes = new Set<string>();

    for (const key of candidateKeys) {
      for (const attribute of key) {
        primeAttributes.add(attribute);
      }
    }

    const nonPrimeAttributes = attributes.filter(
      (attribute) => !primeAttributes.has(attribute),
    );

    const remainingAttributes = new Set(attributes);

    for (const dependency of dependencies) {
      const left = dependency.left;
      const right = dependency.right;

      const determinesNonPrime = right.some((attribute) =>
        nonPrimeAttributes.includes(attribute),
      );

      if (!determinesNonPrime) {
        continue;
      }

      const isPartialDependency = candidateKeys.some((key) => {
        const isSubset = left.every((attribute) =>
          key.includes(attribute),
        );

        const isProperSubset = left.length < key.length;

        return isSubset && isProperSubset;
      });

      if (!isPartialDependency) {
        continue;
      }

      const relationAttributes = [
        ...new Set([...left, ...right]),
      ];

      relations.push({
        name: `R_${relations.length + 1}`,
        attributes: relationAttributes,
        reason: `${left.join(', ')} → ${right.join(', ')} is a partial dependency.`,
      });

      for (const attribute of right) {
        remainingAttributes.delete(attribute);
      }
    }

    if (remainingAttributes.size > 0) {
      relations.push({
        name: `R_${relations.length + 1}`,
        attributes: Array.from(remainingAttributes),
        reason:
          'Remaining attributes form the key-containing relation.',
      });
    }

    return relations;
  }

  /**
   * 3NF synthesis decomposition
   */
  static decomposeTo3NF(
    dependencies: FunctionalDependency[],
    candidateKeys: string[][],
  ): DecomposedRelation[] {
    const relations: DecomposedRelation[] = [];

    for (const dependency of dependencies) {
      const relationAttributes = [
        ...new Set([
          ...dependency.left,
          ...dependency.right,
        ]),
      ];

      relations.push({
        name: `R_${relations.length + 1}`,
        attributes: relationAttributes,
        reason: `${dependency.left.join(', ')} → ${dependency.right.join(', ')}.`,
      });
    }

    /*
     * 3NF synthesis requires at least one relation
     * containing a candidate key.
     */
    const containsCandidateKey = relations.some((relation) =>
      candidateKeys.some((key) =>
        key.every((attribute) =>
          relation.attributes.includes(attribute),
        ),
      ),
    );

    if (!containsCandidateKey && candidateKeys.length > 0) {
      relations.push({
        name: `R_${relations.length + 1}`,
        attributes: candidateKeys[0],
        reason:
          'Added candidate key relation to ensure the decomposition contains a key.',
      });
    }

    return this.removeDuplicateRelations(relations);
  }

  /**
   * Remove duplicate relations.
   */
  private static removeDuplicateRelations(
    relations: DecomposedRelation[],
  ): DecomposedRelation[] {
    const seen = new Set<string>();

    return relations.filter((relation) => {
      const key = [...relation.attributes].sort().join('|');

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }
}