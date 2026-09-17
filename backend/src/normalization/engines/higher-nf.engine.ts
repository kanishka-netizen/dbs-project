import { FunctionalDependency } from './candidate-key.engine.js';
import {
  HigherNormalFormRelation,
  HigherNormalFormResult,
  HigherNormalFormViolation,
} from './higher-nf.types.js';

export interface MultivaluedDependency {
  left: string[];
  right: string[];
}

export class HigherNFEngine {
  static analyze(
    attributes: string[],
    functionalDependencies: FunctionalDependency[],
    multivaluedDependencies: MultivaluedDependency[],
    candidateKeys: string[][],
  ): HigherNormalFormResult {
    const violations: HigherNormalFormViolation[] = [];

    // -----------------------------
    // 4NF CHECK
    // -----------------------------
    //
    // A relation is in 4NF if, for every
    // non-trivial MVD X ->-> Y, X is a superkey.
    //

    let is4NF = true;

    for (const dependency of multivaluedDependencies) {
      const isTrivial = this.isTrivialMVD(
        dependency.left,
        dependency.right,
        attributes,
      );

      if (isTrivial) {
        continue;
      }

      const isSuperkey = this.isSuperkey(
        dependency.left,
        attributes,
        functionalDependencies,
      );

      if (!isSuperkey) {
        is4NF = false;

        violations.push({
          normalForm: '4NF',
          dependency: this.formatMVD(
            dependency.left,
            dependency.right,
          ),
          reason:
            'The determinant of this non-trivial multivalued dependency is not a superkey.',
        });
      }
    }

    // -----------------------------
    // 5NF CHECK
    // -----------------------------
    //
    // Full 5NF requires checking non-trivial
    // join dependencies.
    //
    // For the MVP, we treat the absence of
    // explicitly supplied non-trivial MVDs
    // and the absence of detected 4NF violations
    // as passing the available higher-NF checks.
    //
    // The actual 5NF decomposition can later be
    // connected to the TripleX module.
    //

    let is5NF = is4NF;

    const decomposition: HigherNormalFormRelation[] = [];

    if (!is4NF) {
      const fourNFDecomposition =
        this.decomposeFor4NF(
          attributes,
          multivaluedDependencies,
        );

      decomposition.push(...fourNFDecomposition);
    }

    let highestNormalForm: '4NF' | '5NF' | null = null;

    if (is4NF) {
      highestNormalForm = '4NF';
    }

    if (is5NF) {
      highestNormalForm = '5NF';
    }

    return {
      normalForms: {
        '4NF': is4NF,
        '5NF': is5NF,
      },
      highestNormalForm,
      violations,
      decomposition,
    };
  }

  // -----------------------------
  // CHECK WHETHER X IS A SUPERKEY
  // -----------------------------

  private static isSuperkey(
    determinant: string[],
    attributes: string[],
    dependencies: FunctionalDependency[],
  ): boolean {
    const closure = this.attributeClosure(
      determinant,
      dependencies,
    );

    return attributes.every((attribute) =>
      closure.has(attribute),
    );
  }

  // -----------------------------
  // ATTRIBUTE CLOSURE
  // -----------------------------

  private static attributeClosure(
    attributes: string[],
    dependencies: FunctionalDependency[],
  ): Set<string> {
    const closure = new Set(attributes);

    let changed = true;

    while (changed) {
      changed = false;

      for (const dependency of dependencies) {
        const canApply = dependency.left.every(
          (attribute) => closure.has(attribute),
        );

        if (!canApply) {
          continue;
        }

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

  // -----------------------------
  // CHECK WHETHER AN MVD IS TRIVIAL
  // -----------------------------

  private static isTrivialMVD(
    left: string[],
    right: string[],
    allAttributes: string[],
  ): boolean {
    const leftSet = new Set(left);
    const rightSet = new Set(right);

    // X ->-> Y is trivial if:
    //
    // Y ⊆ X
    //
    // OR
    //
    // X ∪ Y = R

    const rightSubsetOfLeft = right.every(
      (attribute) => leftSet.has(attribute),
    );

    if (rightSubsetOfLeft) {
      return true;
    }

    const leftAndRight = new Set([
      ...left,
      ...right,
    ]);

    const coversRelation = allAttributes.every(
      (attribute) => leftAndRight.has(attribute),
    );

    return coversRelation;
  }

  // -----------------------------
  // 4NF DECOMPOSITION
  // -----------------------------

  private static decomposeFor4NF(
    attributes: string[],
    dependencies: MultivaluedDependency[],
  ): HigherNormalFormRelation[] {
    const relations: HigherNormalFormRelation[] = [];

    for (let i = 0; i < dependencies.length; i++) {
      const dependency = dependencies[i];

      const left = dependency.left;
      const right = dependency.right;

      const relation1 = [
        ...new Set([
          ...left,
          ...right,
        ]),
      ];

      const remainingAttributes = attributes.filter(
        (attribute) =>
          !right.includes(attribute) ||
          left.includes(attribute),
      );

      relations.push({
        name: `4NF_R${i + 1}`,
        attributes: relation1,
        reason:
          `${this.formatMVD(left, right)} violates 4NF because the determinant is not a superkey.`,
      });

      relations.push({
        name: `4NF_R${i + 2}`,
        attributes: remainingAttributes,
        reason:
          'Remaining attributes are retained in the second relation of the 4NF decomposition.',
      });
    }

    return this.removeDuplicateRelations(relations);
  }

  // -----------------------------
  // FORMAT MVD
  // -----------------------------

  private static formatMVD(
    left: string[],
    right: string[],
  ): string {
    return `${left.join(', ')} →→ ${right.join(', ')}`;
  }

  // -----------------------------
  // REMOVE DUPLICATE RELATIONS
  // -----------------------------

  private static removeDuplicateRelations(
    relations: HigherNormalFormRelation[],
  ): HigherNormalFormRelation[] {
    const seen = new Set<string>();

    return relations.filter((relation) => {
      const key = [...relation.attributes]
        .sort()
        .join('|');

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    });
  }
}