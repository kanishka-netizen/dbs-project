import { FunctionalDependency } from './candidate-key.engine.js';

export interface BCNFRelation {
  name: string;
  attributes: string[];
  reason: string;
}

/** One split performed by the analysis algorithm. */
export interface BCNFSplitStep {
  step: number;
  /** The relation that was split. */
  sourceRelation: string;
  sourceAttributes: string[];
  /** The dependency whose determinant was not a superkey, e.g. `Instructor → Course`. */
  violatingDependency: string;
  reason: string;
  produced: { name: string; attributes: string[] }[];
}

export interface BCNFDecompositionResult {
  relations: BCNFRelation[];
  steps: BCNFSplitStep[];
}

/**
 * BCNF analysis algorithm — owned by Team 2 (TripleX).
 *
 * Repeatedly finds a non-trivial dependency whose determinant is not a
 * superkey, and replaces the relation with
 *
 *   R1 = X ∪ Y            (the dependency, made whole)
 *   R2 = R − (Y − X)      (everything the split would otherwise lose)
 *
 * `R1 ∩ R2 = X` and `X → Y`, so the join of the two always reconstructs the
 * original relation: the decomposition is lossless by construction. Both parts
 * are strictly smaller than the relation they came from, which is what
 * guarantees termination.
 *
 * Two deliberate properties:
 *
 * - **Deterministic.** Dependencies are processed in a canonical order, so the
 *   same dependency *set* always yields the same decomposition regardless of
 *   the order it was supplied in. Without this, `[A→B, B→A]` and `[B→A, A→B]`
 *   produced different answers — a schema that analyses differently depending
 *   on how you typed it is not a usable teaching tool.
 * - **Instrumented.** Every split is recorded with the dependency that drove
 *   it, so the UI can explain the decomposition instead of just printing it.
 */
export class BCNFEngine {
  /** Relations only — the shape most callers want. */
  static decompose(
    attributes: string[],
    dependencies: FunctionalDependency[],
  ): BCNFRelation[] {
    return this.analyze(attributes, dependencies).relations;
  }

  static analyze(
    attributes: string[],
    dependencies: FunctionalDependency[],
  ): BCNFDecompositionResult {
    const ordered = this.canonicalOrder(dependencies);

    // One entry per distinct attribute set. Reusing the entry when a split
    // reproduces a relation that already exists means the trace refers to a
    // single object rather than to look-alike copies.
    const registry = new Map<string, { id: number; attributes: string[] }>();

    let nextId = 1;

    const register = (relationAttributes: string[]) => {
      const key = this.signature(relationAttributes);
      const existing = registry.get(key);

      if (existing) {
        return existing;
      }

      const entry = { id: nextId++, attributes: [...relationAttributes] };
      registry.set(key, entry);

      return entry;
    };

    const original = register(attributes);
    let current = [original];

    // Kept as ids rather than names: names are only settled once the final
    // set of relations is known, so that no relation is named for a step it
    // did not survive.
    const trace: {
      sourceId: number;
      sourceAttributes: string[];
      violatingDependency: string;
      reason: string;
      produced: { id: number; attributes: string[] }[];
    }[] = [];

    let changed = true;

    while (changed) {
      changed = false;

      const next: typeof current = [];
      const nextSignatures = new Set<string>();

      const keep = (relation: (typeof current)[number]) => {
        const key = this.signature(relation.attributes);

        if (nextSignatures.has(key)) {
          return;
        }

        nextSignatures.add(key);
        next.push(relation);
      };

      for (const relation of current) {
        const violation = this.findViolation(relation.attributes, ordered);

        if (!violation) {
          keep(relation);
          continue;
        }

        const determinant = violation.left;
        const dependent = violation.right;

        const first = register(this.union(determinant, dependent));

        const second = register(
          relation.attributes.filter(
            (attribute) =>
              !dependent.includes(attribute) ||
              determinant.includes(attribute),
          ),
        );

        trace.push({
          sourceId: relation.id,
          sourceAttributes: relation.attributes,
          violatingDependency: this.format(violation),
          reason: `{${determinant.join(', ')}} is not a superkey of {${relation.attributes.join(', ')}}, so ${this.format(violation)} breaks BCNF.`,
          produced: [
            { id: first.id, attributes: first.attributes },
            { id: second.id, attributes: second.attributes },
          ],
        });

        keep(first);
        keep(second);

        changed = true;
      }

      current = next;
    }

    // Settle the names, then describe each relation in terms of the split that
    // produced it.
    const names = new Map<number, string>();

    current.forEach((relation, index) => {
      names.set(relation.id, `BCNF_R${index + 1}`);
    });

    // A relation that was split further no longer appears in the output, but
    // the trace still has to be able to name it — and it must not collide with
    // a surviving relation's number.
    const nameOf = (id: number): string => {
      const settled = names.get(id);

      if (settled) {
        return settled;
      }

      return id === original.id ? 'R' : `R${id}`;
    };

    const relations: BCNFRelation[] = current.map((relation) => ({
      name: nameOf(relation.id),
      attributes: relation.attributes,
      reason: this.describe(relation.id, trace, nameOf),
    }));

    const steps: BCNFSplitStep[] = trace.map((entry, index) => ({
      step: index + 1,
      sourceRelation: nameOf(entry.sourceId),
      sourceAttributes: entry.sourceAttributes,
      violatingDependency: entry.violatingDependency,
      reason: entry.reason,
      produced: entry.produced.map((produced) => ({
        name: nameOf(produced.id),
        attributes: produced.attributes,
      })),
    }));

    return { relations, steps };
  }

  /** The split that produced a relation, or a note that none did. */
  private static describe(
    id: number,
    trace: { produced: { id: number; attributes: string[] }[]; violatingDependency: string; sourceId: number }[],
    nameOf: (id: number) => string,
  ): string {
    for (const entry of trace) {
      if (entry.produced.some((produced) => produced.id === id)) {
        const role =
          entry.produced[0].id === id ? 'X ∪ Y' : 'R − (Y − X)';

        return `${role}, from splitting ${nameOf(entry.sourceId)} on ${entry.violatingDependency}.`;
      }
    }

    return 'Already satisfied BCNF, so this relation was never split.';
  }

  /**
   * Canonical order for the dependency set: sort each side, then sort the list.
   * This is what makes the output independent of input order.
   */
  private static canonicalOrder(
    dependencies: FunctionalDependency[],
  ): FunctionalDependency[] {
    return dependencies
      .map((dependency) => ({
        left: [...dependency.left],
        right: [...dependency.right],
      }))
      .sort((first, second) =>
        this.sortKey(first).localeCompare(this.sortKey(second)),
      );
  }

  private static sortKey(dependency: FunctionalDependency): string {
    return `${[...dependency.left].sort().join(',')}|${[...dependency.right].sort().join(',')}`;
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

      // A dependency whose right-hand side already sits in the left-hand side
      // holds in every relation, so it can never be the reason for a split.
      const isTrivial = dependency.right.every((attribute) =>
        dependency.left.includes(attribute),
      );

      if (isTrivial) continue;

      const closure = this.attributeClosure(dependency.left, dependencies);

      const isSuperkey = relation.every((attribute) => closure.has(attribute));

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

  private static signature(attributes: string[]): string {
    return [...attributes].sort().join('|');
  }

  private static union(first: string[], second: string[]): string[] {
    return [...new Set([...first, ...second])];
  }

  private static format(dependency: FunctionalDependency): string {
    return `${dependency.left.join(', ')} → ${dependency.right.join(', ')}`;
  }
}
