import { getPromptLog } from './prompt-log';

const TYPE_LABELS = {
  analysis: 'Analysis',
  normalization: 'Normalization',
  verification: 'Verification',
  generation: 'Generation',
} as const;

export function PromptLog() {
  const entries = getPromptLog();

  return (
    <section
      aria-labelledby="prompt-log-heading"
      className="card-padded"
    >
      <div className="mb-4">
        <h2 id="prompt-log-heading" className="section-title">
          AI Prompt Log
        </h2>

        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Analysis requests used by the Automatic Normalization Assistant.
        </p>
      </div>

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <article
            key={entry.id}
            className="flex gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {index + 1}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {TYPE_LABELS[entry.type]}
                </span>

                <time
                  dateTime={entry.timestamp}
                  className="text-xs text-slate-400 dark:text-slate-500"
                >
                  {new Date(entry.timestamp).toLocaleString()}
                </time>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300">
                {entry.prompt}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}