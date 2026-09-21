import type { ReactNode } from 'react';

/** Shown before anything has been analysed, so the panel is never blank. */
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="card-padded text-center">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">
        {title}
      </h2>

      {children && (
        <div className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          {children}
        </div>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
