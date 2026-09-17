import { FunctionalDependency } from './candidate-key.engine.js';
import { HigherNormalFormResult } from './higher-nf.types.js';

export interface NormalizationStep {
  step: number;
  title: string;
  description: string;
  result: string;
}

type UnnumberedStep = Omit<NormalizationStep, 'step'>;

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
    higherNormalForms?: HigherNormalFormResult,
  ): NormalizationStep[] {
    const steps: UnnumberedStep[] = [];

    // Candidate keys
    const keyText =
      candidateKeys.length > 0
        ? candidateKeys
            .map((key) => `{${key.join(', ')}}`)
            .join(', ')
        : 'No candidate key found';

    steps.push({
      title: 'Find Candidate Keys',
      description:
        'Candidate keys are identified using attribute closure and functional dependencies.',
      result: `Candidate Key(s): ${keyText}`,
    });

    // 1NF
    steps.push({
      title: 'Check 1NF',
      description:
        'The relation is checked for atomic attributes and repeating groups.',
      result: normalForms['1NF']
        ? 'The relation satisfies 1NF.'
        : 'The relation does not satisfy 1NF.',
    });

    // 2NF
    const secondNFViolation = violations.find(
      (violation) => violation.normalForm === '2NF',
    );

    steps.push({
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

    // 3NF
    const thirdNFViolation = violations.find(
      (violation) => violation.normalForm === '3NF',
    );

    steps.push({
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

    // BCNF
    const bcnfViolation = violations.find(
      (violation) => violation.normalForm === 'BCNF',
    );

    steps.push({
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

    // 4NF and 5NF
    if (higherNormalForms) {
      const fourthNFViolation = higherNormalForms.violations.find(
        (violation) => violation.normalForm === '4NF',
      );

      steps.push({
        title: 'Check 4NF',
        description: fourthNFViolation
          ? fourthNFViolation.reason
          : 'Every non-trivial multivalued dependency is checked for a superkey on its left-hand side.',
        result: higherNormalForms.normalForms['4NF']
          ? 'The relation satisfies 4NF.'
          : `4NF is violated because of ${
              fourthNFViolation?.dependency ??
              'a multivalued dependency whose determinant is not a superkey'
            }.`,
      });

      const fifthNFViolation = higherNormalForms.violations.find(
        (violation) => violation.normalForm === '5NF',
      );

      steps.push({
        title: 'Check 5NF',
        description: fifthNFViolation
          ? fifthNFViolation.reason
          : 'The relation is checked for a lossless join dependency that its candidate keys do not imply.',
        result: higherNormalForms.normalForms['5NF']
          ? 'The relation satisfies 5NF.'
          : `5NF is violated because of ${
              fifthNFViolation?.dependency ??
              'a lossless join dependency'
            }.`,
      });
    }

    // Final result
    const overallHighestForm =
      higherNormalForms?.highestNormalForm ?? highestNormalForm;

    steps.push({
      title: 'Final Normalization Result',
      description:
        'The highest normal form satisfied by the relation is determined from the previous checks.',
      result: `Highest Normal Form: ${overallHighestForm}`,
    });

    return steps.map((step, index) => ({ step: index + 1, ...step }));
  }
}
