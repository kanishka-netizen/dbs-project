import type { ReactNode } from 'react';

/** Renders a relation as a small table of its attributes. */
export function RelationTable({
  name,
  attributes,
  reason,
  footer,
}: {
  name: string;
  attributes: string[];
  reason?: string;
  footer?: ReactNode;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-baseline justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <h4 className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
          {name}
        </h4>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {attributes.length} attribute{attributes.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 px-4 py-3">
        {attributes.map((attribute) => (
          <span key={attribute} className="chip-neutral">
            {attribute}
          </span>
        ))}
      </div>

      {reason && (
        <p className="border-t border-slate-200 px-4 py-2.5 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
          {reason}
        </p>
      )}

      {footer}
    </div>
  );
}
