import { BcnfDecompositionView } from '../bcnf/BcnfDecompositionView';
import { FiveNfPanel } from '../bcnf/FiveNfPanel';
import { FourNfPanel } from '../four-nf/FourNfPanel';
import type { NormalizationResponse } from '../../types/normalization';
import { orderedVerdicts } from '../../types/normalization';
import { NormalFormStrip } from './NormalFormStrip';
import { RelationTable } from './RelationTable';
import { StepsTimeline } from './StepsTimeline';
import { ViolationList } from './ViolationList';

/**
 * Assembles the full analysis report.
 *
 * Sections marked with an owning team are the extension points each team
 * works in; the surrounding shell is Team 2's.
 */
export function AnalysisResults({
  response,
}: {
  response: NormalizationResponse;
}) {
  if (!response.valid) {
    return (
      <section className="card-padded">
        <h2 className="section-title">The schema could not be analysed</h2>
        <p className="mt-2 mb-4 text-sm text-slate-600 dark:text-slate-400">
          The analyser rejected this input. Fix the problems below and run the
          analysis again.
        </p>

        <ul className="notice-error space-y-1">
          {response.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </section>
    );
  }

  const verdicts = orderedVerdicts(response);

  return (
    <div className="space-y-8">
      {/*
       * The result replaces the whole panel when it arrives, which a screen
       * reader would otherwise not notice. One short sentence is enough — a
       * live region wrapped around the entire report would be unusable.
       */}
      <p className="sr-only" role="status" aria-live="polite">
        Analysis complete. The relation {response.relation} is in{' '}
        {response.highestNormalForm}.
      </p>

      <div className="print-only">
        <h1 className="text-xl font-bold">
          Normalization analysis — {response.relation}
        </h1>
        <p className="mt-1 text-sm">
          Highest normal form: {response.highestNormalForm}
        </p>
      </div>

      <section aria-labelledby="verdicts-heading">
        <h2 id="verdicts-heading" className="section-title mb-4">
          Normal form coverage
        </h2>
        <NormalFormStrip
          verdicts={verdicts}
          highestNormalForm={response.highestNormalForm}
        />
      </section>

      {response.warnings.length > 0 && (
        <ul className="notice-warn space-y-1">
          {response.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}

      <section aria-labelledby="keys-heading" className="card-padded">
        <h2 id="keys-heading" className="section-title mb-3">
          Candidate keys
        </h2>

        {response.candidateKeys.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No candidate key was found for this schema.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {response.candidateKeys.map((key) => (
              <li key={key.join('|')} className="chip-brand px-3 py-1.5">
                {'{'}
                {key.join(', ')}
                {'}'}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="violations-heading">
        <h2 id="violations-heading" className="section-title mb-4">
          What breaks each normal form
        </h2>
        <ViolationList
          violations={response.violations}
          emptyMessage="No functional dependency violates 2NF, 3NF or BCNF."
        />
      </section>

      {response.decomposition.length > 0 && (
        <section aria-labelledby="decomposition-heading">
          <h2 id="decomposition-heading" className="section-title mb-4">
            Decomposition toward {response.highestNormalForm}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {response.decomposition.map((relation) => (
              <RelationTable
                key={relation.name}
                name={relation.name}
                attributes={relation.attributes}
                reason={relation.reason}
              />
            ))}
          </div>
        </section>
      )}

      <BcnfDecompositionView
        relations={response.bcnfDecomposition}
        steps={response.bcnfSteps}
        properties={response.bcnfProperties}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <FourNfPanel higherNormalForms={response.higherNormalForms} />
        <FiveNfPanel
          higherNormalForms={response.higherNormalForms}
          allAttributes={response.attributes}
        />
      </div>

      <section aria-labelledby="steps-heading">
        <h2 id="steps-heading" className="section-title mb-4">
          Step by step
        </h2>
        <StepsTimeline steps={response.steps} />
      </section>
    </div>
  );
}
