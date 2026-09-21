import type {
  BCNFSplitStep,
  DecomposedRelation,
  DecompositionProperties,
} from '../../types/normalization';
import { RelationTable } from '../normalization/RelationTable';

export interface BcnfProperties extends DecompositionProperties {
  unpreservedDependencies: string[];
}

/**
 * BCNF decomposition view — owned by Team 2 (TripleX).
 *
 * Instead of printing the finished relations as a fait accompli, this walks
 * through each split: which relation was broken, which dependency broke it,
 * and what the two halves became. The dependency-preservation warning is the
 * point of the whole BCNF/3NF comparison — pushing to BCNF can cost you a
 * dependency, and a student should see that happen.
 */
export function BcnfDecompositionView({
  relations,
  steps,
  properties,
}: {
  relations: DecomposedRelation[];
  steps: BCNFSplitStep[];
  properties: BcnfProperties;
}) {
  if (relations.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="bcnf-decomposition-heading">
      <h2 id="bcnf-decomposition-heading" className="section-title">
        BCNF decomposition
      </h2>

      <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
        The analysis algorithm repeatedly finds a dependency whose determinant
        is not a superkey, and replaces the relation with
        <code className="mx-1 font-mono">
          X ∪ Y
        </code>
        and
        <code className="mx-1 font-mono">R − (Y − X)</code>. Because the two
        halves meet at <code className="mx-1 font-mono">X</code> and the
        dependency holds, joining them always reconstructs the original
        relation.
      </p>

      {steps.length === 0 ? (
        <p className="notice-warn">
          This relation already satisfies BCNF — every non-trivial determinant
          is a superkey, so no split was needed.
        </p>
      ) : (
        <ol className="space-y-3">
          {steps.map((step) => (
            <SplitCard key={step.step} step={step} />
          ))}
        </ol>
      )}

      <DependencyLossWarning properties={properties} />

      <h3 className="mt-6 mb-3 text-sm font-semibold text-slate-900 dark:text-white">
        {relations.length === 1
          ? 'Resulting relation'
          : `Resulting relations (${relations.length})`}
      </h3>

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

function SplitCard({ step }: { step: BCNFSplitStep }) {
  return (
    <li
      className="card-padded animate-reveal"
      style={{ animationDelay: `${(step.step - 1) * 90}ms` }}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="badge-info">Step {step.step}</span>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Split
        </span>
        <code className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
          {step.sourceRelation}
        </code>
        <span className="text-sm text-slate-600 dark:text-slate-400">on</span>
        <code className="rounded bg-danger-500/10 px-1.5 py-0.5 font-mono text-sm font-semibold text-danger-600 dark:text-danger-500">
          {step.violatingDependency}
        </code>
      </div>

      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        {step.reason}
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <RelationChip
          name={step.sourceRelation}
          attributes={step.sourceAttributes}
          tone="source"
        />

        <Arrow />

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          {step.produced.map((relation) => (
            <RelationChip
              key={relation.name}
              name={relation.name}
              attributes={relation.attributes}
              tone="product"
            />
          ))}
        </div>
      </div>
    </li>
  );
}

function RelationChip({
  name,
  attributes,
  tone,
}: {
  name: string;
  attributes: string[];
  tone: 'source' | 'product';
}) {
  return (
    <div
      className={[
        'min-w-0 flex-1 rounded-lg border px-3 py-2',
        tone === 'source'
          ? 'border-danger-500/40 bg-danger-500/5'
          : 'border-ok-500/40 bg-ok-500/5',
      ].join(' ')}
    >
      <p className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
        {name}
      </p>
      <p className="mt-1 font-mono text-xs break-words text-slate-600 dark:text-slate-400">
        {attributes.join(', ')}
      </p>
    </div>
  );
}

function Arrow() {
  return (
    <span
      aria-hidden="true"
      className="shrink-0 self-center text-center text-lg leading-none text-slate-400 sm:text-xl"
    >
      <span className="sm:hidden">↓</span>
      <span className="hidden sm:inline">→</span>
    </span>
  );
}

function DependencyLossWarning({ properties }: { properties: BcnfProperties }) {
  if (properties.unpreservedDependencies.length === 0) {
    return (
      <p className="mt-4 text-sm text-ok-600 dark:text-ok-500">
        This decomposition preserves every functional dependency
        {properties.lossless ? ' and is lossless.' : '.'}
      </p>
    );
  }

  return (
    <aside className="notice-warn mt-4" role="note">
      <p className="font-semibold">
        BCNF costs you{' '}
        {properties.unpreservedDependencies.length === 1
          ? 'a dependency'
          : `${properties.unpreservedDependencies.length} dependencies`}
        .
      </p>
      <p className="mt-1">
        The decomposition
        {properties.lossless
          ? ' is lossless, but it cannot check these dependencies without rejoining the relations'
          : ' is not lossless either'}
        :
      </p>
      <ul className="mt-2 list-disc space-y-0.5 pl-5">
        {properties.unpreservedDependencies.map((dependency) => (
          <li key={dependency}>
            <code className="font-mono">{dependency}</code>
          </li>
        ))}
      </ul>
      <p className="mt-2">
        This is the trade-off against 3NF, which always preserves dependencies
        but may leave redundancy behind.
      </p>
    </aside>
  );
}
