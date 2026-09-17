import { downloadFile } from '../../lib/download';
import type { NormalizationAnalysis } from '../../types/normalization';
import { RelationTable } from '../normalization/RelationTable';
import { resolveNormalizedSchema } from '../normalization/resolve-normalized-schema';

const SOURCE_LABEL: Record<string, string> = {
  'higher-normal-form': '4NF / 5NF decomposition',
  bcnf: 'BCNF decomposition',
  '2nf-3nf': '2NF / 3NF decomposition',
  'already-normalized': 'no decomposition needed',
};

/**
 * The automatic normalization assistant — owned by Team 3.
 *
 * Produces the target schema, offers a report download, and is the place the
 * AI prompt log attaches.
 */
export function AssistantPanel({
  analysis,
}: {
  analysis: NormalizationAnalysis;
}) {
  const normalized = resolveNormalizedSchema(analysis);

  function exportJson() {
    const report = {
      generatedAt: new Date().toISOString(),
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

    downloadFile(
      `${analysis.relation}-normalization-report.json`,
      JSON.stringify(report, null, 2),
      'application/json',
    );
  }

  return (
    <section aria-labelledby="assistant-heading" className="card-padded">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="assistant-heading" className="section-title">
            Normalized schema
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Derived from: {SOURCE_LABEL[normalized.source]}.
          </p>
        </div>

        <button type="button" className="btn-primary" onClick={exportJson}>
          Download report
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {normalized.relations.map((relation) => (
          <RelationTable
            key={relation.name}
            name={relation.name}
            attributes={relation.attributes}
            reason={relation.reason}
          />
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        The full report, PDF export and the AI prompt log are Team 3&rsquo;s
        next steps.
      </p>
    </section>
  );
}
