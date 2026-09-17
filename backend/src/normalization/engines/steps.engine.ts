import { FunctionalDependency } from './candidate-key.engine.js';

export interface NormalizationStep {
  step: number;
  title: string;
  description: string;
  result: string;
}

export class StepsEngine {
  static generateSteps(
    attributes: string[],
    dependencies: FunctionalDependency[],
    candidateKeys: string[][],
    normalForms: {
      '1NF': boolean;
      '2NF': boolean;
      '3NF': boolean;
      BCNF: boolean;
    },
    highestNormalForm: string,
    violations: {
      normalForm: string;
      dependency: string;
      reason: string;
    }[],
  ): NormalizationStep[] {
    const steps: NormalizationStep[] = [];

    // Step 1: Candidate Keys
    const keyText =
      candidateKeys.length > 0
        ? candidateKeys
            .map((key) => `{${key.join(', ')}}`)
            .join(', ')
        : 'No candidate key found';

    steps.push({
      step: 1,
      title: 'Find Candidate Keys',
      description:
        'Candidate keys are identified using attribute closure and functional dependencies.',
      result: `Candidate Key(s): ${keyText}`,
    });

    // Step 2: 1NF
    steps.push({
      step: 2,
      title: 'Check 1NF',
      description:
        'The relation is checked for atomic attributes and repeating groups.',
      result: normalForms['1NF']
        ? 'The relation satisfies 1NF.'
        : 'The relation does not satisfy 1NF.',
    });

    // Step 3: 2NF
    const secondNFViolation = violations.find(
      (violation) => violation.normalForm === '2NF',
    );

    steps.push({
      step: 3,
      title: 'Check 2NF',
      description: secondNFViolation
        ? secondNFViolation.reason
        : 'The relation is checked for partial dependency of non-prime attributes on candidate keys.',
      result: normalForms['2NF']
        ? 'The relation satisfies 2NF.'
        : `2NF is violated because of ${
            secondNFViolation?.dependency ?? 'a partial dependency'
          }.`,
    });

    // Step 4: 3NF
    const thirdNFViolation = violations.find(
      (violation) => violation.normalForm === '3NF',
    );

    steps.push({
      step: 4,
      title: 'Check 3NF',
      description: thirdNFViolation
        ? thirdNFViolation.reason
        : 'The relation is checked to ensure every determinant is a superkey or the dependent attribute is prime.',
      result: normalForms['3NF']
        ? 'The relation satisfies 3NF.'
        : `3NF is violated because of ${
            thirdNFViolation?.dependency ?? 'a transitive dependency'
          }.`,
    });

    // Step 5: BCNF
    const bcnfViolation = violations.find(
      (violation) => violation.normalForm === 'BCNF',
    );

    steps.push({
      step: 5,
      title: 'Check BCNF',
      description: bcnfViolation
        ? bcnfViolation.reason
        : 'The relation is checked to ensure every non-trivial determinant is a superkey.',
      result: normalForms.BCNF
        ? 'The relation satisfies BCNF.'
        : `BCNF is violated because of ${
            bcnfViolation?.dependency ??
            'a determinant that is not a superkey'
          }.`,
    });

    // Step 6: Final Result
    steps.push({
      step: 6,
      title: 'Final Normalization Result',
      description:
        'The highest normal form satisfied by the relation is determined from the previous checks.',
      result: `Highest Normal Form: ${highestNormalForm}`,
    });

    return steps;
  }
}