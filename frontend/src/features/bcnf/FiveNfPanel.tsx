import type { HigherNormalFormResult } from '../../types/normalization';
import { RelationTable } from '../normalization/RelationTable';
import { ViolationList } from '../normalization/ViolationList';

/**
 * 5NF panel — owned by Team 2 (TripleX).
 *
 * 5NF is about join dependencies. A relation is in 5NF when every lossless
 * join dependency it satisfies is implied by its candidate keys — that is, it
 * cannot be decomposed into three or more smaller relations without losing
 * information.
 */
export function FiveNfPanel({
  higherNormalForms,
}: {
  higherNormalForms: HigherNormalFormResult;
}) {
  const satisfied = higherNormalForms.normalForms['5NF'];
  const violations = higherNormalForms.violations.filter(
    (violation) => violation.normalForm === '5NF',
  );

  const joinDecomposition = higherNormalForms.decomposition.filter(
    (relation) => relation.name.startsWith('5NF_'),
  );

  return (
    <section aria-labelledby="nf5-heading" className="card-padded">
      <div className="mb-4 flex items-center justify-between gap-3">
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

      <ViolationList
        violations={violations}
        emptyMessage="No join dependency breaks 5NF."
      />

      {joinDecomposition.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
            Lossless 3-way decomposition
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
        </div>
      )}
    </section>
  );
}
