import type { DecomposedRelation } from '../../types/normalization';
import { RelationTable } from '../normalization/RelationTable';

/**
 * BCNF decomposition view — owned by Team 2 (TripleX).
 *
 * Shows the relations produced by the BCNF analysis algorithm. Each split is
 * driven by a functional dependency whose determinant is not a superkey.
 */
export function BcnfDecompositionView({
  relations,
}: {
  relations: DecomposedRelation[];
}) {
  if (relations.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="bcnf-decomposition-heading">
      <h2 id="bcnf-decomposition-heading" className="section-title">
        BCNF decomposition
      </h2>
      <p className="mt-2 mb-4 text-sm text-slate-600 dark:text-slate-400">
        Each relation below is in BCNF. The algorithm repeatedly removes a
        violating dependency by splitting the relation into
        <code className="mx-1 font-mono">X ∪ Y</code> and
        <code className="mx-1 font-mono">R - (Y - X)</code>.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {relations.map((relation) => (
          <RelationTable
            key={relation.name}
            name={relation.name}
            attributes={relation.attributes}
            reason={relation.reason}
          />
        ))}
      </div>
    </section>
  );
}
