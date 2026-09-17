import { MvdEngine } from './mvd.engine.js';

describe('MvdEngine', () => {
  describe('isTrivial', () => {
    it('treats a right-hand side inside the left-hand side as trivial', () => {
      expect(
        MvdEngine.isTrivial({ left: ['A'], right: ['A'] }, ['A', 'B', 'C']),
      ).toBe(true);
    });

    it('treats a dependency covering the whole relation as trivial', () => {
      expect(
        MvdEngine.isTrivial(
          { left: ['A', 'B'], right: ['C'] },
          ['A', 'B', 'C'],
        ),
      ).toBe(true);
    });

    it('accepts a dependency that genuinely constrains the relation', () => {
      expect(
        MvdEngine.isTrivial({ left: ['A'], right: ['B'] }, ['A', 'B', 'C']),
      ).toBe(false);
    });
  });

  describe('complement', () => {
    it('returns the attributes outside left and right', () => {
      expect(
        MvdEngine.complement({ left: ['A'], right: ['B'] }, ['A', 'B', 'C']),
      ).toEqual({ left: ['A'], right: ['C'] });
    });

    it('returns null when nothing is left over', () => {
      expect(
        MvdEngine.complement(
          { left: ['A', 'B'], right: ['C'] },
          ['A', 'B', 'C'],
        ),
      ).toBeNull();
    });
  });

  describe('expandComplements', () => {
    it('adds the complement of every dependency', () => {
      const expanded = MvdEngine.expandComplements(
        [{ left: ['A'], right: ['B'] }],
        ['A', 'B', 'C'],
      );

      expect(expanded).toHaveLength(2);
      expect(expanded).toContainEqual({ left: ['A'], right: ['C'] });
    });

    it('does not duplicate a dependency that has no complement', () => {
      const expanded = MvdEngine.expandComplements(
        [{ left: ['A'], right: ['B'] }],
        ['A', 'B'],
      );

      expect(expanded).toHaveLength(1);
    });

    it('collapses a complemented pair that was supplied twice', () => {
      const expanded = MvdEngine.expandComplements(
        [
          { left: ['A'], right: ['B'] },
          { left: ['A'], right: ['C'] },
        ],
        ['A', 'B', 'C'],
      );

      expect(expanded).toHaveLength(2);
    });
  });

  describe('isSuperkey', () => {
    it('is true when the closure covers the relation', () => {
      expect(
        MvdEngine.isSuperkey(
          ['A', 'C'],
          ['A', 'B', 'C'],
          [{ left: ['A'], right: ['B'] }],
        ),
      ).toBe(true);
    });

    it('is false when the closure falls short', () => {
      expect(
        MvdEngine.isSuperkey(
          ['A'],
          ['A', 'B', 'C'],
          [{ left: ['A'], right: ['B'] }],
        ),
      ).toBe(false);
    });
  });

  describe('isLossless', () => {
    it('accepts a binary split whose shared attributes determine the rest', () => {
      expect(
        MvdEngine.isLossless(
          [
            ['A', 'B'],
            ['A', 'C'],
          ],
          ['A', 'B', 'C'],
          [{ left: ['A'], right: ['B'] }],
          [],
        ),
      ).toBe(true);
    });

    it('rejects a binary split with nothing in common', () => {
      expect(
        MvdEngine.isLossless(
          [['A', 'B'], ['C']],
          ['A', 'B', 'C'],
          [{ left: ['A'], right: ['B'] }],
          [],
        ),
      ).toBe(false);
    });

    it('accepts the three-way split a multivalued dependency implies', () => {
      expect(
        MvdEngine.isLossless(
          [
            ['Supplier', 'Part'],
            ['Supplier', 'Project'],
            ['Part', 'Project'],
          ],
          ['Supplier', 'Part', 'Project'],
          [],
          [{ left: ['Supplier'], right: ['Part'] }],
        ),
      ).toBe(true);
    });

    it('rejects a three-way split that nothing implies', () => {
      expect(
        MvdEngine.isLossless(
          [
            ['A', 'B'],
            ['B', 'C'],
            ['A', 'C'],
          ],
          ['A', 'B', 'C'],
          [],
          [],
        ),
      ).toBe(false);
    });
  });
});
