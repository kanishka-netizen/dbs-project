import type { NormalizationStep } from '../../types/normalization';

/** The numbered walkthrough the backend returns alongside the verdicts. */
export function StepsTimeline({ steps }: { steps: NormalizationStep[] }) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <ol className="space-y-4">
      {steps.map((step) => (
        <li key={step.step} className="flex gap-4">
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand-600 font-mono text-xs font-bold text-white">
            {step.step}
          </span>

          <div className="min-w-0 flex-1 border-b border-slate-200 pb-4 last:border-b-0 dark:border-slate-800">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              {step.title}
            </h4>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {step.description}
            </p>
            <p className="mt-1.5 font-mono text-sm text-brand-700 dark:text-brand-300">
              {step.result}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
