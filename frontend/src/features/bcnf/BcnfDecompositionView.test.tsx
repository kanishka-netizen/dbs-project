import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BcnfDecompositionView } from './BcnfDecompositionView';
import type { BcnfProperties } from './BcnfDecompositionView';
import type { BCNFSplitStep, DecomposedRelation } from '../../types/normalization';

const RELATIONS: DecomposedRelation[] = [
  {
    name: 'BCNF_R1',
    attributes: ['Instructor', 'Course'],
    reason: 'X ∪ Y, from splitting R on Instructor → Course.',
  },
  {
    name: 'BCNF_R2',
    attributes: ['Student', 'Instructor'],
    reason: 'R − (Y − X), from splitting R on Instructor → Course.',
  },
];

const STEPS: BCNFSplitStep[] = [
  {
    step: 1,
    sourceRelation: 'R',
    sourceAttributes: ['Student', 'Course', 'Instructor'],
    violatingDependency: 'Instructor → Course',
    reason:
      '{Instructor} is not a superkey of {Student, Course, Instructor}, so Instructor → Course breaks BCNF.',
    produced: [
      { name: 'BCNF_R1', attributes: ['Instructor', 'Course'] },
      { name: 'BCNF_R2', attributes: ['Student', 'Instructor'] },
    ],
  },
];

const PRESERVING: BcnfProperties = {
  lossless: true,
  dependencyPreserving: true,
  unpreservedDependencies: [],
};

const LOSING: BcnfProperties = {
  lossless: true,
  dependencyPreserving: false,
  unpreservedDependencies: ['Instructor → Course'],
};

describe('BcnfDecompositionView', () => {
  it('shows the dependency that drove each split', () => {
    render(
      <BcnfDecompositionView
        relations={RELATIONS}
        steps={STEPS}
        properties={PRESERVING}
      />,
    );

    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getAllByText('Instructor → Course').length).toBeGreaterThan(0);
    // The phrase appears in the algorithm explanation as well as the step.
    expect(
      screen.getAllByText(/not a superkey/).length,
    ).toBeGreaterThanOrEqual(2);
  });

  it('names both halves of the split', () => {
    render(
      <BcnfDecompositionView
        relations={RELATIONS}
        steps={STEPS}
        properties={PRESERVING}
      />,
    );

    // Once in the split diagram, once in the resulting relations.
    expect(screen.getAllByText('BCNF_R1').length).toBeGreaterThan(1);
    expect(screen.getAllByText('BCNF_R2').length).toBeGreaterThan(1);
  });

  it('says when no split was needed', () => {
    render(
      <BcnfDecompositionView
        relations={[
          {
            name: 'BCNF_R1',
            attributes: ['A', 'B'],
            reason: 'Already satisfied BCNF, so this relation was never split.',
          },
        ]}
        steps={[]}
        properties={PRESERVING}
      />,
    );

    expect(screen.getByText(/already satisfies BCNF/i)).toBeInTheDocument();
  });

  it('warns which dependencies BCNF cost', () => {
    render(
      <BcnfDecompositionView
        relations={RELATIONS}
        steps={STEPS}
        properties={LOSING}
      />,
    );

    const note = screen.getByRole('note');

    expect(note).toBeInTheDocument();
    expect(note).toHaveTextContent(/BCNF costs you/);
    expect(note).toHaveTextContent('Instructor → Course');
    expect(note).toHaveTextContent(/trade-off against 3NF/);
  });

  it('confirms preservation when nothing was lost', () => {
    render(
      <BcnfDecompositionView
        relations={RELATIONS}
        steps={STEPS}
        properties={PRESERVING}
      />,
    );

    expect(
      screen.getByText(/preserves every functional dependency/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });
});
