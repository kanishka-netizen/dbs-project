import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { AssistantPanel } from '../features/assistant/AssistantPanel';
import { SchemaInput } from '../features/normalization/SchemaInput';
import { useNormalizationAnalysis } from '../features/normalization/useNormalizationAnalysis';

export function AssistantPage() {
  const { state, analyze } = useNormalizationAnalysis();

  const analysis = state.status === 'success' ? state.response : null;

  return (
    <PageContainer>
      <PageHeader
        title="Automatic normalization assistant"
        subtitle="Paste a schema and get back the normalized relations, ready to export."
        ownedBy="Team 3 — Automatic Normalization"
      />

      <div className="space-y-8">
        <SchemaInput
          onSubmit={analyze}
          isAnalyzing={state.status === 'loading'}
        />

        {state.status === 'error' && (
          <p className="notice-error" role="alert">
            {state.message}
          </p>
        )}

        {analysis && !analysis.valid && (
          <section className="card-padded">
            <h2 className="section-title">
              The schema could not be analysed
            </h2>
            <ul className="notice-error mt-4 space-y-1">
              {analysis.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </section>
        )}

        {analysis?.valid && <AssistantPanel analysis={analysis} />}

        <section className="card-padded">
          <h2 className="section-title">AI prompt log</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Every prompt and response used during development is recorded,
            alongside the generated explanation for each analysis. This panel is
            Team 3&rsquo;s next deliverable.
          </p>
        </section>
      </div>
    </PageContainer>
  );
}
