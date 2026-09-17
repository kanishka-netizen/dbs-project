import type { NormalizationAnalysis } from '../../types/normalization';
import { resolveNormalizedSchema } from '../normalization/resolve-normalized-schema';

export interface NormalizationReport {
  generatedAt: string;
  relation: string;
  originalAttributes: string[];
  functionalDependencies: NormalizationAnalysis['functionalDependencies'];
  multivaluedDependencies: NormalizationAnalysis['multivaluedDependencies'];
  candidateKeys: string[][];
  highestNormalForm: NormalizationAnalysis['highestNormalForm'];
  normalForms: Record<string, unknown>;
  violations: NormalizationAnalysis['violations'];
  normalizedSchema: ReturnType<typeof resolveNormalizedSchema>['relations'];
}

export function buildNormalizationReport(
  analysis: NormalizationAnalysis,
  generatedAt: string,
): NormalizationReport {
  const normalized = resolveNormalizedSchema(analysis);

  return {
    generatedAt,
    relation: analysis.relation,
    originalAttributes: analysis.attributes,
    functionalDependencies: analysis.functionalDependencies,
    multivaluedDependencies: analysis.multivaluedDependencies,
    candidateKeys: analysis.candidateKeys,
    highestNormalForm: analysis.highestNormalForm,
    normalForms: {
      ...analysis.normalForms,
      ...analysis.higherNormalForms.normalForms,
    },
    violations: [
      ...analysis.violations,
      ...analysis.higherNormalForms.violations,
    ],
    normalizedSchema: normalized.relations,
  };
}

export function buildJsonReport(
  analysis: NormalizationAnalysis,
  generatedAt: string,
): string {
  return JSON.stringify(
    buildNormalizationReport(analysis, generatedAt),
    null,
    2,
  );
}

export function buildMarkdownReport(
  analysis: NormalizationAnalysis,
  generatedAt: string,
): string {
  const report = buildNormalizationReport(analysis, generatedAt);

  const functionalDependencies =
    report.functionalDependencies.length > 0
      ? report.functionalDependencies
          .map(
            (fd) =>
              `- ${fd.left.join(', ')} → ${fd.right.join(', ')}`,
          )
          .join('\n')
      : '- None';

  const multivaluedDependencies =
    report.multivaluedDependencies.length > 0
      ? report.multivaluedDependencies
          .map(
            (mvd) =>
              `- ${mvd.left.join(', ')} →→ ${mvd.right.join(', ')}`,
          )
          .join('\n')
      : '- None';

  const candidateKeys =
    report.candidateKeys.length > 0
      ? report.candidateKeys
          .map((key) => `- ${key.join(', ')}`)
          .join('\n')
      : '- None';

  const violations =
    report.violations.length > 0
      ? report.violations
          .map(
            (violation) =>
              `- **${violation.normalForm}**: ${violation.reason}`,
          )
          .join('\n')
      : '- None';

  const normalForms = Object.entries(report.normalForms)
    .map(
      ([normalForm, status]) =>
        `- **${normalForm}**: ${String(status)}`,
    )
    .join('\n');

  const normalizedSchema = report.normalizedSchema
    .map(
      (relation) =>
        `### ${relation.name}\n\n` +
        `**Attributes:** ${relation.attributes.join(', ')}\n\n` +
        `**Reason:** ${relation.reason}`,
    )
    .join('\n\n');

  return `# Normalization Report

**Relation:** ${report.relation}  
**Generated:** ${report.generatedAt}  
**Highest Normal Form:** ${report.highestNormalForm}

## Original Attributes

${report.originalAttributes.join(', ')}

## Functional Dependencies

${functionalDependencies}

## Multivalued Dependencies

${multivaluedDependencies}

## Candidate Keys

${candidateKeys}

## Normal Forms

${normalForms}

## Violations

${violations}

## Normalized Schema

${normalizedSchema}
`;
}