import type { HigherNormalFormResult } from '../../types/normalization';
import { RelationTable } from '../normalization/RelationTable';
import { ViolationList } from '../normalization/ViolationList';

/**
 * 4NF panel — owned by Team 1 (TLE).
 *
 * 4NF is about multivalued dependencies: for every non-trivial MVD `X ->> Y`,
 * `X` must be a superkey.
 */
export function FourNfPanel({
  higherNormalForms,
}: {
  higherNormalForms: HigherNormalFormResult;
}) {
  const satisfied = higherNormalForms.normalForms['4NF'];
  const violations = higherNormalForms.violations.filter(
    (violation) => violation.normalForm === '4NF',
  );
  const relations = higherNormalForms.decomposition.filter((relation) =>
    relation.name.startsWith('4NF_'),
  );

  return (
    <section aria-labelledby="nf4-heading" className="card-padded">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="nf4-heading" className="section-title">
          Fourth normal form
        </h2>
        <span className={satisfied ? 'badge-pass' : 'badge-fail'}>
          {satisfied ? 'Satisfied' : 'Violated'}
        </span>
      </div>

      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        A relation is in 4NF when every non-trivial multivalued dependency
        <code className="mx-1 font-mono">X -&gt;&gt; Y</code>
        has a superkey on its left-hand side.
      </p>

      <ViolationList
        violations={violations}
        emptyMessage="No multivalued dependency breaks 4NF."
      />

      {relations.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
            Suggested 4NF relations
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {relations.map((relation) => (
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
