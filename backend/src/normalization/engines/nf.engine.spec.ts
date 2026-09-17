import {
  CandidateKeyEngine,
  FunctionalDependency,
} from './candidate-key.engine.js';
import { NormalFormEngine } from './nf.engine.js';

function analyze(
  attributes: string[],
  dependencies: FunctionalDependency[],
) {
  return NormalFormEngine.analyze(
    attributes,
    dependencies,
    CandidateKeyEngine.findCandidateKeys(attributes, dependencies),
  );
}

describe('NormalFormEngine', () => {
  it('ignores trivial dependencies when checking 3NF and BCNF', () => {
    const result = analyze(['A', 'B'], [{ left: ['A'], right: ['A'] }]);

    expect(result.normalForms['3NF']).toBe(true);
    expect(result.normalForms.BCNF).toBe(true);
    expect(result.violations).toEqual([]);
    expect(result.highestNormalForm).toBe('BCNF');
  });

  it('detects a partial dependency and fails every higher form', () => {
    const result = analyze(
      ['StudentID', 'CourseID', 'CourseName', 'Instructor'],
      [
        { left: ['StudentID', 'CourseID'], right: ['CourseName'] },
        { left: ['CourseID'], right: ['Instructor'] },
      ],
    );

    expect(result.normalForms['1NF']).toBe(true);
    expect(result.normalForms['2NF']).toBe(false);
    expect(result.normalForms['3NF']).toBe(false);
    expect(result.normalForms.BCNF).toBe(false);
    expect(result.highestNormalForm).toBe('1NF');
    expect(result.violations[0].normalForm).toBe('2NF');
  });

  it('detects a transitive dependency: 2NF holds, 3NF does not', () => {
    const result = analyze(
      ['EmployeeID', 'DepartmentID', 'DepartmentName'],
      [
        { left: ['EmployeeID'], right: ['DepartmentID'] },
        { left: ['DepartmentID'], right: ['DepartmentName'] },
      ],
    );

    expect(result.normalForms['2NF']).toBe(true);
    expect(result.normalForms['3NF']).toBe(false);
    expect(result.highestNormalForm).toBe('2NF');
  });

  it('holds 3NF while failing BCNF when the dependent attribute is prime', () => {
    const result = analyze(
      ['Student', 'Course', 'Instructor'],
      [
        { left: ['Student', 'Course'], right: ['Instructor'] },
        { left: ['Instructor'], right: ['Course'] },
      ],
    );

    expect(result.normalForms['3NF']).toBe(true);
    expect(result.normalForms.BCNF).toBe(false);
    expect(result.highestNormalForm).toBe('3NF');
  });

  it('reports BCNF for a relation every determinant of which is a superkey', () => {
    const result = analyze(
      ['CustomerID', 'Name', 'City'],
      [{ left: ['CustomerID'], right: ['Name', 'City'] }],
    );

    expect(result.normalForms.BCNF).toBe(true);
    expect(result.highestNormalForm).toBe('BCNF');
    expect(result.violations).toEqual([]);
  });

  it('does not flag a multi-attribute right-hand side as a whole', () => {
    const result = analyze(
      ['A', 'B', 'C'],
      [{ left: ['A'], right: ['A', 'B', 'C'] }],
    );

    expect(result.normalForms.BCNF).toBe(true);
    expect(result.violations).toEqual([]);
  });
});
