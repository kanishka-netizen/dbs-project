import { FunctionalDependency } from './candidate-key.engine.js';

export interface BCNFRelation {
  name: string;
  attributes: string[];
  reason: string;
}

export class BCNFEngine {
  static decompose(
    attributes: string[],
    dependencies: FunctionalDependency[],
  ): BCNFRelation[] {
    let relations: string[][] = [attributes];

    let changed = true;

    while (changed) {
      changed = false;
      const newRelations: string[][] = [];

      for (const relation of relations) {
        const violation = this.findViolation(relation, dependencies);

        if (!violation) {
          newRelations.push(relation);
          continue;
        }

        const X = violation.left;
        const Y = violation.right;

        // R1 = X ∪ Y
        const relation1 = [...new Set([...X, ...Y])];

        // R2 = R - (Y - X)
        const relation2 = relation.filter(
          (attribute) => !Y.includes(attribute) || X.includes(attribute),
        );

        newRelations.push(relation1);
        newRelations.push(relation2);

        changed = true;
      }

      relations = this.removeDuplicateRelations(newRelations);
    }

    return relations.map((relation, index) => ({
      name: `BCNF_R${index + 1}`,
      attributes: relation,
      reason: 'Relation satisfies BCNF after decomposition.',
    }));
  }

  private static findViolation(
    relation: string[],
    dependencies: FunctionalDependency[],
  ): FunctionalDependency | null {
    for (const dependency of dependencies) {
      const leftInside = dependency.left.every((attribute) =>
        relation.includes(attribute),
      );

      const rightInside = dependency.right.every((attribute) =>
        relation.includes(attribute),
      );

      if (!leftInside || !rightInside) continue;

      // Ignore trivial dependency
      const isTrivial = dependency.right.every((attribute) =>
        dependency.left.includes(attribute),
      );

      if (isTrivial) continue;

      const closure = this.attributeClosure(
        dependency.left,
        dependencies,
      );

      const isSuperkey = relation.every((attribute) =>
        closure.has(attribute),
      );

      if (!isSuperkey) {
        return dependency;
      }
    }

    return null;
  }

  private static attributeClosure(
    attributes: string[],
    dependencies: FunctionalDependency[],
  ): Set<string> {
    const closure = new Set(attributes);

    let changed = true;

    while (changed) {
      changed = false;

      for (const dependency of dependencies) {
        const canApply = dependency.left.every((attribute) =>
          closure.has(attribute),
        );

        if (!canApply) continue;

        for (const attribute of dependency.right) {
          if (!closure.has(attribute)) {
            closure.add(attribute);
            changed = true;
          }
        }
      }
    }

    return closure;
  }

  private static removeDuplicateRelations(
    relations: string[][],
  ): string[][] {
    const seen = new Set<string>();

    return relations.filter((relation) => {
      const key = [...relation].sort().join('|');

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }
}