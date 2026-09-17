import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { AssistantPanel } from '../features/assistant/AssistantPanel';
import { SchemaInput } from '../features/normalization/SchemaInput';
import { useNormalizationAnalysis } from '../features/normalization/useNormalizationAnalysis';
import { PromptLog } from '../features/assistant/PromptLog';

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