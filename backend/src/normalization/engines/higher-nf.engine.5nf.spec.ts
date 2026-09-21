import { HigherNormalFormEngine } from './higher-nf.engine.js';

const SUPPLY = ['Supplier', 'Part', 'Project'];

describe('HigherNormalFormEngine', () => {
  describe('independent facts sharing a relation', () => {
    it('fails 4NF and 5NF when a supplier multivalues parts', () => {
      const result = HigherNormalFormEngine.analyze(SUPPLY, [], [
        { left: ['Supplier'], right: ['Part'] },
      ]);

      expect(result.normalForms['4NF']).toBe(false);
      expect(result.normalForms['5NF']).toBe(false);
      expect(result.highestNormalForm).toBeNull();
    });

    it('suggests the binary split for 4NF', () => {
      const result = HigherNormalFormEngine.analyze(SUPPLY, [], [
        { left: ['Supplier'], right: ['Part'] },
      ]);

      const fourNf = result.decomposition.filter((relation) =>
        relation.name.startsWith('4NF_'),
      );

      expect(fourNf.map((relation) => relation.attributes)).toEqual([
        ['Supplier', 'Part'],
        ['Supplier', 'Project'],
      ]);
    });

    it('suggests the lossless three-way split for 5NF', () => {
      const result = HigherNormalFormEngine.analyze(SUPPLY, [], [
        { left: ['Supplier'], right: ['Part'] },
      ]);

      const fiveNf = result.decomposition.filter((relation) =>
        relation.name.startsWith('5NF_'),
      );

      expect(fiveNf.map((relation) => relation.attributes)).toEqual([
        ['Supplier', 'Part'],
        ['Supplier', 'Project'],
        ['Part', 'Project'],
      ]);
    });

    it('reports a complemented pair as a single 4NF violation', () => {
      const result = HigherNormalFormEngine.analyze(SUPPLY, [], [
        { left: ['Supplier'], right: ['Part'] },
        { left: ['Supplier'], right: ['Project'] },
      ]);

      const fourNf = result.violations.filter(
        (violation) => violation.normalForm === '4NF',
      );

      expect(fourNf).toHaveLength(1);
    });
  });

  describe('trivial multivalued dependencies', () => {
    it('ignores one whose left and right cover the relation', () => {
      const result = HigherNormalFormEngine.analyze(SUPPLY, [], [
        { left: ['Supplier', 'Part'], right: ['Project'] },
      ]);

      expect(result.normalForms['4NF']).toBe(true);
      expect(result.violations).toEqual([]);
    });
  });

  describe('multivalued dependencies with a superkey determinant', () => {
    it('satisfies 4NF and 5NF', () => {
      const result = HigherNormalFormEngine.analyze(
        ['A', 'B', 'C'],
        [{ left: ['A'], right: ['B', 'C'] }],
        [{ left: ['A'], right: ['B'] }],
      );

      expect(result.normalForms['4NF']).toBe(true);
      expect(result.highestNormalForm).toBe('5NF');
    });
  });

  describe('relations with no multivalued dependencies', () => {
    it('satisfies 4NF and 5NF', () => {
      const result = HigherNormalFormEngine.analyze(
        ['CustomerID', 'Name', 'City'],
        [{ left: ['CustomerID'], right: ['Name', 'City'] }],
        [],
      );

      expect(result.normalForms).toEqual({ '4NF': true, '5NF': true });
      expect(result.highestNormalForm).toBe('5NF');
      expect(result.decomposition).toEqual([]);
    });
  });

  describe('a relation that has not reached BCNF', () => {
    it('reports 4NF and 5NF as out of reach, with a reason', () => {
      const result = HigherNormalFormEngine.analyze(
        ['Student', 'Course', 'Instructor'],
        [
          { left: ['Student', 'Course'], right: ['Instructor'] },
          { left: ['Instructor'], right: ['Course'] },
        ],
        [],
        [],
        false,
      );

      expect(result.normalForms['4NF']).toBe(false);
      expect(result.normalForms['5NF']).toBe(false);
      expect(result.highestNormalForm).toBeNull();
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].normalForm).toBe('4NF');
      expect(result.decomposition).toEqual([]);
    });
  });

  describe('explicit join dependencies', () => {
    it('trusts an asserted join dependency rather than re-deriving it', () => {
      const result = HigherNormalFormEngine.analyze(
        ['A', 'B', 'C'],
        [],
        [],
        [{ relations: [['A', 'B'], ['B', 'C'], ['A', 'C']] }],
      );

      expect(result.normalForms['4NF']).toBe(true);
      expect(result.normalForms['5NF']).toBe(false);
      expect(result.highestNormalForm).toBe('4NF');

      const fiveNf = result.decomposition.filter((relation) =>
        relation.name.startsWith('5NF_'),
      );

      expect(fiveNf).toHaveLength(3);
    });

    it('ignores a join dependency one of whose parts is the whole relation', () => {
      const result = HigherNormalFormEngine.analyze(
        ['A', 'B', 'C'],
        [],
        [],
        [{ relations: [['A', 'B', 'C'], ['A', 'B'], ['B', 'C']] }],
      );

      expect(result.normalForms['5NF']).toBe(true);
    });
  });

  describe('several MVDs sharing a determinant', () => {
    it('finds the finer split the dependency basis implies', () => {
      const result = HigherNormalFormEngine.analyze(
        ['A', 'B', 'C', 'D'],
        [],
        [
          { left: ['A'], right: ['B'] },
          { left: ['A'], right: ['C'] },
        ],
      );

      expect(result.normalForms['5NF']).toBe(false);

      const fiveNf = result.decomposition.filter((relation) =>
        relation.name.startsWith('5NF_'),
      );

      expect(fiveNf.map((relation) => relation.attributes)).toEqual([
        ['A', 'B'],
        ['A', 'C'],
        ['A', 'D'],
      ]);
    });

    it('does not invent a split when only two blocks exist', () => {
      const result = HigherNormalFormEngine.analyze(
        ['Supplier', 'Part', 'Project'],
        [],
        [{ left: ['Supplier'], right: ['Part'] }],
      );

      const fiveNf = result.decomposition.filter((relation) =>
        relation.name.startsWith('5NF_'),
      );

      // Two blocks is the binary case 4NF already covers, so the three-way
      // split comes from the single-MVD derivation, not the basis.
      expect(fiveNf.map((relation) => relation.attributes)).toEqual([
        ['Supplier', 'Part'],
        ['Supplier', 'Project'],
        ['Part', 'Project'],
      ]);
    });
  });
});
