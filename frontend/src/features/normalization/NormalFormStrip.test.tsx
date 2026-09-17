import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NormalFormStrip } from './NormalFormStrip';
import type { NormalFormVerdict } from './NormalFormStrip';

const VERDICTS: NormalFormVerdict[] = [
  { normalForm: '1NF', satisfied: true },
  { normalForm: '2NF', satisfied: true },
  { normalForm: '3NF', satisfied: true },
  { normalForm: 'BCNF', satisfied: false },
  { normalForm: '4NF', satisfied: false },
  { normalForm: '5NF', satisfied: false },
];

describe('NormalFormStrip', () => {
  it('renders every normal form with its verdict', () => {
    render(<NormalFormStrip verdicts={VERDICTS} highestNormalForm="3NF" />);

    expect(screen.getAllByRole('listitem')).toHaveLength(6);
    expect(screen.getAllByText('Satisfied')).toHaveLength(3);
    expect(screen.getAllByText('Violated')).toHaveLength(3);
  });

  it('marks the highest normal form reached', () => {
    render(<NormalFormStrip verdicts={VERDICTS} highestNormalForm="3NF" />);

    expect(screen.getByText('Highest')).toBeInTheDocument();
  });
});
