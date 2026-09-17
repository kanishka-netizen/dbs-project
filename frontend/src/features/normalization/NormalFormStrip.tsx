import type { NormalForm } from '../../types/normalization';

export interface NormalFormVerdict {
  normalForm: NormalForm;
  satisfied: boolean;
}

/**
 * The 1NF → 5NF status strip.
 *
 * Team 1 (TLE) owns the 1NF–4NF badges; Team 2 (TripleX) owns BCNF and 5NF
 * and the highlighting of the highest form reached.
 */
export function NormalFormStrip({
  verdicts,
  highestNormalForm,
}: {
  verdicts: NormalFormVerdict[];
  highestNormalForm: NormalForm;
}) {
  return (
    <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {verdicts.map(({ normalForm, satisfied }) => {
        const isHighest = normalForm === highestNormalForm;

        return (
          <li
            key={normalForm}
            className={[
              'rounded-xl border px-3 py-3 text-center',
              satisfied
                ? 'border-ok-500/40 bg-ok-500/10'
                : 'border-danger-500/40 bg-danger-500/10',
              isHighest
                ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-950'
                : '',
            ].join(' ')}
          >
            <p className="font-mono text-base font-bold text-slate-900 dark:text-white">
              {normalForm}
            </p>

            <p
              className={[
                'mt-1 text-xs font-semibold',
                satisfied
                  ? 'text-ok-600 dark:text-ok-500'
                  : 'text-danger-600 dark:text-danger-500',
              ].join(' ')}
            >
              {satisfied ? 'Satisfied' : 'Violated'}
            </p>

            {isHighest && (
              <p className="mt-1 text-[0.65rem] font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-400">
                Highest
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
