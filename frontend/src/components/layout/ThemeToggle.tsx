import { useTheme } from '../../theme/useTheme';
import type { ThemePreference } from '../../theme/theme-context';

interface Option {
  value: ThemePreference;
  label: string;
  hint: string;
}

const OPTIONS: Option[] = [
  { value: 'light', label: 'Day', hint: 'always use day mode' },
  { value: 'dark', label: 'Night', hint: 'always use night mode' },
  { value: 'system', label: 'Auto', hint: 'follow the operating system' },
];

/**
 * Day / night / auto selector — owned by Team 2 (TripleX).
 *
 * A three-way control rather than a two-state toggle, so "follow the system"
 * is something the user can choose and see, rather than a hidden default they
 * only discover by wondering why the app changed colour at sunset.
 */
export function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className="no-print flex items-center gap-0.5 rounded-lg border border-slate-200 p-0.5 dark:border-slate-700"
    >
      {OPTIONS.map((option) => {
        const isActive = preference === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setPreference(option.value)}
            aria-pressed={isActive}
            title={option.hint}
            className={[
              'cursor-pointer rounded-md px-2 py-1 text-xs font-medium transition-colors',
              isActive
                ? 'bg-brand-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
            ].join(' ')}
          >
            <span aria-hidden="true">{option.label}</span>
            <span className="sr-only"> — {option.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
