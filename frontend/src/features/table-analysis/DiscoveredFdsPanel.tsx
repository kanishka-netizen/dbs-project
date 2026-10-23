import { useState } from 'react';
import type { DiscoveredFD } from './table-types';

interface DiscoveredFdsPanelProps {
  discoveredFds: DiscoveredFD[];
  candidateKeys: string[][];
  onSelectConflict?: (conflictRows: [number, number] | undefined) => void;
  selectedFds: DiscoveredFD[];
  onToggleFd: (fd: DiscoveredFD) => void;
  onVerifyCustomFd: (left: string[], right: string[]) => void;
  allColumns: string[];
}

export function DiscoveredFdsPanel({
  discoveredFds,
  candidateKeys,
  onSelectConflict,
  selectedFds,
  onToggleFd,
  onVerifyCustomFd,
  allColumns,
}: DiscoveredFdsPanelProps) {
  const [customLeft, setCustomLeft] = useState('');
  const [customRight, setCustomRight] = useState('');
  const [activeConflict, setActiveConflict] = useState<[number, number] | undefined>(undefined);

  function handleSelectConflict(rows: [number, number] | undefined) {
    setActiveConflict(rows);
    if (onSelectConflict) {
      onSelectConflict(rows);
    }
  }

  function handleCustomSubmit() {
    const leftAttrs = customLeft
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const rightAttrs = customRight
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (leftAttrs.length > 0 && rightAttrs.length > 0) {
      onVerifyCustomFd(leftAttrs, rightAttrs);
      setCustomLeft('');
      setCustomRight('');
    }
  }

  function isSelected(fd: DiscoveredFD): boolean {
    return selectedFds.some(
      (s) =>
        s.left.join(',') === fd.left.join(',') &&
        s.right.join(',') === fd.right.join(','),
    );
  }

  return (
    <div className="space-y-6">
      {/* Candidate Keys from Data */}
      <div className="card-padded">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
          Candidate Keys Discovered in Table Data
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Minimal column subsets whose values are uniquely identified across all tuples:
        </p>

        {candidateKeys.length === 0 ? (
          <p className="text-xs text-slate-500">No candidate key found.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {candidateKeys.map((key) => (
              <span key={key.join(',')} className="chip-brand px-3 py-1 font-mono text-xs">
                🔑 {'{' + key.join(', ') + '}'}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Discovered FDs List */}
      <div className="card-padded">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Functional Dependencies in Table Instance ({discoveredFds.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Discovered from rows. Check the box to include in normalization analysis:
            </p>
          </div>
        </div>

        {discoveredFds.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">
            No non-trivial functional dependencies were detected in this table.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            {discoveredFds.map((fd, idx) => {
              const selected = isSelected(fd);
              const isViolated = !fd.holds;
              const isViewingConflict =
                activeConflict &&
                fd.conflictingRows &&
                activeConflict[0] === fd.conflictingRows[0] &&
                activeConflict[1] === fd.conflictingRows[1];

              return (
                <div
                  key={idx}
                  className={`p-3 transition-colors ${
                    isViolated
                      ? 'bg-amber-50/50 dark:bg-amber-950/20'
                      : selected
                        ? 'bg-purple-50/30 dark:bg-purple-950/20'
                        : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected}
                        disabled={isViolated}
                        onChange={() => onToggleFd(fd)}
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 dark:border-slate-700"
                      />
                      <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                        {fd.left.join(', ')} → {fd.right.join(', ')}
                      </span>
                    </label>

                    <div className="flex items-center gap-2">
                      {isViolated ? (
                        <>
                          <span className="chip-danger text-[10px] font-bold">
                            Violated by Data
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectConflict(
                                isViewingConflict ? undefined : fd.conflictingRows,
                              )
                            }
                            className="btn btn-secondary py-0.5 px-2 text-[10px]"
                          >
                            {isViewingConflict ? 'Hide Conflict' : 'Show Conflict'}
                          </button>
                        </>
                      ) : (
                        <span className="chip-success text-[10px] font-bold">
                          ✓ Holds in Data
                        </span>
                      )}
                    </div>
                  </div>

                  {fd.conflictExplanation && isViewingConflict && (
                    <div className="mt-2 rounded bg-amber-100 p-2 text-xs text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 font-sans">
                      ⚠️ {fd.conflictExplanation} (Highlighted in the table grid above).
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Custom FD Tester */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
            Test a Specific Functional Dependency on this Table:
          </h4>
          <p className="text-[11px] text-slate-500 mb-2">
            Enter column names to verify if an integrity rule holds on the dataset:
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder={`LHS (e.g. ${allColumns[0] || 'A'})`}
              value={customLeft}
              onChange={(e) => setCustomLeft(e.target.value)}
              className="input py-1 text-xs max-w-[160px]"
            />
            <span className="text-slate-500 font-mono">→</span>
            <input
              type="text"
              placeholder={`RHS (e.g. ${allColumns[1] || 'B'})`}
              value={customRight}
              onChange={(e) => setCustomRight(e.target.value)}
              className="input py-1 text-xs max-w-[160px]"
            />
            <button
              type="button"
              onClick={handleCustomSubmit}
              className="btn btn-secondary py-1 text-xs"
            >
              Check FD on Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
