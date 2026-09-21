import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FiveNfPanel } from './FiveNfPanel';
import type { HigherNormalFormResult } from '../../types/normalization';

function result(
  overrides: Partial<HigherNormalFormResult> = {},
): HigherNormalFormResult {
  return {
    normalForms: { '4NF': true, '5NF': true },
    highestNormalForm: '5NF',
    violations: [],
    decomposition: [],
    ...overrides,
  };
}

const SUPPLY = ['Supplier', 'Part', 'Project'];

describe('FiveNfPanel', () => {
  it('reports satisfaction when no join dependency applies', () => {
    render(
      <FiveNfPanel higherNormalForms={result()} allAttributes={SUPPLY} />,
    );

    expect(screen.getByText('Satisfied')).toBeInTheDocument();
    expect(screen.getByText(/No join dependency breaks 5NF/)).toBeInTheDocument();
  });

  it('draws the join dependency when one is violated', () => {
    render(
      <FiveNfPanel
        allAttributes={SUPPLY}
        higherNormalForms={result({
          normalForms: { '4NF': false, '5NF': false },
          highestNormalForm: null,
          violations: [
            {
              normalForm: '5NF',
              dependency: '(Supplier, Part) ⨝ (Supplier, Project) ⨝ (Part, Project)',
              reason: 'The relation is the lossless join of three smaller relations.',
            },
          ],
          decomposition: [
            { name: '5NF_R1', attributes: ['Supplier', 'Part'], reason: 'r' },
            { name: '5NF_R2', attributes: ['Supplier', 'Project'], reason: 'r' },
            { name: '5NF_R3', attributes: ['Part', 'Project'], reason: 'r' },
          ],
        })}
      />,
    );

    expect(screen.getByText('Violated')).toBeInTheDocument();
    expect(screen.getByText('The join dependency')).toBeInTheDocument();
    expect(
      screen.getByText(/joined losslessly back into/),
    ).toBeInTheDocument();
  });

  it('explains that 5NF is out of reach while 4NF fails', () => {
    render(
      <FiveNfPanel
        allAttributes={SUPPLY}
        higherNormalForms={result({
          normalForms: { '4NF': false, '5NF': false },
          highestNormalForm: null,
        })}
      />,
    );

    const note = screen.getByRole('note');

    expect(note).toHaveTextContent(/has not reached 4NF/);
    expect(note).toHaveTextContent(/every 5NF relation is also in 4NF/i);
  });

  it('does not show the 4NF note once 4NF holds', () => {
    render(
      <FiveNfPanel
        allAttributes={SUPPLY}
        higherNormalForms={result({ normalForms: { '4NF': true, '5NF': false } })}
      />,
    );

    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('ignores a two-way split, which is 4NF territory', () => {
    render(
      <FiveNfPanel
        allAttributes={SUPPLY}
        higherNormalForms={result({
          decomposition: [
            { name: '4NF_R1', attributes: ['Supplier', 'Part'], reason: 'r' },
            { name: '4NF_R2', attributes: ['Supplier', 'Project'], reason: 'r' },
          ],
        })}
      />,
    );

    expect(screen.queryByText('The join dependency')).not.toBeInTheDocument();
  });
});
