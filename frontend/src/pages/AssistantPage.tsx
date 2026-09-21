import { AnalysisSkeleton } from '../components/common/AnalysisSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorNotice } from '../components/common/ErrorNotice';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { AssistantPanel } from '../features/assistant/AssistantPanel';
import { PromptLog } from '../features/assistant/PromptLog';
import { SchemaInput } from '../features/normalization/SchemaInput';
import { useNormalizationAnalysis } from '../features/normalization/useNormalizationAnalysis';

export function AssistantPage() {
  const { state, analyze, retry } = useNormalizationAnalysis();

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

        {state.status === 'loading' && <AnalysisSkeleton />}

        {state.status === 'error' && (
          <ErrorNotice message={state.message} onRetry={retry} />
        )}

        {state.status === 'idle' && (
          <EmptyState title="Nothing to normalise yet">
            Enter a schema above and the assistant will work out the relations
            it should become, then let you export the result.
          </EmptyState>
        )}

        {analysis && !analysis.valid && (
          <section className="card-padded">
            <h2 className="section-title">The schema could not be analysed</h2>
            <ul className="notice-error mt-4 space-y-1">
              {analysis.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </section>
        )}

        {analysis?.valid && (
          <AssistantPanel
            analysis={analysis}
            onEdit={() => {
              document.getElementById('schema-input')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            }}
          />
        )}

        <PromptLog />
      </div>
    </PageContainer>
  );
}
