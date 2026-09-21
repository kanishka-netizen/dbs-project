import { describe, expect, it } from 'vitest';
import type { NormalizationAnalysis } from '../../types/normalization';
import {
  buildJsonReport,
  buildMarkdownReport,
  buildNormalizationReport,
} from './report';

const generatedAt = '2026-09-17T00:00:00.000Z';

const mockAnalysis: NormalizationAnalysis = {
  relation: 'StudentCourse',
  valid: true,

  attributes: ['StudentID', 'StudentName', 'CourseID', 'CourseName'],

  functionalDependencies: [
    {
      left: ['StudentID'],
      right: ['StudentName'],
    },
    {
      left: ['CourseID'],
      right: ['CourseName'],
    },
  ],

  multivaluedDependencies: [],

  candidateKeys: [['StudentID', 'CourseID']],

  normalForms: {
    '1NF': true,
    '2NF': false,
    '3NF': false,
    BCNF: false,
  },

  highestNormalForm: '1NF',

  violations: [
    {
      normalForm: '2NF',
      dependency: 'StudentID -> StudentName',
      reason: 'Partial dependency detected.',
    },
  ],

  decomposition: [
    {
      name: 'Student',
      attributes: ['StudentID', 'StudentName'],
      reason: 'Removes partial dependency.',
    },
    {
      name: 'Course',
      attributes: ['CourseID', 'CourseName'],
      reason: 'Removes partial dependency.',
    },
  ],

  bcnfDecomposition: [],

  bcnfSteps: [],

  bcnfProperties: {
    lossless: true,
    dependencyPreserving: true,
    unpreservedDependencies: [],
  },

  decompositionProperties: {
    lossless: true,
    dependencyPreserving: true,
  },

  higherNormalForms: {
    normalForms: {
      '4NF': true,
      '5NF': true,
    },
    highestNormalForm: '5NF',
    violations: [],
    decomposition: [],
  },

  steps: [
    {
      step: 1,
      title: 'Identify candidate keys',
      description: 'Find candidate keys from the dependencies.',
      result: 'StudentID, CourseID',
    },
  ],

  warnings: [],
};

describe('normalization report', () => {
  it('builds the expected report object', () => {
    const report = buildNormalizationReport(
      mockAnalysis,
      generatedAt,
    );

    expect(report.generatedAt).toBe(generatedAt);
    expect(report.relation).toBe('StudentCourse');
    expect(report.originalAttributes).toEqual([
      'StudentID',
      'StudentName',
      'CourseID',
      'CourseName',
    ]);

    expect(report.candidateKeys).toEqual([
      ['StudentID', 'CourseID'],
    ]);

    expect(report.normalForms['1NF']).toBe(true);
    expect(report.normalForms['4NF']).toBe(true);
    expect(report.normalForms['5NF']).toBe(true);

    expect(report.violations).toHaveLength(1);
  });

  it('builds a valid JSON report', () => {
    const json = buildJsonReport(mockAnalysis, generatedAt);
    const report = JSON.parse(json);

    expect(report.relation).toBe('StudentCourse');
    expect(report.generatedAt).toBe(generatedAt);
    expect(report.functionalDependencies).toHaveLength(2);
    expect(report.candidateKeys).toEqual([
      ['StudentID', 'CourseID'],
    ]);
  });

  it('builds a readable Markdown report', () => {
    const markdown = buildMarkdownReport(
      mockAnalysis,
      generatedAt,
    );

    expect(markdown).toContain('# Normalization Report');
    expect(markdown).toContain('StudentCourse');
    expect(markdown).toContain('## Functional Dependencies');
    expect(markdown).toContain('StudentID → StudentName');
    expect(markdown).toContain('## Candidate Keys');
    expect(markdown).toContain('StudentID, CourseID');
    expect(markdown).toContain('## Violations');
    expect(markdown).toContain('Partial dependency detected.');
    expect(markdown).toContain('## Normalized Schema');
  });

  it('is deterministic when the same timestamp is supplied', () => {
    const first = buildJsonReport(mockAnalysis, generatedAt);
    const second = buildJsonReport(mockAnalysis, generatedAt);

    expect(first).toBe(second);
  });
});