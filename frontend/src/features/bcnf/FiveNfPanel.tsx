import type { HigherNormalFormResult } from '../../types/normalization';
import { RelationTable } from '../normalization/RelationTable';
import { ViolationList } from '../normalization/ViolationList';

/**
 * 5NF panel — owned by Team 2 (TripleX).
 *
 * 5NF is about join dependencies. A relation is in 5NF when every lossless
 * join dependency it satisfies is implied by its candidate keys — that is, it
 * cannot be split into three or more relations without losing information.
 *
 * The diagram matters more here than in any other panel: the whole idea is
 * that the relation is *exactly* the join of its projections, which is hard to
 * see from a list of cards.
 */
export function FiveNfPanel({
  higherNormalForms,
  allAttributes,
}: {
  higherNormalForms: HigherNormalFormResult;
  allAttributes: string[];
}) {
  const satisfied = higherNormalForms.normalForms['5NF'];
  const fourNfSatisfied = higherNormalForms.normalForms['4NF'];

  const violations = higherNormalForms.violations.filter(
    (violation) => violation.normalForm === '5NF',
  );

  const joinDecomposition = higherNormalForms.decomposition.filter((relation) =>
    relation.name.startsWith('5NF_'),
  );

  return (
    <section aria-labelledby="nf5-heading" className="card-padded">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="nf5-heading" className="section-title">
          Fifth normal form
        </h2>
        <span className={satisfied ? 'badge-pass' : 'badge-fail'}>
          {satisfied ? 'Satisfied' : 'Violated'}
        </span>
      </div>

      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        A relation is in 5NF when it cannot be losslessly decomposed into three
        or more relations. Every join dependency it satisfies must follow from
        its candidate keys.
      </p>

      {/*
       * 5NF implies 4NF, so a relation that fails 4NF cannot be in 5NF. Saying
        * so explicitly stops the two panels from looking contradictory.
       */}
      {!fourNfSatisfied && (
        <p className="notice-warn mb-4" role="note">
          This relation has not reached 4NF yet. Since every 5NF relation is
          also in 4NF, 5NF is out of reach until the multivalued dependency
          above is resolved.
        </p>
      )}

      <ViolationList
        violations={violations}
        emptyMessage="No join dependency breaks 5NF."
      />

      {joinDecomposition.length >= 3 && (
        <>
          <JoinDependencyDiagram
            components={joinDecomposition.map((relation) => relation.attributes)}
            allAttributes={allAttributes}
          />

          <h3 className="mt-6 mb-3 text-sm font-semibold text-slate-900 dark:text-white">
            The three (or more) relations it decomposes into
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {joinDecomposition.map((relation) => (
              <RelationTable
                key={relation.name}
                name={relation.name}
                attributes={relation.attributes}
                reason={relation.reason}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/**
 * Shows the relation as the lossless join of its projections — the join
 * dependency made concrete.
 */
function JoinDependencyDiagram({
  components,
  allAttributes,
}: {
  components: string[][];
  allAttributes: string[];
}) {
  return (
    <figure className="mt-5">
      <figcaption className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
        The join dependency
      </figcaption>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
        <div className="flex flex-wrap items-stretch gap-2">
          {components.map((attributes, index) => (
            <div key={attributes.join('|')} className="flex items-stretch gap-2">
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="self-center px-1 font-mono text-lg text-brand-600 dark:text-brand-400"
                >
                  ⨝
                </span>
              )}
              <span className="chip-brand px-2.5 py-1.5">
                {attributes.join(', ')}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            joined losslessly back into
          </span>
          <span className="chip-neutral px-2.5 py-1.5">
            {allAttributes.join(', ')}
          </span>
        </div>

        <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
          Every fact in the original relation can be reconstructed by joining
          these
          {components.length} relations, so the original stores nothing they do
          not already store.
        </p>
      </div>
    </figure>
  );
}
