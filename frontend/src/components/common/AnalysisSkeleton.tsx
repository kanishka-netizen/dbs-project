/**
 * Loading placeholder for an analysis in flight.
 *
 * Mirrors the shape of the real result so the page does not jump when it
 * arrives. The placeholders are hidden from assistive technology — the
 * accompanying live region carries the actual status.
 */
export function AnalysisSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-8">
      <p className="sr-only" role="status" aria-live="polite">
        Analysing the schema…
      </p>

      <div>
        <div className="mb-4 h-5 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {['1NF', '2NF', '3NF', 'BCNF', '4NF', '5NF'].map((normalForm) => (
            <div
              key={normalForm}
              className="h-[5.5rem] animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
      </div>

      <div className="card-padded">
        <div className="mb-3 h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="flex gap-2">
          <div className="h-7 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-7 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      <div>
        <div className="mb-4 h-5 w-56 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-2">
          <div className="h-16 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-16 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}
