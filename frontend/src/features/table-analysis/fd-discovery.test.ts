import { describe, expect, it } from 'vitest';
import {
  check1NFAtomicity,
  checkFunctionalDependency,
  discoverCandidateKeys,
  discoverFunctionalDependencies,
} from './fd-discovery';
import {
  projectRelation,
  verifyLosslessJoinOnData,
} from './table-normalizer';
import type { TableInstance } from './table-types';

describe('fd-discovery and table-normalizer', () => {
  const sampleRows = [
    { EmpID: 101, EmpName: 'Alice', DeptID: 10, DeptName: 'HR', ProjectID: 'P1' },
    { EmpID: 101, EmpName: 'Alice', DeptID: 10, DeptName: 'HR', ProjectID: 'P2' },
    { EmpID: 102, EmpName: 'Bob', DeptID: 20, DeptName: 'IT', ProjectID: 'P1' },
    { EmpID: 103, EmpName: 'Charlie', DeptID: 20, DeptName: 'IT', ProjectID: 'P3' },
  ];

  it('verifies functional dependencies that hold', () => {
    // EmpID -> EmpName holds
    const fd1 = checkFunctionalDependency(sampleRows, ['EmpID'], ['EmpName']);
    expect(fd1.holds).toBe(true);

    // DeptID -> DeptName holds
    const fd2 = checkFunctionalDependency(sampleRows, ['DeptID'], ['DeptName']);
    expect(fd2.holds).toBe(true);

    // EmpID -> DeptID holds
    const fd3 = checkFunctionalDependency(sampleRows, ['EmpID'], ['DeptID']);
    expect(fd3.holds).toBe(true);
  });

  it('detects violations in functional dependencies and finds conflicting rows', () => {
    // DeptID -> EmpID does NOT hold (DeptID 10 has Alice, DeptID 20 has Bob & Charlie)
    const fd = checkFunctionalDependency(sampleRows, ['DeptID'], ['EmpID']);
    expect(fd.holds).toBe(false);
    expect(fd.conflictingRows).toBeDefined();
    expect(fd.conflictExplanation).toContain('conflicting right-hand side');
  });

  it('discovers functional dependencies from table rows', () => {
    const attrs = ['EmpID', 'EmpName', 'DeptID', 'DeptName'];
    const discovered = discoverFunctionalDependencies(sampleRows, attrs, 1);

    const holds = discovered.filter((d) => d.holds);
    // Should find EmpID -> EmpName, EmpID -> DeptID, DeptID -> DeptName, etc.
    expect(
      holds.some((d) => d.left.includes('DeptID') && d.right.includes('DeptName')),
    ).toBe(true);
  });

  it('discovers minimal candidate keys from table rows', () => {
    const attrs = ['EmpID', 'ProjectID', 'EmpName', 'DeptID', 'DeptName'];
    const keys = discoverCandidateKeys(sampleRows, attrs, 2);

    // {EmpID, ProjectID} uniquely identifies every row
    expect(keys.some((k) => k.includes('EmpID') && k.includes('ProjectID'))).toBe(true);
  });

  it('identifies 1NF multi-valued cell violations', () => {
    const unnormalizedRows = [
      { ID: 1, Name: 'Aarav', Courses: 'CS101, CS102, CS103' },
      { ID: 2, Name: 'Riya', Courses: 'CS101' },
      { ID: 3, Name: 'Kabir', Courses: '[Math, Physics]' },
    ];

    const result = check1NFAtomicity(unnormalizedRows, ['ID', 'Name', 'Courses']);
    expect(result.is1NF).toBe(false);
    expect(result.violations).toHaveLength(2); // row 1 (comma list) and row 3 (bracket list)
    expect(result.violations[0].rowIndex).toBe(0);
    expect(result.violations[0].suggestedValues).toEqual(['CS101', 'CS102', 'CS103']);
  });

  it('projects relations and tests lossless natural join reconstruction', () => {
    const table: TableInstance = {
      name: 'Emp_Dept',
      columns: [
        { name: 'EmpID', type: 'INT' },
        { name: 'EmpName', type: 'VARCHAR(50)' },
        { name: 'DeptID', type: 'INT' },
        { name: 'DeptName', type: 'VARCHAR(50)' },
      ],
      rows: [
        { EmpID: 1, EmpName: 'Alice', DeptID: 10, DeptName: 'HR' },
        { EmpID: 2, EmpName: 'Bob', DeptID: 20, DeptName: 'IT' },
        { EmpID: 3, EmpName: 'Charlie', DeptID: 10, DeptName: 'HR' },
      ],
    };

    // Decompose into:
    // R1(EmpID, EmpName, DeptID)
    // R2(DeptID, DeptName)
    const r1Rows = projectRelation(table.rows, ['EmpID', 'EmpName', 'DeptID']);
    const r2Rows = projectRelation(table.rows, ['DeptID', 'DeptName']);

    expect(r1Rows).toHaveLength(3);
    expect(r2Rows).toHaveLength(2); // Distinct DeptID 10 and 20

    const decomposed = [
      { name: 'R1', attributes: ['EmpID', 'EmpName', 'DeptID'], rows: r1Rows },
      { name: 'R2', attributes: ['DeptID', 'DeptName'], rows: r2Rows },
    ];

    const joinTest = verifyLosslessJoinOnData(table, decomposed);
    expect(joinTest.isLossless).toBe(true);
    expect(joinTest.spuriousTupleCount).toBe(0);
    expect(joinTest.reconstructedRowCount).toBe(3);
  });
});
