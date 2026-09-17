import { FunctionalDependency } from './candidate-key.engine.js';

export interface NormalFormViolation {
  normalForm: string;
  dependency: string;
  reason: string;
}

export interface NormalFormResult {
  normalForms: {
    '1NF': boolean;
    '2NF': boolean;
    '3NF': boolean;
    BCNF: boolean;
  };
  highestNormalForm: string;
  violations: NormalFormViolation[];
}

export class NormalFormEngine {
  static analyze(
    attributes: string[],
    dependencies: FunctionalDependency[],
    candidateKeys: string[][],
  ): NormalFormResult {
    const violations: NormalFormViolation[] = [];

    /*
     * 1NF
     *
     * We assume that the attributes supplied to the analyzer
     * represent atomic values.
     */
    const is1NF = true;

    /*
     * 2NF
     *
     * A relation is in 2NF if:
     * 1. It is in 1NF
     * 2. No non-prime attribute is partially dependent
     *    on a candidate key.
     */
    const primeAttributes = new Set<string>();

    for (const key of candidateKeys) {
      for (const attribute of key) {
        primeAttributes.add(attribute);
      }
    }

    const nonPrimeAttributes = attributes.filter(
      (attribute) => !primeAttributes.has(attribute),
    );

    let is2NF = true;

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
        // X must be a proper subset of the candidate key
        const isSubset = left.every((attribute) =>
          key.includes(attribute),
        );

        const isProperSubset = left.length < key.length;

        return isSubset && isProperSubset;
      });

      if (isPartialDependency) {
        is2NF = false;

        violations.push({
          normalForm: '2NF',
          dependency: this.formatDependency(left, right),
          reason:
            'A non-prime attribute is partially dependent on a candidate key.',
        });
      }
    }

    /*
     * 3NF
     *
     * For every FD X → A:
     *
     * X is a superkey
     * OR
     * A is a prime attribute.
     */
    let is3NF = true;

    for (const dependency of dependencies) {
      const left = dependency.left;
      const right = dependency.right;

      const leftClosure = this.attributeClosure(
        left,
        dependencies,
      );

      const isSuperkey = attributes.every((attribute) =>
        leftClosure.has(attribute),
      );

      const determinesNonPrime = right.some((attribute) =>
        nonPrimeAttributes.includes(attribute),
      );

      if (!isSuperkey && determinesNonPrime) {
        is3NF = false;

        violations.push({
          normalForm: '3NF',
          dependency: this.formatDependency(left, right),
          reason:
            'The determinant is not a superkey and it determines a non-prime attribute.',
        });
      }
    }

    /*
     * BCNF
     *
     * For every non-trivial FD X → Y:
     *
     * X must be a superkey.
     */
    let isBCNF = true;

    for (const dependency of dependencies) {
      const left = dependency.left;
      const right = dependency.right;

      const leftClosure = this.attributeClosure(
        left,
        dependencies,
      );

      const isSuperkey = attributes.every((attribute) =>
        leftClosure.has(attribute),
      );

      if (!isSuperkey) {
        isBCNF = false;

        violations.push({
          normalForm: 'BCNF',
          dependency: this.formatDependency(left, right),
          reason:
            'The determinant is not a superkey.',
        });
      }
    }

    let highestNormalForm = '1NF';

    if (is2NF) {
      highestNormalForm = '2NF';
    }

    if (is3NF) {
      highestNormalForm = '3NF';
    }

    if (isBCNF) {
      highestNormalForm = 'BCNF';
    }

    return {
      normalForms: {
        '1NF': is1NF,
        '2NF': is2NF,
        '3NF': is3NF,
        BCNF: isBCNF,
      },
      highestNormalForm,
      violations,
    };
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

  private static formatDependency(
    left: string[],
    right: string[],
  ): string {
    return `${left.join(', ')} → ${right.join(', ')}`;
  }
}