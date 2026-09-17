import { downloadFile } from '../../lib/download';
import type { NormalizationAnalysis } from '../../types/normalization';
import { RelationTable } from '../normalization/RelationTable';
import { resolveNormalizedSchema } from '../normalization/resolve-normalized-schema';
import {
  buildJsonReport,
  buildMarkdownReport,
} from './report';

const SOURCE_LABEL: Record<string, string> = {
  'higher-normal-form': '4NF / 5NF decomposition',
  bcnf: 'BCNF decomposition',
  '2nf-3nf': '2NF / 3NF decomposition',
  'already-normalized': 'no decomposition needed',
};

/**
 * The automatic normalization assistant — owned by Team 3.
 *
 * Produces the target schema, shows the normalization path,
 * and provides JSON and Markdown report exports.
 */
export function AssistantPanel({
  analysis,
}: {
  analysis: NormalizationAnalysis;
}) {
  const normalized = resolveNormalizedSchema(analysis);

  function exportJson() {
  const generatedAt = new Date().toISOString();
  const report = buildJsonReport(analysis, generatedAt);

  downloadFile(
    `${analysis.relation}-normalization-report.json`,
    report,
    'application/json',
  );
}

function exportMarkdown() {
  const generatedAt = new Date().toISOString();
  const report = buildMarkdownReport(analysis, generatedAt);

  downloadFile(
    `${analysis.relation}-normalization-report.md`,
    report,
    'text/markdown',
  );
}

  return (
    <section aria-labelledby="assistant-heading" className="card-padded">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="assistant-heading" className="section-title">
            Normalized schema
          </h2>

          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Derived from: {SOURCE_LABEL[normalized.source]}
          </p>
        </div>

        {/* Export buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary"
            onClick={exportJson}
          >
            Download JSON
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={exportMarkdown}
          >
            Download Markdown
          </button>
        </div>
      </div>

      {/* Normalization path */}
      {analysis.steps.length > 0 && (
        <section
          aria-labelledby="normalization-path-heading"
          className="mb-8"
        >
          <div className="mb-5">
            <h3
              id="normalization-path-heading"
              className="section-title"
            >
              Normalization Path
            </h3>

            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Follow how the relation is analysed and normalized step by
              step.
            </p>
          </div>

          <div className="space-y-4">
            {analysis.steps.map((step, index) => (
              <div key={step.step} className="relative">
                {index < analysis.steps.length - 1 && (
                  <div className="absolute left-5 top-12 h-6 w-px bg-slate-300 dark:bg-slate-700" />
                )}

                <div className="relative rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex gap-4">
                    {/* Step number */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                      {step.step}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="text-lg font-semibold">
                          {step.title}
                        </h4>

                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
                          Step {step.step}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {step.description}
                      </p>

                      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Result
                        </p>

                        <p className="mt-1 text-sm font-medium text-blue-700 dark:text-blue-300">
                          {step.result}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Normalized relations */}
      <section aria-labelledby="normalized-relations-heading">
        <div className="mb-4">
          <h3
            id="normalized-relations-heading"
            className="text-xl font-semibold"
          >
            Resulting Relations
          </h3>

          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Relations produced by the normalization process.
          </p>
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
      </section>

      {/* Export information */}
      <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
        Export the normalization analysis as JSON or Markdown for
        documentation and submission.
      </p>
    </section>
  );
}