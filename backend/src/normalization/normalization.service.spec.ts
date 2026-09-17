import { Test, TestingModule } from '@nestjs/testing';
import { NormalizationService } from './normalization.service.js';

/** The union return type is narrowed by hand in each assertion below. */
interface Analysis {
  relation: string;
  valid: boolean;
  errors?: string[];
  warnings: string[];
  candidateKeys: string[][];
  normalForms: Record<string, boolean>;
  highestNormalForm: string;
  violations: { normalForm: string }[];
  higherNormalForms: {
    normalForms: Record<string, boolean>;
    highestNormalForm: string | null;
    violations: { normalForm: string }[];
  };
  steps: { step: number; title: string }[];
}

describe('NormalizationService', () => {
  let service: NormalizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NormalizationService],
    }).compile();

    service = module.get<NormalizationService>(NormalizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects a schema that references an unknown attribute', () => {
    const result = service.analyze({
      relationName: 'R',
      attributes: ['A', 'B'],
      functionalDependencies: [{ left: ['A'], right: ['Z'] }],
    }) as unknown as Analysis;

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
  });

  it('still reports warnings for a schema it accepts', () => {
    const result = service.analyze({
      relationName: 'R',
      attributes: ['A', 'B'],
      functionalDependencies: [{ left: ['A', 'B'], right: ['A'] }],
    }) as unknown as Analysis;

    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(1);
  });

  it('analyses a BCNF violation end to end', () => {
    const result = service.analyze({
      relationName: 'Offering',
      attributes: ['Student', 'Course', 'Instructor'],
      functionalDependencies: [
        { left: ['Student', 'Course'], right: ['Instructor'] },
        { left: ['Instructor'], right: ['Course'] },
      ],
    }) as unknown as Analysis;

    expect(result.valid).toBe(true);
    expect(result.normalForms['3NF']).toBe(true);
    expect(result.normalForms.BCNF).toBe(false);
    expect(result.candidateKeys).toHaveLength(2);
    expect(result.highestNormalForm).toBe('3NF');
  });

  it('reports 4NF and 5NF from multivalued dependencies', () => {
    const result = service.analyze({
      relationName: 'Supply',
      attributes: ['Supplier', 'Part', 'Project'],
      functionalDependencies: [],
      multivaluedDependencies: [{ left: ['Supplier'], right: ['Part'] }],
    }) as unknown as Analysis;

    expect(result.valid).toBe(true);
    expect(result.normalForms.BCNF).toBe(true);
    expect(result.higherNormalForms.normalForms['4NF']).toBe(false);
    expect(result.higherNormalForms.normalForms['5NF']).toBe(false);
    expect(result.highestNormalForm).toBe('BCNF');
  });

  it('reaches 5NF for a relation with no multivalued dependencies', () => {
    const result = service.analyze({
      relationName: 'Customer',
      attributes: ['CustomerID', 'Name', 'City'],
      functionalDependencies: [
        { left: ['CustomerID'], right: ['Name', 'City'] },
      ],
    }) as unknown as Analysis;

    expect(result.highestNormalForm).toBe('5NF');
    expect(result.higherNormalForms.violations).toEqual([]);
  });

  it('keeps the higher forms out of reach below BCNF', () => {
    const result = service.analyze({
      relationName: 'Employee',
      attributes: ['EmployeeID', 'DepartmentID', 'DepartmentName'],
      functionalDependencies: [
        { left: ['EmployeeID'], right: ['DepartmentID'] },
        { left: ['DepartmentID'], right: ['DepartmentName'] },
      ],
    }) as unknown as Analysis;

    expect(result.highestNormalForm).toBe('2NF');
    expect(result.higherNormalForms.normalForms['4NF']).toBe(false);
    expect(result.higherNormalForms.normalForms['5NF']).toBe(false);
  });

  it('walks through every normal form, plus the keys and the verdict', () => {
    const result = service.analyze({
      relationName: 'R',
      attributes: ['A', 'B'],
      functionalDependencies: [{ left: ['A'], right: ['B'] }],
    }) as unknown as Analysis;

    expect(result.steps.map((step) => step.step)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8,
    ]);

    expect(result.steps[0].title).toBe('Find Candidate Keys');
    expect(result.steps.at(-1)?.title).toBe('Final Normalization Result');
  });
});
