import { BCNFEngine } from './bcnf.engine.js';
import type { FunctionalDependency } from './candidate-key.engine.js';

const OFFERING = ['Student', 'Course', 'Instructor'];
const OFFERING_DEPENDENCIES: FunctionalDependency[] = [
  { left: ['Student', 'Course'], right: ['Instructor'] },
  { left: ['Instructor'], right: ['Course'] },
];

describe('BCNFEngine', () => {
  describe('decomposition', () => {
    it('leaves a relation that already satisfies BCNF alone', () => {
      const result = BCNFEngine.decompose(
        ['CustomerID', 'Name', 'City'],
        [{ left: ['CustomerID'], right: ['Name', 'City'] }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].attributes).toEqual(['CustomerID', 'Name', 'City']);
    });

    it('splits a relation whose determinant is not a superkey', () => {
      const result = BCNFEngine.decompose(OFFERING, OFFERING_DEPENDENCIES);

      expect(result.map((relation) => relation.attributes)).toEqual([
        ['Instructor', 'Course'],
        ['Student', 'Instructor'],
      ]);
    });

    it('ignores trivial dependencies', () => {
      const result = BCNFEngine.decompose(
        ['A', 'B'],
        [{ left: ['A'], right: ['A'] }],
      );

      expect(result).toHaveLength(1);
    });

    it('names each relation in order, with no gaps', () => {
      BCNFEngine.decompose(OFFERING, OFFERING_DEPENDENCIES).forEach(
        (relation, index) => {
          expect(relation.name).toBe(`BCNF_R${index + 1}`);
        },
      );
    });

    it('produces relations that between them cover every attribute', () => {
      const result = BCNFEngine.decompose(OFFERING, OFFERING_DEPENDENCIES);

      const covered = new Set(result.flatMap((relation) => relation.attributes));

      expect([...covered].sort()).toEqual([...OFFERING].sort());
    });

    it('does not repeat a relation', () => {
      const result = BCNFEngine.decompose(
        ['A', 'B', 'C'],
        [
          { left: ['A'], right: ['B'] },
          { left: ['B'], right: ['C'] },
        ],
      );

      const keys = result.map((relation) =>
        [...relation.attributes].sort().join('|'),
      );

      expect(new Set(keys).size).toBe(keys.length);
    });
  });

  describe('determinism', () => {
    it('is independent of the order the dependencies arrive in', () => {
      const attributes = ['A', 'B', 'C'];

      const forward: FunctionalDependency[] = [
        { left: ['A'], right: ['B'] },
        { left: ['B'], right: ['A'] },
      ];

      const reversed: FunctionalDependency[] = [
        { left: ['B'], right: ['A'] },
        { left: ['A'], right: ['B'] },
      ];

      const first = BCNFEngine.analyze(attributes, forward);
      const second = BCNFEngine.analyze(attributes, reversed);

      expect(first.relations).toEqual(second.relations);
      expect(first.steps).toEqual(second.steps);
    });

    it('is independent of the order of attributes inside a dependency', () => {
      const attributes = ['A', 'B', 'C', 'D'];

      const first = BCNFEngine.analyze(attributes, [
        { left: ['A', 'B'], right: ['C'] },
        { left: ['C'], right: ['D'] },
      ]);

      const second = BCNFEngine.analyze(attributes, [
        { left: ['B', 'A'], right: ['C'] },
        { left: ['C'], right: ['D'] },
      ]);

      expect(first.relations).toEqual(second.relations);
    });
  });

  describe('the split trace', () => {
    it('records one step per split, naming the violating dependency', () => {
      const { steps } = BCNFEngine.analyze(OFFERING, OFFERING_DEPENDENCIES);

      expect(steps).toHaveLength(1);
      expect(steps[0].step).toBe(1);
      expect(steps[0].sourceRelation).toBe('R');
      expect(steps[0].sourceAttributes).toEqual(OFFERING);
      expect(steps[0].violatingDependency).toBe('Instructor → Course');
      expect(steps[0].produced.map((relation) => relation.name)).toEqual([
        'BCNF_R1',
        'BCNF_R2',
      ]);
    });

    it('explains why the dependency breaks BCNF', () => {
      const { steps } = BCNFEngine.analyze(OFFERING, OFFERING_DEPENDENCIES);

      expect(steps[0].reason).toContain('Instructor');
      expect(steps[0].reason).toContain('not a superkey');
    });

    it('records no steps when the relation is already in BCNF', () => {
      const result = BCNFEngine.analyze(['A', 'B'], [
        { left: ['A'], right: ['B'] },
      ]);

      expect(result.steps).toEqual([]);
      expect(result.relations).toHaveLength(1);
      expect(result.relations[0].reason).toContain('never split');
    });

    it('ties each produced relation back to the split that made it', () => {
      const result = BCNFEngine.analyze(OFFERING, OFFERING_DEPENDENCIES);

      expect(result.relations[0].reason).toContain('X ∪ Y');
      expect(result.relations[0].reason).toContain('Instructor → Course');
      expect(result.relations[1].reason).toContain('R − (Y − X)');
      expect(result.relations[1].reason).toContain('Instructor → Course');
    });

    it('never gives two different relations the same name', () => {
      const result = BCNFEngine.analyze(
        ['A', 'B', 'C', 'D'],
        [
          { left: ['A'], right: ['B'] },
          { left: ['B'], right: ['C'] },
          { left: ['C'], right: ['D'] },
        ],
      );

      const attributesByName = new Map<string, string>();
      let collision = false;

      const record = (name: string, attrs: string[]) => {
        const key = [...attrs].sort().join('|');
        const existing = attributesByName.get(name);

        if (existing !== undefined && existing !== key) {
          collision = true;
        }

        attributesByName.set(name, key);
      };

      for (const relation of result.relations) {
        record(relation.name, relation.attributes);
      }

      for (const step of result.steps) {
        record(step.sourceRelation, step.sourceAttributes);

        for (const produced of step.produced) {
          record(produced.name, produced.attributes);
        }
      }

      expect(collision).toBe(false);
    });
  });
});
