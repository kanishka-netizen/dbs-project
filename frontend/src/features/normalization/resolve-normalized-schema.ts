import type {
  DecomposedRelation,
  NormalizationAnalysis,
} from '../../types/normalization';

export interface NormalizedSchema {
  /** The relations the schema should become. */
  relations: DecomposedRelation[];
  /** Where those relations came from, for the report header. */
  source: 'higher-normal-form' | 'bcnf' | '2nf-3nf' | 'already-normalized';
}

/**
 * Picks the deepest decomposition the analyser produced.
 *
 * The visualizer shows every decomposition side by side for teaching; the
 * assistant has to commit to one answer, so it takes the strongest result
 * available and falls back to the relation unchanged when nothing is violated.
 */
export function resolveNormalizedSchema(
  analysis: NormalizationAnalysis,
): NormalizedSchema {
  const higher = analysis.higherNormalForms.decomposition;

  if (higher.length > 0) {
    return { relations: dedupe(higher), source: 'higher-normal-form' };
  }

  if (analysis.bcnfDecomposition.length > 0) {
    return { relations: dedupe(analysis.bcnfDecomposition), source: 'bcnf' };
  }

  if (analysis.decomposition.length > 0) {
    return { relations: dedupe(analysis.decomposition), source: '2nf-3nf' };
  }

  return {
    relations: [
      {
        name: analysis.relation,
        attributes: analysis.attributes,
        reason: `Already in ${analysis.highestNormalForm}.`,
      },
    ],
    source: 'already-normalized',
  };
}

/** Two relations with the same attribute set are the same relation. */
function dedupe(relations: DecomposedRelation[]): DecomposedRelation[] {
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
