import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { AnalysisResults } from '../features/normalization/AnalysisResults';
import { SchemaInput } from '../features/normalization/SchemaInput';
import { useNormalizationAnalysis } from '../features/normalization/useNormalizationAnalysis';

export function VisualizerPage() {
  const { state, analyze } = useNormalizationAnalysis();

  return (
    <PageContainer>
      <PageHeader
        title="Normalization visualizer"
        subtitle="Describe a relation and its dependencies, then step through every normal form from 1NF to 5NF."
        ownedBy="Team 1 — 1NF to 4NF · Team 2 — BCNF and 5NF"
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

        {state.status === 'success' && (
          <AnalysisResults response={state.response} />
        )}
      </div>
    </PageContainer>
  );
}
