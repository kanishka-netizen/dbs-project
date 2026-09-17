import { describe, expect, it } from 'vitest';

import { parseSchema } from './schema-text';

describe('parseSchema', () => {
  it('reads a declared attribute list and functional dependencies', () => {
    const { schema, issues } = parseSchema(
      [
        'attributes: StudentID, CourseID, CourseName',
        '',
        'StudentID, CourseID -> CourseName',
      ].join('\n'),
    );

    expect(issues).toEqual([]);
    expect(schema.attributes).toEqual([
      'StudentID',
      'CourseID',
      'CourseName',
    ]);
    expect(schema.functionalDependencies).toEqual([
      { left: ['StudentID', 'CourseID'], right: ['CourseName'] },
    ]);
    expect(schema.multivaluedDependencies).toEqual([]);
  });

  it('separates multivalued dependencies from functional ones', () => {
    const { schema, issues } = parseSchema(
      [
        'attributes: Supplier, Part, Project',
        'Supplier, Part ->> Project',
        'Supplier, Project ->> Part',
      ].join('\n'),
    );

    expect(issues).toEqual([]);
    expect(schema.functionalDependencies).toEqual([]);
    expect(schema.multivaluedDependencies).toEqual([
      { left: ['Supplier', 'Part'], right: ['Project'] },
      { left: ['Supplier', 'Project'], right: ['Part'] },
    ]);
  });

  it('accepts unicode arrows', () => {
    const { schema } = parseSchema(
      ['attributes: A, B, C', 'A → B', 'A ↠ C'].join('\n'),
    );

    expect(schema.functionalDependencies).toEqual([
      { left: ['A'], right: ['B'] },
    ]);
    expect(schema.multivaluedDependencies).toEqual([
      { left: ['A'], right: ['C'] },
    ]);
  });

  it('ignores blank lines and comments', () => {
    const { schema, issues } = parseSchema(
      [
        '# a comment',
        'attributes: A, B',
        '',
        '// another comment',
        'A -> B',
        '-- trailing comment',
      ].join('\n'),
    );

    expect(issues).toEqual([]);
    expect(schema.attributes).toEqual(['A', 'B']);
    expect(schema.functionalDependencies).toEqual([
      { left: ['A'], right: ['B'] },
    ]);
  });

  it('derives attributes from the dependencies when none are declared', () => {
    const { schema } = parseSchema('A, B -> C');

    expect(schema.attributes).toEqual(['A', 'B', 'C']);
  });

  it('treats the first bare line as the attribute list', () => {
    const { schema, issues } = parseSchema('A, B, C\nA -> B');

    expect(issues).toEqual([]);
    expect(schema.attributes).toEqual(['A', 'B', 'C']);
  });

  it('reports a line that cannot be read', () => {
    const { issues } = parseSchema(
      ['attributes: A, B', 'this is not a dependency'].join('\n'),
    );

    expect(issues).toHaveLength(1);
    expect(issues[0].line).toBe(2);
  });

  it('reports a dependency with a missing side', () => {
    const { issues } = parseSchema(['attributes: A, B', 'A ->'].join('\n'));

    expect(issues).toHaveLength(1);
    expect(issues[0].line).toBe(2);
  });

  it('deduplicates repeated attributes', () => {
    const { schema } = parseSchema('attributes: A, B, A');

    expect(schema.attributes).toEqual(['A', 'B']);
  });
});
