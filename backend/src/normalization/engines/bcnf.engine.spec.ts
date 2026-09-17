import { BCNFEngine } from './bcnf.engine.js';

const OFFERING = ['Student', 'Course', 'Instructor'];
const OFFERING_DEPENDENCIES = [
  { left: ['Student', 'Course'], right: ['Instructor'] },
  { left: ['Instructor'], right: ['Course'] },
];

describe('BCNFEngine', () => {
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

  it('names each relation in order', () => {
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
