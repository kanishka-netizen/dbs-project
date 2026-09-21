import { FunctionalDependency } from './candidate-key.engine.js';
import { MvdEngine, MultivaluedDependency } from './mvd.engine.js';
import {
  HigherNormalFormRelation,
  HigherNormalFormResult,
  HigherNormalFormViolation,
} from './higher-nf.types.js';

/**
 * An earlier revision of this module declared `MultivaluedDependency` itself.
 * It now lives in `mvd.engine.js` alongside the operations on it, and is
 * re-exported from here so imports written against the old path keep working.
 */
export type { MultivaluedDependency };

/**
 * An explicit join dependency: R is the lossless join of these relations.
 *
 * Unlike a candidate derived from multivalued dependencies, an explicit join
 * dependency is an asserted fact about the schema — it is trusted rather than
 * re-derived by the chase.
 */
export interface JoinDependency {
  relations: string[][];
}

interface JoinCandidate {
  relations: string[][];
  /** False when the candidate was derived from MVDs and still needs the chase. */
  asserted: boolean;
}

/**
 * 4NF and 5NF analysis — owned by Team 2 (TripleX), with the 4NF branch
 * extended by Team 1 (TLE).
 *
 * 4NF asks whether every non-trivial multivalued dependency has a superkey on
 * its left. 5NF asks whether the relation can be losslessly split into three or
 * more relations — that is, whether it carries a join dependency that its
 * candidate keys do not already imply.
 */
export class HigherNormalFormEngine {
  static analyze(
    allAttributes: string[],
    functionalDependencies: FunctionalDependency[],
    multivaluedDependencies: MultivaluedDependency[] = [],
    joinDependencies: JoinDependency[] = [],
    isBcnfSatisfied = true,
  ): HigherNormalFormResult {
    const expanded = MvdEngine.expandComplements(
      multivaluedDependencies,
      allAttributes,
    );

    const fourNfViolations = this.findFourthNormalFormViolations(
      allAttributes,
      functionalDependencies,
      multivaluedDependencies,
    );

    const joinCandidates = this.findJoinCandidates(
      allAttributes,
      functionalDependencies,
      expanded,
      joinDependencies,
    );

    const fiveNfViolations: HigherNormalFormViolation[] = joinCandidates.map(
      (candidate) => ({
        normalForm: '5NF',
        dependency: this.formatJoinDependency(candidate.relations),
        reason:
          'The relation is the lossless join of three smaller relations, so it stores no fact that they do not already store.',
      }),
    );

    /*
     * 4NF implies BCNF, so a relation that has not reached BCNF has not
     * reached 4NF either — however its multivalued dependencies look. Without
     * this guard, a relation with no declared MVDs would satisfy 4NF and 5NF
     * vacuously while still failing BCNF.
     */
    const blockages: HigherNormalFormViolation[] = isBcnfSatisfied
      ? []
      : [
          {
            normalForm: '4NF',
            dependency: '—',
            reason:
              'The relation is not in BCNF yet. 4NF and 5NF only apply once every determinant is a superkey.',
          },
        ];

    const is4NF = isBcnfSatisfied && fourNfViolations.length === 0;
    const is5NF = is4NF && fiveNfViolations.length === 0;

    const decomposition: HigherNormalFormRelation[] = [];

    // A 4NF decomposition is only meaningful once the relation is in BCNF, and
    // only if a multivalued dependency actually breaks 4NF. 5NF implies 4NF, so
    // a relation that fails 4NF fails 5NF too; both splits are reported, the
    // multivalued dependency first.
    if (isBcnfSatisfied && !is4NF) {
      decomposition.push(
        ...this.nameRelations(
          this.decomposeTo4NF(
            allAttributes,
            allAttributes,
            functionalDependencies,
            expanded,
          ),
          '4NF',
        ),
      );
    }

    if (isBcnfSatisfied && !is5NF && joinCandidates.length > 0) {
      decomposition.push(
        ...this.nameRelations(joinCandidates[0].relations, '5NF'),
      );
    }

    let highestNormalForm: '4NF' | '5NF' | null = null;

    if (is4NF) {
      highestNormalForm = '4NF';
    }

    if (is5NF) {
      highestNormalForm = '5NF';
    }

    return {
      normalForms: { '4NF': is4NF, '5NF': is5NF },
      highestNormalForm,
      violations: [
        ...blockages,
        ...fourNfViolations,
        ...(isBcnfSatisfied ? fiveNfViolations : []),
      ],
      decomposition,
    };
  }

  /* ------------------------------------------------------------------ 4NF */

  private static findFourthNormalFormViolations(
    allAttributes: string[],
    functionalDependencies: FunctionalDependency[],
    multivaluedDependencies: MultivaluedDependency[],
  ): HigherNormalFormViolation[] {
    const violations: HigherNormalFormViolation[] = [];
    const reported = new Set<string>();

    for (const dependency of multivaluedDependencies) {
      if (MvdEngine.isTrivial(dependency, allAttributes)) {
        continue;
      }

      if (
        MvdEngine.isSuperkey(
          dependency.left,
          allAttributes,
          functionalDependencies,
        )
      ) {
        continue;
      }

      // X ->> Y and its complement share a left-hand side, so they fail or hold
      // together and only one of them should be reported.
      const key = dependency.left.join('|');

      if (reported.has(key)) {
        continue;
      }

      reported.add(key);

      violations.push({
        normalForm: '4NF',
        dependency: `${dependency.left.join(', ')} ->> ${dependency.right.join(', ')}`,
        reason: `The determinant {${dependency.left.join(', ')}} is not a superkey, but it multivalues {${dependency.right.join(', ')}}.`,
      });
    }

    return violations;
  }

  /**
   * For a violating `X ->> Y`, split into `X ∪ Y` and `X ∪ (R - X - Y)` and
   * recurse, because a piece can carry its own violation.
   */
  private static decomposeTo4NF(
    relation: string[],
    allAttributes: string[],
    functionalDependencies: FunctionalDependency[],
    multivaluedDependencies: MultivaluedDependency[],
  ): string[][] {
    if (relation.length <= 2) {
      return [relation];
    }

    for (const dependency of multivaluedDependencies) {
      const appliesToRelation = [...dependency.left, ...dependency.right].every(
        (attribute) => relation.includes(attribute),
      );

      if (!appliesToRelation) {
        continue;
      }

      if (MvdEngine.isTrivial(dependency, relation)) {
        continue;
      }

      if (
        MvdEngine.isSuperkey(
          dependency.left,
          relation,
          functionalDependencies,
        )
      ) {
        continue;
      }

      const rest = relation.filter(
        (attribute) =>
          !dependency.left.includes(attribute) &&
          !dependency.right.includes(attribute),
      );

      if (rest.length === 0) {
        continue;
      }

      const first = this.union(dependency.left, dependency.right);
      const second = this.union(dependency.left, rest);

      return [
        ...this.decomposeTo4NF(
          first,
          allAttributes,
          functionalDependencies,
          multivaluedDependencies,
        ),
        ...this.decomposeTo4NF(
          second,
          allAttributes,
          functionalDependencies,
          multivaluedDependencies,
        ),
      ];
    }

    return [relation];
  }

  /* ------------------------------------------------------------------ 5NF */

  /**
   * Collects the join dependencies that genuinely break 5NF: at least three
   * components, every component a proper subset of R, no component already a
   * superkey, and — for MVD-derived candidates — a lossless join.
   */
  private static findJoinCandidates(
    allAttributes: string[],
    functionalDependencies: FunctionalDependency[],
    expandedMultivaluedDependencies: MultivaluedDependency[],
    joinDependencies: JoinDependency[],
  ): JoinCandidate[] {
    const candidates: JoinCandidate[] = [
      // The dependency-basis split is finer than the one derived from a single
      // MVD, so it is offered first: when both hold, the finer decomposition is
      // the more useful answer.
      ...this.candidatesFromDependencyBasis(
        allAttributes,
        expandedMultivaluedDependencies,
      ).map((relations) => ({ relations, asserted: false })),
      ...this.candidatesFromMultivaluedDependencies(
        allAttributes,
        expandedMultivaluedDependencies,
      ).map((relations) => ({ relations, asserted: false })),
      ...joinDependencies.map((dependency) => ({
        relations: dependency.relations,
        asserted: true,
      })),
    ];

    const found: JoinCandidate[] = [];
    const reported = new Set<string>();

    for (const candidate of candidates) {
      const relations = this.dedupeRelations(candidate.relations);

      if (relations.length < 3) {
        continue;
      }

      // A component that is a superkey means the candidate keys already imply
      // the join dependency, so it constrains nothing. A component equal to R
      // is not a decomposition at all.
      const isTrivial = relations.some(
        (relation) =>
          relation.length >= allAttributes.length ||
          MvdEngine.isSuperkey(
            relation,
            allAttributes,
            functionalDependencies,
          ),
      );

      if (isTrivial) {
        continue;
      }

      if (
        !candidate.asserted &&
        !MvdEngine.isLossless(
          relations,
          allAttributes,
          functionalDependencies,
          expandedMultivaluedDependencies,
        )
      ) {
        continue;
      }

      const key = this.relationSetKey(relations);

      if (reported.has(key)) {
        continue;
      }

      reported.add(key);
      found.push({ relations, asserted: candidate.asserted });
    }

    return found;
  }

  /**
   * `X ->> Y` with `Z = R - X - Y` non-empty yields the three-way split
   * `{X ∪ Y, X ∪ Z, Y ∪ Z}`.
   */
  private static candidatesFromMultivaluedDependencies(
    allAttributes: string[],
    multivaluedDependencies: MultivaluedDependency[],
  ): string[][][] {
    const candidates: string[][][] = [];

    for (const dependency of multivaluedDependencies) {
      if (MvdEngine.isTrivial(dependency, allAttributes)) {
        continue;
      }

      const rest = allAttributes.filter(
        (attribute) =>
          !dependency.left.includes(attribute) &&
          !dependency.right.includes(attribute),
      );

      if (rest.length === 0) {
        continue;
      }

      candidates.push([
        this.union(dependency.left, dependency.right),
        this.union(dependency.left, rest),
        this.union(dependency.right, rest),
      ]);
    }

    return candidates;
  }

  /**
   * Candidates derived from the dependency basis of each determinant.
   *
   * A single MVD only ever yields the three-way split above. But when several
   * MVDs share a determinant — `X ->> Y1`, `X ->> Y2`, and so on — they jointly
   * pin down a *finer* join dependency: `{X ∪ B1, X ∪ B2, ...}`, where the B's
   * are the disjoint blocks of the dependency basis of X.
   *
   * That is the case a relation with three or more independent facts falls
   * into, and the case the single-MVD derivation cannot see.
   */
  private static candidatesFromDependencyBasis(
    allAttributes: string[],
    multivaluedDependencies: MultivaluedDependency[],
  ): string[][][] {
    const byDeterminant = new Map<
      string,
      { left: string[]; rights: string[][] }
    >();

    for (const dependency of multivaluedDependencies) {
      if (MvdEngine.isTrivial(dependency, allAttributes)) {
        continue;
      }

      const key = [...dependency.left].sort().join('|');
      const entry = byDeterminant.get(key) ?? {
        left: [...dependency.left],
        rights: [],
      };

      entry.rights.push([...dependency.right]);
      byDeterminant.set(key, entry);
    }

    const candidates: string[][][] = [];

    for (const { left, rights } of byDeterminant.values()) {
      const remainder = allAttributes.filter(
        (attribute) => !left.includes(attribute),
      );

      const blocks = this.disjointBlocks(remainder, rights);

      // Two blocks is the binary split 4NF already handles.
      if (blocks.length < 3) {
        continue;
      }

      candidates.push(blocks.map((block) => this.union(left, block)));
    }

    return candidates;
  }

  /**
   * Refines a family of attribute sets into disjoint blocks: two attributes
   * share a block exactly when they belong to the same sets. Attributes in no
   * set at all fall into a block of their own, which is how the part of `R - X`
   * that no MVD mentions is accounted for.
   */
  private static disjointBlocks(
    attributes: string[],
    groups: string[][],
  ): string[][] {
    const bySignature = new Map<string, string[]>();

    for (const attribute of attributes) {
      const signature = groups
        .map((group) => (group.includes(attribute) ? '1' : '0'))
        .join('');

      const block = bySignature.get(signature) ?? [];

      block.push(attribute);
      bySignature.set(signature, block);
    }

    return [...bySignature.values()];
  }

  /* --------------------------------------------------------------- helpers */

  private static nameRelations(
    relations: string[][],
    prefix: '4NF' | '5NF',
  ): HigherNormalFormRelation[] {
    return relations.map((attributes, index) => ({
      name: `${prefix}_R${index + 1}`,
      attributes,
      reason: `Result of the ${prefix} decomposition.`,
    }));
  }

  private static union(first: string[], second: string[]): string[] {
    return [...new Set([...first, ...second])];
  }

  private static dedupeRelations(relations: string[][]): string[][] {
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

  private static relationSetKey(relations: string[][]): string {
    return relations
      .map((relation) => [...relation].sort().join('|'))
      .sort()
      .join('#');
  }

  private static formatJoinDependency(relations: string[][]): string {
    return relations
      .map((relation) => `(${relation.join(', ')})`)
      .join(' ⨝ ');
  }
}
