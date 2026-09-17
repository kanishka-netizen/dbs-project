import { FunctionalDependency } from './candidate-key.engine.js';

export interface MultivaluedDependency {
  left: string[];
  right: string[];
}

/**
 * Multivalued dependency utilities — the shared foundation under the 4NF
 * (Team 1) and 5NF (Team 2) checks.
 *
 * A multivalued dependency `X ->> Y` holds in R when, for any two tuples that
 * agree on X, swapping their Y components still yields tuples of R. Unlike a
 * functional dependency it does not need a single value on the right; it
 * describes two independent sets of facts sharing a relation.
 */
export class MvdEngine {
  /**
   * `X ->> Y` is trivial when `Y` is already contained in `X`, or when
   * `X ∪ Y` covers the whole relation. Trivial dependencies hold everywhere and
   * can never be a normal-form violation.
   */
  static isTrivial(
    dependency: MultivaluedDependency,
    allAttributes: string[],
  ): boolean {
    const rightInsideLeft = dependency.right.every((attribute) =>
      dependency.left.includes(attribute),
    );

    if (rightInsideLeft) {
      return true;
    }

    const union = new Set([...dependency.left, ...dependency.right]);

    return allAttributes.every((attribute) => union.has(attribute));
  }

  /**
   * The complement of `X ->> Y` is `X ->> (R - X - Y)`. Both describe the same
   * dependency, so every check has to consider both spellings.
   */
  static complement(
    dependency: MultivaluedDependency,
    allAttributes: string[],
  ): MultivaluedDependency | null {
    const right = allAttributes.filter(
      (attribute) =>
        !dependency.left.includes(attribute) &&
        !dependency.right.includes(attribute),
    );

    if (right.length === 0) {
      return null;
    }

    return { left: [...dependency.left], right };
  }

  /** Expands a set of MVDs with the complement of each entry. */
  static expandComplements(
    dependencies: MultivaluedDependency[],
    allAttributes: string[],
  ): MultivaluedDependency[] {
    const seen = new Set<string>();
    const expanded: MultivaluedDependency[] = [];

    for (const dependency of dependencies) {
      const variants = [
        dependency,
        this.complement(dependency, allAttributes),
      ];

      for (const variant of variants) {
        if (!variant) {
          continue;
        }

        const key = `${[...variant.left].sort().join('|')}=>${[...variant.right]
          .sort()
          .join('|')}`;

        if (seen.has(key)) {
          continue;
        }

        seen.add(key);
        expanded.push(variant);
      }
    }

    return expanded;
  }

  /** Attribute closure under the functional dependencies. */
  static attributeClosure(
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

  /** `X` is a superkey when its closure covers every attribute of R. */
  static isSuperkey(
    attributes: string[],
    allAttributes: string[],
    dependencies: FunctionalDependency[],
  ): boolean {
    const closure = this.attributeClosure(attributes, dependencies);

    return allAttributes.every((attribute) => closure.has(attribute));
  }

  /**
   * Chase-based losslessness test for a decomposition, under both functional
   * and multivalued dependencies.
   *
   * The decomposition is lossless when the chase drives some tableau row to
   * hold a distinguished variable in every column — meaning the join of the
   * pieces is guaranteed to reproduce the original relation.
   */
  static isLossless(
    decomposition: string[][],
    allAttributes: string[],
    functionalDependencies: FunctionalDependency[],
    multivaluedDependencies: MultivaluedDependency[],
  ): boolean {
    const tableau = this.buildTableau(decomposition, allAttributes);

    const rowLimit = 200;
    const stepLimit = 200;

    for (let step = 0; step < stepLimit; step++) {
      const changed =
        this.applyFunctionalDependencies(
          tableau,
          allAttributes,
          functionalDependencies,
        ) ||
        this.applyMultivaluedDependencies(
          tableau,
          allAttributes,
          multivaluedDependencies,
          rowLimit,
        );

      if (this.hasDistinguishedRow(tableau)) {
        return true;
      }

      if (!changed) {
        break;
      }
    }

    return this.hasDistinguishedRow(tableau);
  }

  private static buildTableau(
    decomposition: string[][],
    allAttributes: string[],
  ): string[][] {
    return decomposition.map((relation, rowIndex) =>
      allAttributes.map((attribute, columnIndex) =>
        relation.includes(attribute)
          ? this.distinguished(columnIndex)
          : `b${rowIndex}_${columnIndex}`,
      ),
    );
  }

  private static distinguished(columnIndex: number): string {
    return `a${columnIndex}`;
  }

  private static isDistinguished(symbol: string): boolean {
    return symbol.startsWith('a');
  }

  private static hasDistinguishedRow(tableau: string[][]): boolean {
    return tableau.some((row) => row.every((symbol) => this.isDistinguished(symbol)));
  }

  /**
   * FD rule: two rows agreeing on X must agree on Y, so their symbols on Y are
   * merged. Distinguished symbols win over non-distinguished ones.
   */
  private static applyFunctionalDependencies(
    tableau: string[][],
    allAttributes: string[],
    dependencies: FunctionalDependency[],
  ): boolean {
    let changed = false;

    for (const dependency of dependencies) {
      const leftIndices = this.indicesOf(dependency.left, allAttributes);
      const rightIndices = this.indicesOf(dependency.right, allAttributes);

      if (leftIndices.length === 0 || rightIndices.length === 0) {
        continue;
      }

      for (let i = 0; i < tableau.length; i++) {
        for (let j = i + 1; j < tableau.length; j++) {
          if (!this.rowsAgreeOn(tableau, i, j, leftIndices)) {
            continue;
          }

          for (const column of rightIndices) {
            const left = tableau[i][column];
            const right = tableau[j][column];

            if (left === right) {
              continue;
            }

            const [from, to] =
              this.isDistinguished(left) || !this.isDistinguished(right)
                ? [right, left]
                : [left, right];

            this.renameSymbol(tableau, from, to);
            changed = true;
          }
        }
      }
    }

    return changed;
  }

  /**
   * MVD rule: two rows agreeing on X imply a third row agreeing with the first
   * on X and Y, and with the second outside X ∪ Y.
   */
  private static applyMultivaluedDependencies(
    tableau: string[][],
    allAttributes: string[],
    dependencies: MultivaluedDependency[],
    rowLimit: number,
  ): boolean {
    let changed = false;

    for (const dependency of dependencies) {
      const leftIndices = this.indicesOf(dependency.left, allAttributes);
      const rightIndices = this.indicesOf(dependency.right, allAttributes);

      if (leftIndices.length === 0 || rightIndices.length === 0) {
        continue;
      }

      const restIndices = allAttributes
        .map((_attribute, index) => index)
        .filter(
          (index) =>
            !leftIndices.includes(index) && !rightIndices.includes(index),
        );

      const snapshot = tableau.map((row) => [...row]);

      for (const first of snapshot) {
        for (const second of snapshot) {
          if (!this.rowsAgreeOnRows(first, second, leftIndices)) {
            continue;
          }

          const candidate = [...first];

          for (const column of rightIndices) {
            candidate[column] = first[column];
          }

          for (const column of restIndices) {
            candidate[column] = second[column];
          }

          if (this.tableauHasRow(tableau, candidate)) {
            continue;
          }

          if (tableau.length >= rowLimit) {
            return changed;
          }

          tableau.push(candidate);
          changed = true;
        }
      }
    }

    return changed;
  }

  private static indicesOf(
    attributes: string[],
    allAttributes: string[],
  ): number[] {
    return attributes
      .map((attribute) => allAttributes.indexOf(attribute))
      .filter((index) => index !== -1);
  }

  private static rowsAgreeOn(
    tableau: string[][],
    first: number,
    second: number,
    indices: number[],
  ): boolean {
    return indices.every(
      (index) => tableau[first][index] === tableau[second][index],
    );
  }

  private static rowsAgreeOnRows(
    first: string[],
    second: string[],
    indices: number[],
  ): boolean {
    return indices.every((index) => first[index] === second[index]);
  }

  private static tableauHasRow(
    tableau: string[][],
    row: string[],
  ): boolean {
    return tableau.some((existing) =>
      existing.every((symbol, index) => symbol === row[index]),
    );
  }

  /** Replaces every occurrence of a symbol, which is how the chase unifies. */
  private static renameSymbol(
    tableau: string[][],
    from: string,
    to: string,
  ): void {
    for (const row of tableau) {
      for (let column = 0; column < row.length; column++) {
        if (row[column] === from) {
          row[column] = to;
        }
      }
    }
  }
}
