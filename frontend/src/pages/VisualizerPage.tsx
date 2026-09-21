import { AnalysisSkeleton } from '../components/common/AnalysisSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorNotice } from '../components/common/ErrorNotice';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { AnalysisResults } from '../features/normalization/AnalysisResults';
import { SchemaInput } from '../features/normalization/SchemaInput';
import { useNormalizationAnalysis } from '../features/normalization/useNormalizationAnalysis';

export function VisualizerPage() {
  const { state, analyze, retry } = useNormalizationAnalysis();

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

        {state.status === 'loading' && <AnalysisSkeleton />}

        {state.status === 'error' && (
          <ErrorNotice message={state.message} onRetry={retry} />
        )}

        {state.status === 'idle' && (
          <EmptyState title="Nothing analysed yet">
            Write a schema above, or load one of the examples, then choose{' '}
            <span className="font-medium">Analyse schema</span>. The result
            shows every normal form from 1NF to 5NF, why the weakest one fails,
            and how the relation decomposes.
          </EmptyState>
        )}

        {state.status === 'success' && (
          <AnalysisResults response={state.response} />
        )}
      </div>
    </PageContainer>
  );
}
