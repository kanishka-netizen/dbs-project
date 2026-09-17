import type {
  HigherNormalFormViolation,
  NormalFormViolation,
} from '../../types/normalization';

type Violation = NormalFormViolation | HigherNormalFormViolation;

/** Lists the dependencies that break each normal form. */
export function ViolationList({
  violations,
  emptyMessage,
}: {
  violations: Violation[];
  emptyMessage: string;
}) {
  if (violations.length === 0) {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {violations.map((violation) => (
        <li
          key={`${violation.normalForm}-${violation.dependency}`}
          className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-fail">{violation.normalForm}</span>
            <code className="font-mono text-sm text-slate-900 dark:text-slate-100">
              {violation.dependency}
            </code>
          </div>

          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
            {violation.reason}
          </p>
        </li>
      ))}
    </ul>
  );
}
