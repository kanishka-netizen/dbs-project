import { describe, expect, it } from 'vitest';

import { resolveNormalizedSchema } from './resolve-normalized-schema';
import type { NormalizationAnalysis } from '../../types/normalization';

function analysis(
  overrides: Partial<NormalizationAnalysis> = {},
): NormalizationAnalysis {
  return {
    relation: 'R',
    valid: true,
    attributes: ['A', 'B', 'C'],
    functionalDependencies: [],
    multivaluedDependencies: [],
    candidateKeys: [['A']],
    normalForms: { '1NF': true, '2NF': true, '3NF': true, BCNF: true },
    highestNormalForm: 'BCNF',
    violations: [],
    decomposition: [],
    bcnfDecomposition: [],
    bcnfSteps: [],
    bcnfProperties: {
      lossless: true,
      dependencyPreserving: true,
      unpreservedDependencies: [],
    },
    decompositionProperties: { lossless: true, dependencyPreserving: true },
    higherNormalForms: {
      normalForms: { '4NF': true, '5NF': true },
      highestNormalForm: null,
      violations: [],
      decomposition: [],
    },
    steps: [],
    warnings: [],
    ...overrides,
  };
}

describe('resolveNormalizedSchema', () => {
  it('prefers the higher-normal-form decomposition when present', () => {
    const result = resolveNormalizedSchema(
      analysis({
        decomposition: [
          { name: 'R1', attributes: ['A', 'B'], reason: 'from 3NF' },
        ],
        higherNormalForms: {
          normalForms: { '4NF': false, '5NF': false },
          highestNormalForm: null,
          violations: [],
          decomposition: [
            { name: '5NF_R1', attributes: ['A', 'B'], reason: 'join dependency' },
          ],
        },
      }),
    );

    expect(result.source).toBe('higher-normal-form');
    expect(result.relations).toHaveLength(1);
    expect(result.relations[0].name).toBe('5NF_R1');
  });

  it('falls back to the BCNF decomposition', () => {
    const result = resolveNormalizedSchema(
      analysis({
        bcnfDecomposition: [
          { name: 'BCNF_R1', attributes: ['A', 'B'], reason: 'superkey' },
        ],
      }),
    );

    expect(result.source).toBe('bcnf');
  });

  it('falls back to the 2NF/3NF decomposition', () => {
    const result = resolveNormalizedSchema(
      analysis({
        decomposition: [
          { name: 'R_1', attributes: ['A', 'B'], reason: 'partial dependency' },
        ],
      }),
    );

    expect(result.source).toBe('2nf-3nf');
  });

  it('returns the relation unchanged when nothing is violated', () => {
    const result = resolveNormalizedSchema(analysis());

    expect(result.source).toBe('already-normalized');
    expect(result.relations).toEqual([
      {
        name: 'R',
        attributes: ['A', 'B', 'C'],
        reason: 'Already in BCNF.',
      },
    ]);
  });

  it('drops relations that cover the same attributes', () => {
    const result = resolveNormalizedSchema(
      analysis({
        bcnfDecomposition: [
          { name: 'BCNF_R1', attributes: ['A', 'B'], reason: 'first' },
          { name: 'BCNF_R2', attributes: ['B', 'A'], reason: 'duplicate' },
        ],
      }),
    );

    expect(result.relations).toHaveLength(1);
    expect(result.relations[0].name).toBe('BCNF_R1');
  });
});
