import { FunctionalDependency } from './candidate-key.engine.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class ValidationEngine {
  static validate(
    attributes: string[],
    dependencies: FunctionalDependency[],
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check attributes
    if (attributes.length === 0) {
      errors.push('At least one attribute is required.');
    }

    const duplicateAttributes = attributes.filter(
      (attribute, index) =>
        attributes.indexOf(attribute) !== index,
    );

    if (duplicateAttributes.length > 0) {
      const uniqueDuplicates = [
        ...new Set(duplicateAttributes),
      ];

      errors.push(
        `Duplicate attribute(s): ${uniqueDuplicates.join(', ')}`,
      );
    }

    // Check functional dependencies
    dependencies.forEach((dependency, index) => {
      const dependencyNumber = index + 1;

      if (dependency.left.length === 0) {
        errors.push(
          `Functional dependency ${dependencyNumber} has an empty left-hand side.`,
        );
      }

      if (dependency.right.length === 0) {
        errors.push(
          `Functional dependency ${dependencyNumber} has an empty right-hand side.`,
        );
      }

      const allDependencyAttributes = [
        ...dependency.left,
        ...dependency.right,
      ];

      const unknownAttributes = allDependencyAttributes.filter(
        (attribute) => !attributes.includes(attribute),
      );

      if (unknownAttributes.length > 0) {
        const uniqueUnknownAttributes = [
          ...new Set(unknownAttributes),
        ];

        errors.push(
          `Functional dependency ${dependencyNumber} contains unknown attribute(s): ${uniqueUnknownAttributes.join(', ')}`,
        );
      }

      // Warn about trivial dependencies
      const isTrivial = dependency.right.every((attribute) =>
        dependency.left.includes(attribute),
      );

      if (isTrivial) {
        warnings.push(
          `Functional dependency ${dependencyNumber} is trivial: ${this.formatDependency(dependency)}.`,
        );
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private static formatDependency(
    dependency: FunctionalDependency,
  ): string {
    return `${dependency.left.join(', ')} → ${dependency.right.join(', ')}`;
  }
}